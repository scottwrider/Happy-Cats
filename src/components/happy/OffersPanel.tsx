import { useState } from "react";
import {
  formatDate,
  type Membership,
  type PreferenceRule,
  type Retailer,
  type SavedOffer,
} from "@/lib/catalogue";
import { STUBS } from "@/lib/boundaries";
import { todayIso } from "@/lib/entered-data";
import { StatusBadge } from "./badges";

const RULE_BADGE = {
  wanted: "Wanted",
  excluded: "Excluded",
  review: "Needs review",
} as const;

type Props = {
  offers: SavedOffer[];
  memberships: Membership[];
  rules: PreferenceRule[];
  retailers: Retailer[];
  onAddOffer: (offer: SavedOffer) => void;
  onRemoveOffer: (id: string) => void;
  onAddMembership: (membership: Membership) => void;
  onRemoveMembership: (id: string) => void;
};

const fieldClass =
  "mt-1 w-full min-w-0 rounded-md border border-input bg-card px-2 py-2 font-normal";

export function OffersPanel({
  offers,
  memberships,
  rules,
  retailers,
  onAddOffer,
  onRemoveOffer,
  onAddMembership,
  onRemoveMembership,
}: Props) {
  return (
    <div className="min-w-0">
      <h2 className="text-2xl">Offers, memberships, and rules</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
        Everything here is written down. None of it is checked live.
      </p>
      <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
        <section aria-labelledby="offers-heading" className="surface min-w-0 p-4 sm:p-5">
          <h3 id="offers-heading" className="text-xl">
            Saved offers
          </h3>
          <ul className="mt-4 space-y-2">
            {offers.map((offer) => (
              <li key={offer.id} className="min-w-0 rounded-md border border-border p-3">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {offer.retailerName}
                  <span className="badge badge-receipt">
                    {offer.origin === "reference" ? "Reference" : "Entered"}
                  </span>
                </p>
                <p className="break-words text-sm">{offer.detail}</p>
                <p className="num mt-1 text-xs text-muted-foreground">
                  {offer.recordedOn ? `Noted ${formatDate(offer.recordedOn)}` : "No date recorded"}
                </p>
                {offer.origin === "entered" ? (
                  <button
                    type="button"
                    className="btn btn-quiet mt-2"
                    onClick={() => onRemoveOffer(offer.id)}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          <OfferForm retailers={retailers} onAdd={onAddOffer} />
        </section>

        <section aria-labelledby="memberships-heading" className="surface min-w-0 p-4 sm:p-5">
          <h3 id="memberships-heading" className="text-xl">
            Memberships
          </h3>
          <ul className="mt-4 space-y-2">
            {memberships.map((membership) => (
              <li key={membership.id} className="min-w-0 rounded-md border border-border p-3">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {membership.retailerName}
                  <span className="badge badge-manual">Not live</span>
                </p>
                <p className="break-words text-sm text-muted-foreground">{membership.detail}</p>
                <p className="num mt-1 text-xs text-muted-foreground">
                  {membership.recordedOn
                    ? `Noted ${formatDate(membership.recordedOn)}`
                    : "No date recorded"}
                </p>
                {membership.origin === "entered" ? (
                  <button
                    type="button"
                    className="btn btn-quiet mt-2"
                    onClick={() => onRemoveMembership(membership.id)}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          <MembershipForm retailers={retailers} onAdd={onAddMembership} />
        </section>

        <section aria-labelledby="prefs-heading" className="surface min-w-0 p-4 sm:p-5">
          <h3 id="prefs-heading" className="text-xl">
            Food rules
          </h3>
          <ul className="mt-3 space-y-2">
            {rules.map((rule) => (
              <li key={rule.id} className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
                {rule.effect === "wanted" ? (
                  <span className="badge badge-verified">{RULE_BADGE.wanted}</span>
                ) : (
                  <StatusBadge status={rule.effect} reason={null} />
                )}
                <span className="min-w-0 break-words">{rule.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Flavour rows use Approved, Excluded, or Needs review. Wanted is a household preference,
            not a product status.
          </p>
        </section>

        <section aria-labelledby="shops-heading" className="surface min-w-0 p-4 sm:p-5">
          <h3 id="shops-heading" className="text-xl">
            Shops covered
          </h3>
          <ul className="mt-3 space-y-2">
            {retailers.map((retailer) => (
              <li key={retailer.id} className="min-w-0 text-sm">
                <span className="font-semibold">{retailer.name}</span>
                {retailer.deliversToHousehold ? (
                  <span className="text-muted-foreground"> — delivers to 28004</span>
                ) : null}
                {retailer.note ? (
                  <span className="block break-words text-muted-foreground">{retailer.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="stubs-heading"
          className="surface min-w-0 p-4 sm:p-5 lg:col-span-2"
        >
          <h3 id="stubs-heading" className="text-xl">
            Not connected
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {STUBS.map((stub) => (
              <li
                key={stub.id}
                className="min-w-0 rounded-md border border-dashed border-border p-3"
              >
                <p className="font-semibold">{stub.title}</p>
                <p className="text-sm text-muted-foreground">{stub.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function OfferForm({
  retailers,
  onAdd,
}: {
  retailers: Retailer[];
  onAdd: (offer: SavedOffer) => void;
}) {
  const [retailerId, setRetailerId] = useState(retailers[0]?.id ?? "");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-4 space-y-2 border-t border-border pt-4"
      onSubmit={(event) => {
        event.preventDefault();
        const retailer = retailers.find((item) => item.id === retailerId);
        const text = detail.trim();
        if (!retailer || text.length === 0) {
          setError("Choose a shop and write the offer.");
          return;
        }
        setError(null);
        onAdd({
          id: crypto.randomUUID(),
          retailerId: retailer.id,
          retailerName: retailer.name,
          detail: text.slice(0, 200),
          recordedOn: todayIso(),
          live: false,
          origin: "entered",
        });
        setDetail("");
      }}
    >
      <h4 className="text-sm font-semibold">Add an offer you saw</h4>
      <label className="block text-sm font-semibold">
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
      <label className="block text-sm font-semibold">
        What was offered
        <input
          className={fieldClass}
          value={detail}
          maxLength={200}
          onChange={(event) => setDetail(event.target.value)}
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary">
        Save offer
      </button>
    </form>
  );
}

function MembershipForm({
  retailers,
  onAdd,
}: {
  retailers: Retailer[];
  onAdd: (membership: Membership) => void;
}) {
  const [retailerId, setRetailerId] = useState(retailers[0]?.id ?? "");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-4 space-y-2 border-t border-border pt-4"
      onSubmit={(event) => {
        event.preventDefault();
        const retailer = retailers.find((item) => item.id === retailerId);
        const text = detail.trim();
        if (!retailer || text.length === 0) {
          setError("Choose a shop and write what you know.");
          return;
        }
        setError(null);
        onAdd({
          id: crypto.randomUUID(),
          retailerId: retailer.id,
          retailerName: retailer.name,
          detail: text.slice(0, 200),
          recordedOn: todayIso(),
          live: false,
          origin: "entered",
        });
        setDetail("");
      }}
    >
      <h4 className="text-sm font-semibold">Add a membership note</h4>
      <label className="block text-sm font-semibold">
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
      <label className="block text-sm font-semibold">
        What you know
        <input
          className={fieldClass}
          value={detail}
          maxLength={200}
          onChange={(event) => setDetail(event.target.value)}
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary">
        Save membership
      </button>
    </form>
  );
}
