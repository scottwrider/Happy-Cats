import { useState } from "react";
import { euro, findListing, lineTotal, type Brand, type Purchase } from "@/lib/catalogue";
import type { BasketItem } from "@/lib/entered-data";
import { newId, todayIso } from "@/lib/entered-data";
import { ORDER_BOUNDARY } from "@/lib/boundaries";
import { TrustBadge } from "./badges";

type Props = {
  brands: Brand[];
  items: BasketItem[];
  onQty: (index: number, qty: number) => void;
  onRemove: (index: number) => void;
  deliveryFree: number | null;
  deliveryCost: number | null;
  onDeliveryFree: (n: number | null) => void;
  onDeliveryCost: (n: number | null) => void;
  onRecord: (purchases: Purchase[]) => void;
};

export function BasketBuilder({
  brands,
  items,
  onQty,
  onRemove,
  deliveryFree,
  deliveryCost,
  onDeliveryFree,
  onDeliveryCost,
  onRecord,
}: Props) {
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const rows = items.map((item) => ({ item, found: findListing(brands, item.listingId) }));
  const groups = new Map<string, { name: string; goods: number; lines: Purchase["lines"] }>();

  for (const row of rows) {
    if (!row.found) continue;
    const goods = lineTotal(row.found.listing.unitPrice, row.item.qty);
    const current = groups.get(row.found.listing.retailerId) ?? {
      name: row.found.listing.retailerName,
      goods: 0,
      lines: [],
    };
    current.goods = Math.round((current.goods + goods) * 100) / 100;
    current.lines.push({
      label: `${row.found.brand.name} ${row.found.product.name} (${row.found.listing.packLabel})`,
      qty: row.item.qty,
      total: goods,
    });
    groups.set(row.found.listing.retailerId, current);
  }

  const goods = [...groups.values()].reduce((sum, group) => sum + group.goods, 0);
  const termsEntered = deliveryFree !== null && deliveryCost !== null;
  const shipping = termsEntered
    ? [...groups.values()].reduce(
        (sum, group) => sum + (group.goods >= (deliveryFree ?? 0) ? 0 : (deliveryCost ?? 0)),
        0,
      )
    : null;
  const pouches = rows.reduce((sum, row) => sum + row.item.qty, 0);
  const payable = shipping === null ? goods : goods + shipping;

  const record = () => {
    const date = todayIso();
    const notes: Purchase[] = [];
    for (const [retailerId, group] of groups) {
      notes.push({
        id: newId(),
        date,
        retailerId,
        retailerName: group.name,
        kind: "order",
        origin: "entered",
        lines: group.lines,
        total: group.goods,
        note: "Written down from a suggested basket. Not an order and not paid.",
      });
    }
    if (notes.length === 0) return;
    onRecord(notes);
    setSavedNote("Saved in History as a purchase note. Nothing was ordered.");
  };

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section aria-labelledby="basket-heading" className="surface min-w-0 p-4 sm:p-5">
        <h2 id="basket-heading" className="text-2xl">
          Mixed basket
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{ORDER_BOUNDARY}</p>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Empty. Open a flavour and add a recorded price.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {rows.map((row, index) => (
              <li
                key={`${row.item.listingId}-${index}`}
                className="min-w-0 rounded-md border border-border px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {row.found
                      ? `${row.found.brand.name} ${row.found.product.name}`
                      : "Price no longer recorded"}
                    {row.found ? <TrustBadge trust={row.found.listing.trust} /> : null}
                  </p>
                  <p className="num break-words text-sm text-muted-foreground">
                    {row.found
                      ? `${row.found.listing.retailerName} · ${euro(row.found.listing.unitPrice)} per pouch · ${row.found.listing.packLabel}`
                      : "Remove this line."}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="text-sm font-semibold" htmlFor={`qty-${index}`}>
                    Pouches
                  </label>
                  <input
                    id={`qty-${index}`}
                    type="number"
                    min={1}
                    max={240}
                    value={row.item.qty}
                    onChange={(event) =>
                      onQty(index, Math.max(1, Math.min(240, Number(event.target.value) || 1)))
                    }
                    className="num w-24 min-w-0 rounded-md border border-input bg-card px-2 py-2"
                  />
                  <p className="num font-semibold">
                    {euro(lineTotal(row.found?.listing.unitPrice ?? 0, row.item.qty))}
                  </p>
                  <button type="button" className="btn btn-quiet" onClick={() => onRemove(index)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {rows.length > 0 ? (
          <div className="mt-4">
            <button type="button" className="btn btn-quiet" onClick={record}>
              Save as a purchase note
            </button>
            {savedNote ? (
              <p role="status" className="mt-2 text-sm text-muted-foreground">
                {savedNote}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="terms-heading" className="surface h-fit min-w-0 p-4 sm:p-5">
        <h3 id="terms-heading" className="text-xl">
          Delivery terms
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The same terms are applied to each shop in this basket. The 31 Mar 2026 TodoMascota order
          was delivered free. Current terms are whatever you type here.
        </p>
        <div className="mt-4 space-y-3 text-sm">
          <label className="block font-semibold" htmlFor="free-over">
            Free delivery over (EUR)
            <input
              id="free-over"
              type="number"
              min={0}
              step="0.01"
              value={deliveryFree ?? ""}
              onChange={(event) => onDeliveryFree(readMoney(event.target.value))}
              className="num mt-1 w-full min-w-0 rounded-md border border-input bg-card px-2 py-2"
            />
          </label>
          <label className="block font-semibold" htmlFor="ship-cost">
            Otherwise delivery costs (EUR)
            <input
              id="ship-cost"
              type="number"
              min={0}
              step="0.01"
              value={deliveryCost ?? ""}
              onChange={(event) => onDeliveryCost(readMoney(event.target.value))}
              className="num mt-1 w-full min-w-0 rounded-md border border-input bg-card px-2 py-2"
            />
          </label>
        </div>
        <ul className="num mt-4 space-y-1 text-sm">
          {[...groups.entries()].map(([id, group]) => {
            const shopShipping =
              termsEntered && deliveryFree !== null && deliveryCost !== null
                ? group.goods >= deliveryFree
                  ? 0
                  : deliveryCost
                : null;
            return (
              <li key={id} className="flex justify-between gap-3">
                <span className="min-w-0">{group.name}</span>
                <span className="shrink-0">
                  {euro(group.goods)}
                  {shopShipping === null ? "" : ` + ${euro(shopShipping)} delivery`}
                </span>
              </li>
            );
          })}
        </ul>
        <dl className="num mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Pouches</dt>
            <dd>{pouches}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Food</dt>
            <dd>{euro(goods)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd>{shipping === null ? "Terms not entered" : euro(shipping)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-2 text-base font-semibold">
            <dt>{shipping === null ? "Food total" : "Total"}</dt>
            <dd>{euro(payable)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Per pouch</dt>
            <dd>{pouches ? euro(payable / pouches) : "—"}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function readMoney(value: string) {
  if (value.trim() === "") return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100) / 100;
}
