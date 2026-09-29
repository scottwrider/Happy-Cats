import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { getSeedCatalogue, lineTotal } from "../src/lib/catalogue";
import {
  PRICE_CHECK_MAX_BYTES,
  assertAllowedPriceCheckUrl,
  PriceCheckError,
} from "../src/lib/price-check-policy";
import { runPriceCheck } from "../src/lib/run-price-check";

const catalogue = getSeedCatalogue();

describe("seeded household", () => {
  test("names the cats, the postcode, and the consumption estimate", () => {
    expect(catalogue.pets.map((pet) => `${pet.name} ${pet.sex} ${pet.ageLabel}`)).toEqual([
      "Sushi male about 4 years old",
      "Miso female about 1 year old",
    ]);
    expect(catalogue.household.postcode).toBe("28004");
    expect(catalogue.household.city).toBe("Madrid");
    expect(catalogue.household.portionsLabel).toBe("6–8 wet portions a day");
    expect(catalogue.household.flavoursPerDay).toBe(4);
  });

  test("lists brands with Retorn first and keeps the model generic", () => {
    expect(catalogue.brands.map((brand) => brand.name)).toEqual(["Retorn", "Canagan"]);
    expect(catalogue.categories.map((category) => category.id)).toEqual(["wet-food"]);
    expect(catalogue.brands.every((brand) => brand.categoryId === "wet-food")).toBe(true);
  });

  test("covers the named retailers and records ZOOCITY as historical", () => {
    expect(catalogue.retailers.map((retailer) => retailer.name)).toEqual([
      "Naturanimal",
      "TodoMascota",
      "Retorn",
      "Canagan Spain",
      "MascotaSana",
      "ZOOCITY",
      "El Corte Inglés",
      "Carrefour marketplace",
      "Zooplus",
      "Nutritienda",
    ]);
    const loyalty = catalogue.loyalty[0];
    expect(loyalty?.points).toBe(154);
    expect(loyalty?.live).toBe(false);
    expect(
      catalogue.retailers.find((retailer) => retailer.id === "zoocity")?.deliversToHousehold,
    ).toBe(true);
  });

  test("seeds the benchmark receipts and no invented live prices", () => {
    const naturanimal = catalogue.purchases.find(
      (purchase) => purchase.id === "naturanimal-2026-09-03",
    );
    const todo = catalogue.purchases.find((purchase) => purchase.id === "todomascota-2026-03-31");
    expect(naturanimal?.lines.map((line) => [line.label, line.total])).toEqual([
      ["Retorn chicken 80 g", 1.55],
      ["Retorn tuna/salmon 80 g", 1.85],
      ["Canagan chicken/beef 75 g", 1.95],
      ["Canagan chicken/sardines 75 g", 1.95],
      ["Canagan tuna/salmon 75 g", 1.95],
    ]);
    expect(naturanimal?.total).toBe(9.25);
    expect(todo?.lines.map((line) => [line.qty, line.total])).toEqual([
      [24, 36.83],
      [18, 23.94],
      [18, 23.94],
    ]);
    expect(todo?.total).toBe(84.71);
    expect(todo?.note).toContain("Free delivery");

    for (const brand of catalogue.brands) {
      for (const product of brand.products) {
        for (const listing of product.listings) {
          expect(listing.trust).toBe("receipt");
          expect(listing.writtenByPriceCheck).toBe(false);
          expect(lineTotal(listing.unitPrice, listing.unitsPerPack)).toBe(listing.packTotal);
        }
      }
    }
  });

  test("flags prawns as excluded and vegetables as review", () => {
    const products = catalogue.brands.flatMap((brand) => brand.products);
    expect(products.find((product) => product.id === "retorn-tuna-prawn")?.status).toBe("excluded");
    expect(products.find((product) => product.id === "canagan-chicken-vegetables")?.status).toBe(
      "review",
    );
    expect(catalogue.preferenceRules.some((rule) => rule.text === "Prawns")).toBe(true);
    expect(catalogue.preferenceRules.some((rule) => rule.text.includes("vegetables"))).toBe(true);
  });
});

describe("public page check", () => {
  test("allows only listed https hosts and refuses redirects by contract", async () => {
    expect(assertAllowedPriceCheckUrl("https://naturanimal.es/tienda")).toBe(
      "https://naturanimal.es/tienda",
    );
    expect(assertAllowedPriceCheckUrl("https://www.zooplus.es/shop")).toBe(
      "https://www.zooplus.es/shop",
    );
    expect(() => assertAllowedPriceCheckUrl("http://naturanimal.es")).toThrow(PriceCheckError);
    expect(() => assertAllowedPriceCheckUrl("https://user:pass@naturanimal.es")).toThrow(
      PriceCheckError,
    );
    expect(() => assertAllowedPriceCheckUrl("https://example.com")).toThrow(PriceCheckError);
    expect(() => assertAllowedPriceCheckUrl("https://naturanimal.es.evil.com")).toThrow(
      PriceCheckError,
    );
    expect(() => assertAllowedPriceCheckUrl("https://127.0.0.1")).toThrow(PriceCheckError);

    let called = false;
    const blocked = await runPriceCheck("https://example.com/price", async () => {
      called = true;
      throw new Error("should not fetch");
    });
    expect(called).toBe(false);
    expect(blocked.savedUnitPrice).toBeNull();
    expect(blocked.ok).toBe(false);
  });

  test("caps the read, refuses redirects, and never returns a saved price", async () => {
    const html = `<html><head><title>Retorn chicken</title></head><body><p>Price €1,55 and 1.95 €</p><script>€9,99</script></body></html>`;
    const seen: RequestInit[] = [];
    const ok = await runPriceCheck("https://todomascota.es/retorn", async (_input, init) => {
      seen.push(init ?? {});
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
    });
    expect(seen[0]?.redirect).toBe("error");
    expect(seen[0]?.cache).toBe("no-store");
    expect(seen[0]?.signal).toBeTruthy();
    expect(ok.ok).toBe(true);
    expect(ok.savedUnitPrice).toBeNull();
    expect(ok.title).toBe("Retorn chicken");
    expect(ok.priceHints).toEqual(["€1,55", "1.95 €"]);

    const big = "€1,00 ".repeat(PRICE_CHECK_MAX_BYTES);
    const capped = await runPriceCheck("https://retorn.com/pouch", async () => {
      return new Response(big, { headers: { "content-type": "text/plain" } });
    });
    expect(capped.truncated).toBe(true);
    expect(capped.bytesRead).toBe(PRICE_CHECK_MAX_BYTES);
    expect(capped.savedUnitPrice).toBeNull();

    const redirected = await runPriceCheck("https://canagan.es/gatos", async () => {
      throw new TypeError("redirect mode is set to error");
    });
    expect(redirected.ok).toBe(false);
    expect(redirected.message).toContain("Redirects are blocked");
    expect(redirected.savedUnitPrice).toBeNull();
  });

  test("the check module has no write path", () => {
    const source = readFileSync(new URL("../src/lib/run-price-check.ts", import.meta.url), "utf8");
    expect(source.includes("localStorage.getItem")).toBe(false);
    expect(source.includes("localStorage.setItem")).toBe(false);
    expect(source.includes("price_observations")).toBe(false);
    expect(source.includes("savedUnitPrice: null")).toBe(true);
    const schema = readFileSync(new URL("../src/db/schema.sql", import.meta.url), "utf8");
    expect(schema).toContain("CHECK (written_by_price_check = 0)");
  });
});
