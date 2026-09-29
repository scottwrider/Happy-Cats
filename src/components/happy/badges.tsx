import type { ProductStatus, TrustLevel } from "@/lib/catalogue";
import { STATUS_LABEL, TRUST_LABEL } from "@/lib/catalogue";

export function TrustBadge({ trust }: { trust: TrustLevel }) {
  return (
    <span className={`badge badge-${trust}`}>
      <span className="badge-dot" aria-hidden="true" />
      {TRUST_LABEL[trust]}
    </span>
  );
}

export function StatusBadge({ status, reason }: { status: ProductStatus; reason: string | null }) {
  return (
    <span className={`badge badge-${status}`} title={reason ?? undefined}>
      {STATUS_LABEL[status]}
      {reason ? <span className="sr-only">: {reason}</span> : null}
    </span>
  );
}

export function HistoricalBadge() {
  return <span className="badge badge-receipt">Historical</span>;
}

export function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 20.5s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 8a4.4 4.4 0 0 1 7.5 2.9c0 5-7.5 9.6-7.5 9.6Z" />
    </svg>
  );
}
