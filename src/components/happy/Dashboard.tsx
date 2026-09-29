import {
  daysOfFood,
  euro,
  formatDate,
  bestRecordedPrice,
  latestObservedOn,
  type Brand,
  type Household,
  type LoyaltySnapshot,
  type Pet,
} from "@/lib/catalogue";
import { HistoricalBadge, TrustBadge } from "./badges";

type Props = {
  pets: Pet[];
  household: Household;
  brands: Brand[];
  loyalty: LoyaltySnapshot[];
  favourites: string[];
  stock: number;
  onStockChange: (n: number) => void;
};

export function Dashboard({
  pets,
  household,
  brands,
  loyalty,
  favourites,
  stock,
  onStockChange,
}: Props) {
  const best = bestRecordedPrice(brands);
  const latest = latestObservedOn(brands);
  const days = daysOfFood(stock, household.portionsMidpoint);
  const headline =
    best?.listing.trust === "verified"
      ? "Best verified unit price"
      : best?.listing.trust === "manual"
        ? "Lowest price you recorded"
        : "Lowest receipt unit price";

  return (
    <section aria-labelledby="dashboard-heading" className="surface p-4 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Household
          </p>
          <h2 id="dashboard-heading" className="mt-1 text-2xl sm:text-3xl">
            {pets.map((pet) => pet.name).join(" & ")}, {household.postcode} {household.city}
          </h2>
        </div>
        <p className="num text-sm text-muted-foreground">
          {latest ? `Latest price record ${formatDate(latest)}` : "No price recorded yet"}
        </p>
      </div>

      <ul className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <li className="min-w-0 rounded-lg bg-muted/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            The cats
          </p>
          <ul className="mt-2 space-y-1">
            {pets.map((pet) => (
              <li key={pet.id} className="text-sm">
                <span className="font-semibold">{pet.name}</span>
                <span className="text-muted-foreground">
                  {" "}
                  — {pet.sex}, {pet.ageLabel}
                </span>
              </li>
            ))}
          </ul>
        </li>
        <li className="min-w-0 rounded-lg bg-muted/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Consumption
          </p>
          <p className="num mt-1 text-2xl font-semibold">{household.portionsLabel}</p>
          <p className="text-sm text-muted-foreground">
            about {household.flavoursPerDay} flavours a day
            {household.alsoDryFood ? ", plus dry food" : ""}
            {household.mixedBulkWelcome ? ". Mixed bulk buys are welcome" : ""}
          </p>
        </li>
        <li className="min-w-0 rounded-lg bg-muted/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {headline}
          </p>
          {best ? (
            <>
              <p className="num mt-1 text-2xl font-semibold">{euro(best.listing.unitPrice)}</p>
              <p className="text-sm text-muted-foreground">
                {best.brand.name} {best.product.name} at {best.listing.retailerName}
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <TrustBadge trust={best.listing.trust} />
                <span className="num text-muted-foreground">
                  {formatDate(best.listing.observedOn)}
                </span>
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No price recorded yet.</p>
          )}
        </li>
        <li className="min-w-0 rounded-lg bg-muted/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pouches at home
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn btn-quiet min-w-11"
              onClick={() => onStockChange(Math.max(0, stock - 1))}
              aria-label="Remove one pouch from the count"
            >
              −
            </button>
            <input
              id="stock"
              aria-label="Pouches at home"
              type="number"
              min={0}
              max={999}
              inputMode="numeric"
              value={stock}
              onChange={(event) =>
                onStockChange(Math.max(0, Math.min(999, Number(event.target.value) || 0)))
              }
              className="num w-20 min-w-0 rounded-md border border-input bg-card px-2 py-2 text-center text-xl font-semibold"
            />
            <button
              type="button"
              className="btn btn-quiet min-w-11"
              onClick={() => onStockChange(Math.min(999, stock + 1))}
              aria-label="Add one pouch to the count"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {stock === 0
              ? "Count them yourself. This is not synced."
              : `About ${days} day${days === 1 ? "" : "s"} at ${household.portionsMidpoint} pouches a day (the middle of 6–8).`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {favourites.length} flavour{favourites.length === 1 ? "" : "s"} hearted
          </p>
        </li>
      </ul>

      {loyalty.map((snapshot) => (
        <p
          key={snapshot.id}
          className="mt-4 flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-receipt/30 bg-receipt-soft px-3 py-3 text-sm"
        >
          <HistoricalBadge />
          <span className="font-semibold">{snapshot.retailerName}</span>
          <span className="num font-semibold">{snapshot.points} points</span>
          <span className="text-muted-foreground">{snapshot.note}</span>
        </p>
      ))}
    </section>
  );
}
