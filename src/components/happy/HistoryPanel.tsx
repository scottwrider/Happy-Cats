import { euro, formatDate, type Purchase } from "@/lib/catalogue";

type Props = {
  purchases: Purchase[];
  onRemove: (id: string) => void;
};

export function HistoryPanel({ purchases, onRemove }: Props) {
  const ordered = [...purchases].sort(
    (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id),
  );

  return (
    <section aria-labelledby="history-heading" className="min-w-0">
      <h2 id="history-heading" className="text-2xl">
        Purchase history
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Reference receipts stay as recorded. Notes you save from a basket are not orders.
      </p>
      <ol className="mt-4 space-y-3">
        {ordered.map((purchase) => (
          <li key={purchase.id} className="surface min-w-0 p-4 sm:p-5">
            <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl">{purchase.retailerName}</h3>
              <p className="num flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="badge badge-receipt">
                  {purchase.origin === "entered"
                    ? "Purchase note"
                    : purchase.kind === "receipt"
                      ? "Receipt"
                      : "Past order"}
                </span>
                {formatDate(purchase.date)}
              </p>
            </div>
            <ul className="num mt-3 space-y-1 text-sm">
              {purchase.lines.map((line) => (
                <li
                  key={`${line.label}-${line.qty}-${line.total}`}
                  className="flex justify-between gap-3 border-b border-border py-1"
                >
                  <span className="min-w-0 break-words">
                    {line.qty} × {line.label}
                  </span>
                  <span className="shrink-0">{euro(line.total)}</span>
                </li>
              ))}
            </ul>
            <p className="num mt-3 flex justify-between gap-3 font-semibold">
              <span>Total</span>
              <span>{euro(purchase.total)}</span>
            </p>
            {purchase.note ? (
              <p className="mt-1 text-sm text-muted-foreground">{purchase.note}</p>
            ) : null}
            {purchase.origin === "entered" ? (
              <button
                type="button"
                className="btn btn-quiet mt-3"
                onClick={() => onRemove(purchase.id)}
              >
                Remove this note
              </button>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
