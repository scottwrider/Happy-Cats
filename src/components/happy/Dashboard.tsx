import {
  ALL_FLAVOURS,
  CATS,
  HOUSEHOLD,
  bestListing,
  euro,
  formatDate,
} from "@/lib/happy-cats-data";

type Props = {
  favourites: string[];
  stock: number;
  onStockChange: (n: number) => void;
};

export function Dashboard({ favourites, stock, onStockChange }: Props) {
  const approved = ALL_FLAVOURS.filter((f) => f.status === "approved");
  const cheapest = approved
    .map((f) => ({ f, l: bestListing(f) }))
    .sort((a, b) => a.l.unitPrice - b.l.unitPrice)[0];
  const lastChecked = ALL_FLAVOURS.flatMap((f) => f.listings)
    .map((l) => l.lastChecked)
    .sort()
    .at(-1)!;
  const daysLeft = Math.floor(stock / 7);

  return (
    <section aria-labelledby="dashboard-heading" className="surface p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Household
          </p>
          <h2 id="dashboard-heading" className="mt-1 text-2xl sm:text-3xl">
            Sushi &amp; Miso, {HOUSEHOLD.postcode}
          </h2>
        </div>
        <p className="num text-sm text-muted-foreground">
          Prices last touched {formatDate(lastChecked)}
        </p>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li className="rounded-lg bg-muted/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            The cats
          </p>
          {CATS.map((c) => (
            <p key={c.name} className="mt-1 text-sm">
              <span className="font-semibold">{c.name}</span>{" "}
              <span className="text-muted-foreground">— {c.detail}</span>
            </p>
          ))}
        </li>
        <li className="rounded-lg bg-muted/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Daily use
          </p>
          <p className="num mt-1 text-2xl font-semibold">{HOUSEHOLD.portionsPerDay}</p>
          <p className="text-sm text-muted-foreground">
            about {HOUSEHOLD.flavoursPerDay} flavours a day, plus dry food
          </p>
        </li>
        <li className="rounded-lg bg-muted/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Best value right now
          </p>
          <p className="num mt-1 text-2xl font-semibold">{euro(cheapest.l.unitPrice)}</p>
          <p className="text-sm text-muted-foreground">
            {cheapest.f.brandName} {cheapest.f.name} at {cheapest.l.retailer}
          </p>
        </li>
        <li className="rounded-lg bg-muted/70 p-4">
          <label
            htmlFor="stock"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Pouches at home
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="stock"
              type="number"
              min={0}
              value={stock}
              onChange={(e) => onStockChange(Math.max(0, Number(e.target.value) || 0))}
              className="num w-24 rounded-md border border-input bg-card px-2 py-1 text-xl font-semibold"
            />
            <span className="text-sm text-muted-foreground">
              ≈ {daysLeft} day{daysLeft === 1 ? "" : "s"} left
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {favourites.length} flavour{favourites.length === 1 ? "" : "s"} hearted
          </p>
        </li>
      </ul>
    </section>
  );
}
