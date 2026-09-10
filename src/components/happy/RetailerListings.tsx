import type { Flavour } from "@/lib/happy-cats-data";
import { euro, formatDate } from "@/lib/happy-cats-data";
import { TrustBadge } from "./badges";

type Props = {
  flavour: Flavour;
  onAdd: (flavourId: string, retailer: string) => void;
};

export function RetailerListings({ flavour, onAdd }: Props) {
  const sorted = [...flavour.listings].sort((a, b) => a.unitPrice - b.unitPrice);

  return (
    <div className="rounded-lg border border-border bg-background/60 p-4">
      <h4 className="text-sm font-semibold">
        Where to buy {flavour.name}{" "}
        <span className="font-normal text-muted-foreground">({flavour.grams} g pouches)</span>
      </h4>
      <ul className="mt-3 space-y-2">
        {sorted.map((l, i) => (
          <li
            key={l.retailer + l.packSize}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-md border border-border bg-card px-3 py-3"
          >
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {l.retailer}
                <TrustBadge trust={l.trust} />
                {i === 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    Cheapest
                  </span>
                )}
              </p>
              <p className="num mt-0.5 text-sm text-muted-foreground">
                {l.packSize} · last checked {formatDate(l.lastChecked)}
                {l.note ? ` · ${l.note}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="num text-right">
                <span className="text-lg font-semibold">{euro(l.unitPrice)}</span>
                <span className="block text-xs text-muted-foreground">per pouch</span>
              </p>
              <button
                type="button"
                onClick={() => onAdd(flavour.id, l.retailer)}
                className="rounded-md border border-input bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent"
              >
                Add to basket
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Prices are never written automatically — verified entries were confirmed by hand on the
        retailer page.
      </p>
    </div>
  );
}
