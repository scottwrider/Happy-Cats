import type { TrustLevel } from "@/lib/catalogue";
import { TrustBadge } from "./badges";

const ROWS: { trust: TrustLevel; text: string }[] = [
  {
    trust: "verified",
    text: "You confirmed this price on the shop's page. Strongest weight. The page check does not do this for you.",
  },
  {
    trust: "manual",
    text: "You wrote this price down yourself.",
  },
  {
    trust: "receipt",
    text: "Taken from a past receipt or order. Muted, and always dated.",
  },
];

export function TrustLegend() {
  return (
    <section aria-labelledby="trust-legend-heading" className="min-w-0">
      <h3 id="trust-legend-heading" className="text-lg">
        How to read a price
      </h3>
      <ul className="mt-3 grid min-w-0 gap-2 lg:grid-cols-3">
        {ROWS.map((row) => (
          <li key={row.trust} className="price-row min-w-0" data-trust={row.trust}>
            <TrustBadge trust={row.trust} />
            <p className="mt-2 text-sm">{row.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
