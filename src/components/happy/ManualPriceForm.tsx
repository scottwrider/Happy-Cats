import { useState } from "react";
import type { Retailer, TrustLevel } from "@/lib/catalogue";
import { TRUST_LABEL } from "@/lib/catalogue";
import { todayIso } from "@/lib/entered-data";

export type ManualPriceInput = {
  retailerId: string;
  packLabel: string;
  unitsPerPack: number;
  unitPrice: number;
  trust: TrustLevel;
  observedOn: string;
  note: string;
};

type Props = {
  productId: string;
  productName: string;
  retailers: Retailer[];
  onSave: (input: ManualPriceInput) => void;
};

const fieldClass =
  "mt-1 w-full min-w-0 max-w-full rounded-md border border-input bg-card px-2 py-2";

export function ManualPriceForm({ productId, productName, retailers, onSave }: Props) {
  const [retailerId, setRetailerId] = useState(retailers[0]?.id ?? "");
  const [packLabel, setPackLabel] = useState("");
  const [unitsPerPack, setUnitsPerPack] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [trust, setTrust] = useState<TrustLevel>("manual");
  const [observedOn, setObservedOn] = useState(todayIso);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const units = Number(unitsPerPack);
    const price = Number(unitPrice);
    if (!retailerId) {
      setError("Choose a shop.");
      return;
    }
    if (packLabel.trim().length === 0 || packLabel.trim().length > 80) {
      setError("Enter a pack size, up to 80 characters.");
      return;
    }
    if (!Number.isInteger(units) || units < 1 || units > 240) {
      setError("Pouches in the pack should be a whole number from 1 to 240.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0 || price > 200) {
      setError("Enter a unit price above 0 and up to 200.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(observedOn)) {
      setError("Enter the date you checked this price.");
      return;
    }
    setError(null);
    onSave({
      retailerId,
      packLabel: packLabel.trim(),
      unitsPerPack: units,
      unitPrice: Math.round(price * 100) / 100,
      trust,
      observedOn,
      note: note.trim(),
    });
    setPackLabel("");
    setUnitPrice("");
    setNote("");
  };

  return (
    <form
      className="min-w-0 rounded-lg border border-border bg-card p-3"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <h4 className="text-base font-semibold">Record a price for {productName}</h4>
      <p className="mt-1 text-sm text-muted-foreground">
        This is saved only when you press the button. A page check never fills this in.
      </p>
      <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
        <label className="min-w-0 text-sm font-semibold">
          Shop
          <select
            className={fieldClass}
            value={retailerId}
            onChange={(event) => setRetailerId(event.target.value)}
          >
            {retailers.map((retailer) => (
              <option key={retailer.id} value={retailer.id}>
                {retailer.name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0 text-sm font-semibold">
          Pack size
          <input
            className={fieldClass}
            value={packLabel}
            onChange={(event) => setPackLabel(event.target.value)}
            placeholder="12 × 80 g"
            maxLength={80}
          />
        </label>
        <label className="min-w-0 text-sm font-semibold">
          Pouches in the pack
          <input
            className={`num ${fieldClass}`}
            inputMode="numeric"
            value={unitsPerPack}
            onChange={(event) => setUnitsPerPack(event.target.value)}
          />
        </label>
        <label className="min-w-0 text-sm font-semibold">
          Unit price (EUR)
          <input
            className={`num ${fieldClass}`}
            inputMode="decimal"
            value={unitPrice}
            onChange={(event) => setUnitPrice(event.target.value)}
            placeholder="1.55"
          />
        </label>
        <label className="min-w-0 text-sm font-semibold">
          Date checked
          <input
            className={`num ${fieldClass}`}
            type="date"
            value={observedOn}
            onChange={(event) => setObservedOn(event.target.value)}
          />
        </label>
        <label className="min-w-0 text-sm font-semibold sm:col-span-2">
          Note
          <input
            className={fieldClass}
            value={note}
            maxLength={180}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional"
          />
        </label>
      </div>
      <fieldset className="mt-3">
        <legend className="text-sm font-semibold">What kind of price is this?</legend>
        <div className="mt-2 grid gap-2">
          {(
            [
              ["manual", "You are writing it down."],
              ["verified", "You confirmed this figure on the shop page yourself."],
              ["receipt", "It comes from a receipt or a past order."],
            ] as const
          ).map(([value, help]) => (
            <label key={value} className="flex min-w-0 items-start gap-2 text-sm">
              <input
                type="radio"
                name={`trust-${productId}`}
                className="mt-1"
                checked={trust === value}
                onChange={() => setTrust(value)}
              />
              <span>
                <span className="font-semibold">{TRUST_LABEL[value]}</span>
                <span className="block text-muted-foreground">{help}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary mt-3">
        Save this price
      </button>
    </form>
  );
}
