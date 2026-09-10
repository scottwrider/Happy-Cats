import type { FlavourStatus, TrustLevel } from "@/lib/happy-cats-data";
import { STATUS_LABEL, TRUST_LABEL } from "@/lib/happy-cats-data";

const trustStyles: Record<TrustLevel, string> = {
  verified: "bg-verified-soft text-verified border-verified/30",
  manual: "bg-manual-soft text-manual border-manual/30",
  receipt: "bg-receipt-soft text-receipt border-receipt/25",
};

const trustDot: Record<TrustLevel, string> = {
  verified: "bg-verified",
  manual: "bg-manual",
  receipt: "bg-receipt",
};

export function TrustBadge({ trust }: { trust: TrustLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${trustStyles[trust]}`}
    >
      <span className={`size-1.5 rounded-full ${trustDot[trust]}`} aria-hidden="true" />
      {TRUST_LABEL[trust]}
    </span>
  );
}

const statusStyles: Record<FlavourStatus, string> = {
  approved: "bg-verified-soft text-verified border-verified/30",
  excluded: "bg-destructive/10 text-destructive border-destructive/30",
  review: "bg-manual-soft text-manual border-manual/30",
};

export function StatusBadge({ status, reason }: { status: FlavourStatus; reason?: string }) {
  return (
    <span
      title={reason}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status]}`}
    >
      {STATUS_LABEL[status]}
      {reason ? <span className="sr-only">: {reason}</span> : null}
    </span>
  );
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
