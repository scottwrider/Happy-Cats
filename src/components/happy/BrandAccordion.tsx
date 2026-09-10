import { useState } from "react";
import { BRANDS, bestListing, euro } from "@/lib/happy-cats-data";
import { Heart, StatusBadge } from "./badges";
import { RetailerListings } from "./RetailerListings";

type Props = {
  favourites: string[];
  onToggleFavourite: (id: string) => void;
  onAdd: (flavourId: string, retailer: string) => void;
  onlyFavourites?: boolean;
};

export function BrandAccordion({
  favourites,
  onToggleFavourite,
  onAdd,
  onlyFavourites = false,
}: Props) {
  const [openBrand, setOpenBrand] = useState<string | null>(BRANDS[0]?.id ?? null);
  const [selected, setSelected] = useState<string | null>(null);

  const brands = BRANDS.map((b) => ({
    ...b,
    flavours: onlyFavourites ? b.flavours.filter((f) => favourites.includes(f.id)) : b.flavours,
  })).filter((b) => b.flavours.length > 0);

  if (brands.length === 0) {
    return (
      <p className="surface p-6 text-sm text-muted-foreground">
        No hearted flavours yet. Tap a heart in the catalogue to keep a flavour here.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {brands.map((brand) => {
        const open = openBrand === brand.id || onlyFavourites;
        return (
          <li key={brand.id} className="surface overflow-hidden">
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`panel-${brand.id}`}
                onClick={() => setOpenBrand(open && !onlyFavourites ? null : brand.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/60"
              >
                <span>
                  <span className="font-display text-xl font-semibold">{brand.name}</span>
                  <span className="block text-sm text-muted-foreground">{brand.blurb}</span>
                </span>
                <span className="num flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
                  {brand.flavours.length} flavours
                  <svg
                    viewBox="0 0 24 24"
                    className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </button>
            </h3>

            {open && (
              <div id={`panel-${brand.id}`} className="border-t border-border px-4 pb-5 pt-4">
                <ul className="space-y-2">
                  {brand.flavours.map((f) => {
                    const isSelected = selected === f.id;
                    const best = bestListing(f);
                    return (
                      <li key={f.id}>
                        <div
                          className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-3 py-3 ${
                            isSelected ? "border-primary/50 bg-primary/5" : "border-border bg-card"
                          }`}
                        >
                          <button
                            type="button"
                            aria-pressed={favourites.includes(f.id)}
                            aria-label={`${favourites.includes(f.id) ? "Remove" : "Add"} ${brand.name} ${f.name} ${favourites.includes(f.id) ? "from" : "to"} favourites`}
                            onClick={() => onToggleFavourite(f.id)}
                            className={`rounded-md p-1.5 transition-colors ${
                              favourites.includes(f.id)
                                ? "text-primary"
                                : "text-muted-foreground hover:text-primary"
                            }`}
                          >
                            <Heart filled={favourites.includes(f.id)} />
                          </button>

                          <button
                            type="button"
                            aria-expanded={isSelected}
                            onClick={() => setSelected(isSelected ? null : f.id)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <span className="flex flex-wrap items-center gap-2 font-semibold">
                              {f.name}
                              <StatusBadge status={f.status} reason={f.reason} />
                            </span>
                            <span className="num block text-sm text-muted-foreground">
                              {f.grams} g · {f.texture}
                              {f.reason ? ` · ${f.reason}` : ""}
                            </span>
                          </button>

                          <p className="num text-right text-sm">
                            <span className="text-base font-semibold">{euro(best.unitPrice)}</span>
                            <span className="block text-xs text-muted-foreground">
                              from {best.retailer}
                            </span>
                          </p>
                        </div>

                        {isSelected && (
                          <div className="mt-2">
                            <RetailerListings flavour={f} onAdd={onAdd} />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
