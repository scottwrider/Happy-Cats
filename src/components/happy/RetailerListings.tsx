import { euro, formatDate, type Listing, type Product } from "@/lib/catalogue";
import { TrustBadge } from "./badges";

type Props = {
  product: Product;
  unitNoun: string;
  listings: Listing[];
  onAdd: (listingId: string) => void;
  onRemoveEntered: (listingId: string) => void;
};

export function RetailerListings({ product, unitNoun, listings, onAdd, onRemoveEntered }: Props) {
  const sorted = [...listings].sort(
    (a, b) => a.unitPrice - b.unitPrice || a.retailerName.localeCompare(b.retailerName),
  );
  const lowestId = sorted[0]?.id;

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No price recorded for {product.name}. Write one below if you have it. Nothing is looked up
        for you.
      </p>
    );
  }

  return (
    <div className="min-w-0">
      <h4 className="text-base font-semibold">
        Where {product.name} is recorded{" "}
        <span className="font-normal text-muted-foreground">
          ({product.amount} {product.measure} {product.form})
        </span>
      </h4>
      <ul className="mt-3 space-y-2">
        {sorted.map((listing) => (
          <li key={listing.id} className="price-row min-w-0" data-trust={listing.trust}>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="font-semibold">{listing.retailerName}</p>
              <TrustBadge trust={listing.trust} />
              {listing.id === lowestId ? (
                <span className="rounded-full bg-card px-2 py-0.5 text-xs font-semibold">
                  Lowest unit price
                </span>
              ) : null}
              {listing.origin === "entered" ? (
                <span className="text-xs font-semibold text-muted-foreground">Entered by you</span>
              ) : null}
            </div>
            <dl className="mt-3 grid min-w-0 gap-3 sm:grid-cols-3">
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Unit price
                </dt>
                <dd className="num text-xl font-semibold">{euro(listing.unitPrice)}</dd>
                <dd className="text-xs text-muted-foreground">per {unitNoun}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Pack size
                </dt>
                <dd className="num text-base font-semibold">{listing.packLabel}</dd>
                {listing.unitsPerPack > 1 ? (
                  <dd className="num text-xs text-muted-foreground">
                    Pack total {euro(listing.packTotal)}
                  </dd>
                ) : null}
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Last checked
                </dt>
                <dd className="num text-base font-semibold">{formatDate(listing.observedOn)}</dd>
              </div>
            </dl>
            {listing.note ? (
              <p className="mt-2 break-words text-sm text-muted-foreground">{listing.note}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => onAdd(listing.id)}
                disabled={product.status === "excluded"}
              >
                {product.status === "excluded" ? "Excluded from the basket" : "Add to basket"}
              </button>
              {listing.origin === "entered" ? (
                <button
                  type="button"
                  className="btn btn-quiet"
                  onClick={() => onRemoveEntered(listing.id)}
                >
                  Remove this price
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
