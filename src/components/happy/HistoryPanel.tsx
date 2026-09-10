import { PURCHASES, euro, formatDate } from "@/lib/happy-cats-data";

export function HistoryPanel() {
  return (
    <ol className="space-y-3">
      {[...PURCHASES]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((p) => (
          <li key={p.id} className="surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl">{p.retailer}</h3>
              <p className="num flex items-center gap-2 text-sm text-muted-foreground">
                <span className="rounded-full border border-receipt/25 bg-receipt-soft px-2.5 py-0.5 text-xs font-semibold text-receipt">
                  {p.kind === "receipt" ? "Receipt" : "Past order"}
                </span>
                {formatDate(p.date)}
              </p>
            </div>
            <ul className="num mt-3 space-y-1 text-sm">
              {p.lines.map((l) => (
                <li key={l.label} className="flex justify-between gap-4 border-b border-border py-1">
                  <span>
                    {l.qty} × {l.label}
                  </span>
                  <span>{euro(l.total)}</span>
                </li>
              ))}
            </ul>
            <p className="num mt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>{euro(p.total)}</span>
            </p>
            {p.note && <p className="mt-1 text-sm text-muted-foreground">{p.note}</p>}
          </li>
        ))}
    </ol>
  );
}
