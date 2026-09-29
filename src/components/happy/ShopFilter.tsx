import type { Retailer } from "@/lib/catalogue";

type Props = {
  retailers: Retailer[];
  value: string;
  onChange: (retailerId: string) => void;
};

export function ShopFilter({ retailers, value, onChange }: Props) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold">Shops</legend>
      <div className="mt-2 flex min-w-0 flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={value === "all"}
          onClick={() => onChange("all")}
          className={`btn ${value === "all" ? "btn-primary" : "btn-quiet"}`}
        >
          All shops
        </button>
        {retailers.map((retailer) => (
          <button
            key={retailer.id}
            type="button"
            aria-pressed={value === retailer.id}
            onClick={() => onChange(retailer.id)}
            className={`btn max-w-full ${value === retailer.id ? "btn-primary" : "btn-quiet"}`}
          >
            {retailer.name}
            {retailer.deliversToHousehold ? (
              <span className="sr-only">, delivers to this household</span>
            ) : null}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
