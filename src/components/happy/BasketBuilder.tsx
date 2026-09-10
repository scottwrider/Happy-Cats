import { euro, findFlavour } from "@/lib/happy-cats-data";
import { TrustBadge } from "./badges";

export type BasketItem = { flavourId: string; retailer: string; qty: number };

type Props = {
  items: BasketItem[];
  onQty: (index: number, qty: number) => void;
  onRemove: (index: number) => void;
  deliveryFree: number;
  deliveryCost: number;
  onDeliveryFree: (n: number) => void;
  onDeliveryCost: (n: number) => void;
};

export function BasketBuilder({
  items,
  onQty,
  onRemove,
  deliveryFree,
  deliveryCost,
  onDeliveryFree,
  onDeliveryCost,
}: Props) {
  const rows = items.map((item) => {
    const flavour = findFlavour(item.flavourId);
    const listing = flavour?.listings.find((l) => l.retailer === item.retailer);
    return { item, flavour, listing };
  });

  const byRetailer = new Map<string, number>();
  for (const r of rows) {
    if (!r.listing) continue;
    byRetailer.set(
      r.item.retailer,
      (byRetailer.get(r.item.retailer) ?? 0) + r.listing.unitPrice * r.item.qty,
    );
  }

  const goods = [...byRetailer.values()].reduce((a, b) => a + b, 0);
  const shipping = [...byRetailer.values()].reduce(
    (sum, s) => sum + (s >= deliveryFree ? 0 : deliveryCost),
    0,
  );
  const pouches = rows.reduce((a, r) => a + r.item.qty, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <section aria-labelledby="basket-heading" className="surface p-5">
        <h3 id="basket-heading" className="text-xl">
          Mixed basket
        </h3>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Empty. Open a flavour in the catalogue and add a retailer price here.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {rows.map((r, i) => (
              <li
                key={`${r.item.flavourId}-${r.item.retailer}`}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-md border border-border px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {r.flavour?.name ?? "Unknown"}
                    {r.listing && <TrustBadge trust={r.listing.trust} />}
                  </p>
                  <p className="num text-sm text-muted-foreground">
                    {r.item.retailer} · {r.listing ? euro(r.listing.unitPrice) : "—"} per pouch
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="sr-only" htmlFor={`qty-${i}`}>
                    Pouches of {r.flavour?.name}
                  </label>
                  <input
                    id={`qty-${i}`}
                    type="number"
                    min={1}
                    value={r.item.qty}
                    onChange={(e) => onQty(i, Math.max(1, Number(e.target.value) || 1))}
                    className="num w-20 rounded-md border border-input bg-card px-2 py-1"
                  />
                  <p className="num w-20 text-right font-semibold">
                    {euro((r.listing?.unitPrice ?? 0) * r.item.qty)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    className="rounded-md border border-input px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="terms-heading" className="surface h-fit p-5">
        <h3 id="terms-heading" className="text-xl">
          Delivery terms
        </h3>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <label htmlFor="free-over" className="font-semibold">
              Free delivery over
            </label>
            <input
              id="free-over"
              type="number"
              min={0}
              value={deliveryFree}
              onChange={(e) => onDeliveryFree(Math.max(0, Number(e.target.value) || 0))}
              className="num mt-1 w-full rounded-md border border-input bg-card px-2 py-1.5"
            />
          </div>
          <div>
            <label htmlFor="ship-cost" className="font-semibold">
              Otherwise delivery costs
            </label>
            <input
              id="ship-cost"
              type="number"
              min={0}
              step="0.01"
              value={deliveryCost}
              onChange={(e) => onDeliveryCost(Math.max(0, Number(e.target.value) || 0))}
              className="num mt-1 w-full rounded-md border border-input bg-card px-2 py-1.5"
            />
          </div>
        </div>

        <dl className="num mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Pouches</dt>
            <dd>{pouches}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Food</dt>
            <dd>{euro(goods)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery ({byRetailer.size} shops)</dt>
            <dd>{euro(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{euro(goods + shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Per pouch</dt>
            <dd>{pouches ? euro((goods + shipping) / pouches) : "—"}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          This is a suggestion for you to approve. Nothing is ever ordered or paid for here.
        </p>
      </section>
    </div>
  );
}
