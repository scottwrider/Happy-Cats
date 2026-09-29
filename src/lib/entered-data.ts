import type {
  Brand,
  Listing,
  Membership,
  Product,
  Purchase,
  SavedOffer,
  TrustLevel,
} from "./catalogue";

export type BasketItem = {
  listingId: string;
  productId: string;
  qty: number;
};

const TRUST: readonly TrustLevel[] = ["verified", "manual", "receipt"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const clampInt = (value: unknown, min: number, max: number, fallback: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
};

const DEFAULT_FAVOURITES = ["retorn-chicken", "retorn-tuna-salmon"];

export function parseFavourites(value: unknown): string[] {
  return parseStringList(value) ?? DEFAULT_FAVOURITES;
}

export function parseStringList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every((item) => typeof item === "string" && item.length > 0 && item.length < 80)) {
    return null;
  }
  return value;
}

export function parseStock(value: unknown): number {
  return clampInt(value, 0, 999, 0);
}

export function parseMoneyOrNull(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0 || value > 10000) return null;
  return Math.round(value * 100) / 100;
}

function read(record: Record<string, unknown>, key: string) {
  return record[key];
}

function readString(record: Record<string, unknown>, key: string) {
  const value = read(record, key);
  return typeof value === "string" ? value : null;
}

function readNumber(record: Record<string, unknown>, key: string) {
  const value = read(record, key);
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseBasket(value: unknown, brands: Brand[]): BasketItem[] {
  if (!Array.isArray(value)) return [];
  const items: BasketItem[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const qty = clampInt(readNumber(entry, "qty"), 1, 240, 1);
    const listingId = readString(entry, "listingId");
    const productId = readString(entry, "productId");
    if (listingId && productId) {
      items.push({ listingId, productId, qty });
      continue;
    }
    const flavourId = readString(entry, "flavourId");
    const retailer = readString(entry, "retailer");
    if (!flavourId || !retailer) continue;
    const match = findLegacyListing(brands, flavourId, retailer);
    if (!match) continue;
    items.push({ listingId: match.id, productId: match.productId, qty });
  }
  return items;
}

function findLegacyListing(brands: Brand[], productId: string, retailerName: string) {
  for (const brand of brands) {
    for (const product of brand.products) {
      if (product.id !== productId) continue;
      return product.listings.find((listing) => listing.retailerName === retailerName) ?? null;
    }
  }
  return null;
}

export function parseListings(value: unknown): Listing[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const listing = parseListing(entry);
    return listing ? [listing] : [];
  });
}

function parseListing(value: unknown): Listing | null {
  if (!isRecord(value)) return null;
  if (read(value, "writtenByPriceCheck") !== false) return null;
  if (read(value, "origin") !== "entered") return null;
  if (read(value, "currency") !== "EUR") return null;
  const id = readString(value, "id");
  const productId = readString(value, "productId");
  const retailerId = readString(value, "retailerId");
  const retailerName = readString(value, "retailerName");
  const packLabel = readString(value, "packLabel")?.trim() ?? "";
  const trust = readString(value, "trust");
  const observedOn = readString(value, "observedOn");
  const unitPrice = readNumber(value, "unitPrice");
  const unitsValue = readNumber(value, "unitsPerPack");
  if (!id || !productId || !retailerId || !retailerName || !packLabel || !trust || !observedOn) {
    return null;
  }
  if (!TRUST.includes(trust as TrustLevel) || !/^\d{4}-\d{2}-\d{2}$/.test(observedOn)) return null;
  if (unitPrice === null || unitsValue === null) return null;
  const unitsPerPack = clampInt(unitsValue, 1, 240, 0);
  if (unitsPerPack < 1 || unitPrice <= 0 || unitPrice > 200) return null;
  const noteValue = readString(value, "note");
  const packTotal = readNumber(value, "packTotal");
  return {
    id,
    productId,
    retailerId,
    retailerName,
    packLabel: packLabel.slice(0, 80),
    unitsPerPack,
    unitPrice,
    packTotal: packTotal ?? Math.round(unitPrice * unitsPerPack * 100) / 100,
    currency: "EUR",
    trust: trust as TrustLevel,
    observedOn,
    note: noteValue ? noteValue.slice(0, 180) : null,
    origin: "entered",
    writtenByPriceCheck: false,
  };
}

export function mergeListings(brands: Brand[], entered: Listing[]): Brand[] {
  return brands.map((brand) => ({
    ...brand,
    products: brand.products.map((product) => ({
      ...product,
      listings: [
        ...product.listings,
        ...entered.filter((listing) => listing.productId === product.id),
      ],
    })),
  }));
}

function parseNoteRecord(value: unknown): {
  id: string;
  retailerId: string;
  retailerName: string;
  detail: string;
  recordedOn: string | null;
} | null {
  if (!isRecord(value) || read(value, "origin") !== "entered" || read(value, "live") !== false) {
    return null;
  }
  const id = readString(value, "id");
  const retailerId = readString(value, "retailerId");
  const retailerName = readString(value, "retailerName");
  const detail = readString(value, "detail")?.trim() ?? "";
  if (!id || !retailerId || !retailerName || !detail) return null;
  return {
    id,
    retailerId,
    retailerName,
    detail: detail.slice(0, 200),
    recordedOn: readString(value, "recordedOn"),
  };
}

export function parseOffers(value: unknown): SavedOffer[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const note = parseNoteRecord(entry);
    if (!note) return [];
    return [{ ...note, live: false as const, origin: "entered" as const }];
  });
}

export function parseMemberships(value: unknown): Membership[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const note = parseNoteRecord(entry);
    if (!note) return [];
    return [{ ...note, live: false as const, origin: "entered" as const }];
  });
}

export function parsePurchases(value: unknown): Purchase[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isRecord(entry) || read(entry, "origin") !== "entered") return [];
    const id = readString(entry, "id");
    const date = readString(entry, "date");
    const retailerId = readString(entry, "retailerId");
    const retailerName = readString(entry, "retailerName");
    const kind = read(entry, "kind");
    const total = readNumber(entry, "total");
    const linesValue = read(entry, "lines");
    if (!id || !date || !retailerId || !retailerName || total === null) return [];
    if (kind !== "order" && kind !== "receipt") return [];
    if (!Array.isArray(linesValue)) return [];
    const lines = linesValue.flatMap((line) => {
      if (!isRecord(line)) return [];
      const label = readString(line, "label");
      const qty = readNumber(line, "qty");
      const lineTotal = readNumber(line, "total");
      if (!label || qty === null || lineTotal === null) return [];
      return [{ label, qty, total: lineTotal }];
    });
    if (lines.length === 0) return [];
    return [
      {
        id,
        date,
        retailerId,
        retailerName,
        kind,
        origin: "entered" as const,
        lines,
        total,
        note: readString(entry, "note"),
      },
    ];
  });
}

export function listingsFor(product: Product, retailerId: string) {
  if (retailerId === "all") return product.listings;
  return product.listings.filter((listing) => listing.retailerId === retailerId);
}

export function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `entered-${Date.now()}`;
}
