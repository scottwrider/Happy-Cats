import { useEffect, useRef, useState } from "react";
import { euro, type Brand, type Category, type Retailer } from "@/lib/catalogue";
import { listingsFor } from "@/lib/entered-data";
import { Heart, StatusBadge } from "./badges";
import { ManualPriceForm, type ManualPriceInput } from "./ManualPriceForm";
import { PriceCheck } from "./PriceCheck";
import { RetailerListings } from "./RetailerListings";

type Props = {
  brands: Brand[];
  category: Category;
  retailers: Retailer[];
  favourites: string[];
  retailerId: string;
  onToggleFavourite: (id: string) => void;
  onAdd: (listingId: string) => void;
  onRemoveEntered: (listingId: string) => void;
  onSavePrice: (productId: string, input: ManualPriceInput) => void;
  onlyFavourites?: boolean;
};

export function BrandAccordion({
  brands,
  category,
  retailers,
  favourites,
  retailerId,
  onToggleFavourite,
  onAdd,
  onRemoveEntered,
  onSavePrice,
  onlyFavourites = false,
}: Props) {
  const [openBrand, setOpenBrand] = useState<string | null>("retorn");
  const [selected, setSelected] = useState<string | null>(null);
  const brandRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const flavourRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const visible = brands
    .map((brand) => ({
      ...brand,
      products: brand.products.filter((product) => {
        if (onlyFavourites && !favourites.includes(product.id)) return false;
        if (retailerId === "all") return true;
        return product.listings.some((listing) => listing.retailerId === retailerId);
      }),
    }))
    .filter((brand) => brand.products.length > 0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")
      ) {
        return;
      }
      if (selected) {
        const current = selected;
        setSelected(null);
        flavourRefs.current[current]?.focus();
        return;
      }
      if (openBrand) {
        const current = openBrand;
        setOpenBrand(null);
        brandRefs.current[current]?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openBrand, selected]);

  if (visible.length === 0) {
    return (
      <p className="surface p-6 text-sm text-muted-foreground">
        {onlyFavourites
          ? "No hearted flavours yet. Tap a heart in the catalogue to keep a flavour here."
          : "No flavours match this shop."}
      </p>
    );
  }

  return (
    <ul className="min-w-0 space-y-3">
      {visible.map((brand) => {
        const open = openBrand === brand.id;
        return (
          <li key={brand.id} className="surface min-w-0 overflow-hidden">
            <h3 className="min-w-0">
              <button
                type="button"
                ref={(node) => {
                  brandRefs.current[brand.id] = node;
                }}
                aria-expanded={open}
                aria-controls={open ? `panel-${brand.id}` : undefined}
                onClick={() => {
                  setOpenBrand(open ? null : brand.id);
                  if (open) setSelected(null);
                }}
                className="flex w-full min-w-0 items-center justify-between gap-3 px-4 py-4 text-left hover:bg-muted/60"
              >
                <span className="min-w-0">
                  <span className="block text-xl font-semibold">{brand.name}</span>
                  <span className="block text-sm text-muted-foreground">{brand.summary}</span>
                </span>
                <span className="num flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                  {brand.products.length} {category.variantNounPlural}
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
            {open ? (
              <div
                id={`panel-${brand.id}`}
                className="min-w-0 border-t border-border px-3 pb-4 pt-3 sm:px-4"
              >
                <ul className="space-y-2">
                  {brand.products.map((product) => {
                    const isSelected = selected === product.id;
                    const shown = listingsFor(product, retailerId);
                    const lowest = [...shown].sort((a, b) => a.unitPrice - b.unitPrice)[0];
                    const hearted = favourites.includes(product.id);
                    return (
                      <li key={product.id} className="min-w-0 rounded-lg border border-border">
                        <div
                          className={`flex min-w-0 items-start gap-1 px-2 py-2 ${
                            isSelected ? "bg-primary/5" : "bg-card"
                          }`}
                        >
                          <button
                            type="button"
                            aria-pressed={hearted}
                            aria-label={`${hearted ? "Remove" : "Add"} ${brand.name} ${product.name} ${hearted ? "from" : "to"} favourites`}
                            onClick={() => onToggleFavourite(product.id)}
                            className={`inline-flex size-11 shrink-0 items-center justify-center rounded-md ${
                              hearted ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            <Heart filled={hearted} />
                          </button>
                          <button
                            type="button"
                            ref={(node) => {
                              flavourRefs.current[product.id] = node;
                            }}
                            aria-expanded={isSelected}
                            aria-controls={isSelected ? `flavour-${product.id}` : undefined}
                            onClick={() => setSelected(isSelected ? null : product.id)}
                            className="min-w-0 flex-1 py-1 text-left"
                          >
                            <span className="flex flex-wrap items-center gap-2 font-semibold">
                              {product.name}
                              <StatusBadge status={product.status} reason={product.reason} />
                            </span>
                            <span className="num mt-0.5 block break-words text-sm text-muted-foreground">
                              {product.amount} {product.measure} {product.form}
                              {product.attributes.map((attribute) => ` · ${attribute.value}`)}
                              {product.reason ? ` · ${product.reason}` : ""}
                            </span>
                            {lowest ? (
                              <span className="num mt-1 block text-sm">
                                {euro(lowest.unitPrice)} from {lowest.retailerName}
                              </span>
                            ) : (
                              <span className="mt-1 block text-sm text-muted-foreground">
                                No price recorded
                              </span>
                            )}
                          </button>
                        </div>
                        {isSelected ? (
                          <div
                            id={`flavour-${product.id}`}
                            className="min-w-0 space-y-3 border-t border-border px-3 py-3"
                          >
                            <RetailerListings
                              product={product}
                              unitNoun={category.unitNoun}
                              listings={shown}
                              onAdd={onAdd}
                              onRemoveEntered={onRemoveEntered}
                            />
                            <ManualPriceForm
                              productId={product.id}
                              productName={product.name}
                              retailers={retailers}
                              onSave={(input) => onSavePrice(product.id, input)}
                            />
                            <PriceCheck />
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
