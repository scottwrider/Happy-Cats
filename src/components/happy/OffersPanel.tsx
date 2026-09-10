import { MEMBERSHIPS, PREFERENCES, RETAILERS, SAVED_OFFERS, formatDate } from "@/lib/happy-cats-data";

export function OffersPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section aria-labelledby="offers-heading" className="surface p-5">
        <h3 id="offers-heading" className="text-xl">
          Saved offers
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Recorded by hand. None of these are checked live.
        </p>
        <ul className="mt-4 space-y-2">
          {SAVED_OFFERS.map((o) => (
            <li key={o.id} className="rounded-md border border-border p-3">
              <p className="font-semibold">{o.retailer}</p>
              <p className="text-sm">{o.detail}</p>
              <p className="num mt-1 text-xs text-muted-foreground">
                Noted {formatDate(o.recorded)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="memberships-heading" className="surface p-5">
        <h3 id="memberships-heading" className="text-xl">
          Memberships
        </h3>
        <ul className="mt-4 space-y-2">
          {MEMBERSHIPS.map((m) => (
            <li key={m.retailer} className="rounded-md border border-border p-3">
              <p className="font-semibold">{m.retailer}</p>
              <p className="text-sm text-muted-foreground">{m.status}</p>
              <p className="num mt-1 text-xs text-muted-foreground">
                Noted {formatDate(m.recorded)}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
          Shop accounts, live loyalty points, receipt scanning and checkout are not connected yet.
        </p>
      </section>

      <section aria-labelledby="prefs-heading" className="surface p-5">
        <h3 id="prefs-heading" className="text-xl">
          Food rules
        </h3>
        <dl className="mt-3 space-y-3 text-sm">
          <div>
            <dt className="font-semibold text-verified">Wanted</dt>
            <dd className="text-muted-foreground">{PREFERENCES.wanted.join(" · ")}</dd>
          </div>
          <div>
            <dt className="font-semibold text-destructive">Excluded</dt>
            <dd className="text-muted-foreground">{PREFERENCES.excluded.join(" · ")}</dd>
          </div>
          <div>
            <dt className="font-semibold text-manual">Needs review</dt>
            <dd className="text-muted-foreground">{PREFERENCES.review.join(" · ")}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="shops-heading" className="surface p-5">
        <h3 id="shops-heading" className="text-xl">
          Shops covered
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {RETAILERS.map((r) => (
            <li
              key={r}
              className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground"
            >
              {r}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
