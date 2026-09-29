import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BasketBuilder } from "@/components/happy/BasketBuilder";
import { BrandAccordion } from "@/components/happy/BrandAccordion";
import { Dashboard } from "@/components/happy/Dashboard";
import { HistoryPanel } from "@/components/happy/HistoryPanel";
import type { ManualPriceInput } from "@/components/happy/ManualPriceForm";
import { OffersPanel } from "@/components/happy/OffersPanel";
import { ShopFilter } from "@/components/happy/ShopFilter";
import { TrustLegend } from "@/components/happy/TrustLegend";
import { seedCatalogueSource } from "@/db/repository";
import { AUTH_BOUNDARY, ORDER_BOUNDARY } from "@/lib/boundaries";
import {
  lineTotal,
  retailerById,
  type Listing,
  type Membership,
  type Purchase,
  type SavedOffer,
} from "@/lib/catalogue";
import {
  mergeListings,
  newId,
  parseBasket,
  parseFavourites,
  parseListings,
  parseMemberships,
  parseMoneyOrNull,
  parseOffers,
  parsePurchases,
  parseStock,
} from "@/lib/entered-data";
import { useStoredState } from "@/lib/use-stored-state";

export const Route = createFileRoute("/")({
  loader: () => seedCatalogueSource.load(),
  head: () => ({
    meta: [
      { title: "Happy Cats — wet cat food price comparison" },
      {
        name: "description",
        content:
          "A private shopping assistant for Sushi and Miso: compare recorded pouch prices, keep favourites, and build a mixed basket to approve.",
      },
      { property: "og:title", content: "Happy Cats — wet cat food price comparison" },
      {
        property: "og:description",
        content: "Compare recorded wet cat food prices, keep favourites, and plan a mixed basket.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

const TABS = [
  { id: "catalogue", label: "Catalogue" },
  { id: "favourites", label: "Favourites" },
  { id: "basket", label: "Basket" },
  { id: "history", label: "History" },
  { id: "offers", label: "Offers" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Index() {
  const catalogue = Route.useLoaderData();
  const category = catalogue.categories[0];
  const [tab, setTab] = useState<TabId>("catalogue");
  const [retailerId, setRetailerId] = useState("all");
  const [favourites, setFavourites] = useStoredState(
    "hc-favourites",
    parseFavourites(undefined),
    parseFavourites,
  );
  const [stock, setStock] = useStoredState("hc-pouches-at-home", 0, parseStock);
  const [basketStored, setBasketStored] = useStoredState<unknown>("hc-basket", []);
  const [deliveryFree, setDeliveryFree] = useStoredState<number | null>(
    "hc-delivery-free-over",
    null,
    parseMoneyOrNull,
  );
  const [deliveryCost, setDeliveryCost] = useStoredState<number | null>(
    "hc-delivery-cost",
    null,
    parseMoneyOrNull,
  );
  const [enteredListings, setEnteredListings] = useStoredState<Listing[]>(
    "hc-entered-listings",
    [],
    parseListings,
  );
  const [enteredOffers, setEnteredOffers] = useStoredState<SavedOffer[]>(
    "hc-entered-offers",
    [],
    parseOffers,
  );
  const [enteredMemberships, setEnteredMemberships] = useStoredState<Membership[]>(
    "hc-entered-memberships",
    [],
    parseMemberships,
  );
  const [enteredPurchases, setEnteredPurchases] = useStoredState<Purchase[]>(
    "hc-entered-purchases",
    [],
    parsePurchases,
  );

  const brands = useMemo(
    () => mergeListings(catalogue.brands, enteredListings),
    [catalogue.brands, enteredListings],
  );
  const basket = useMemo(() => parseBasket(basketStored, brands), [basketStored, brands]);
  const basketCount = basket.reduce((sum, item) => sum + item.qty, 0);

  if (!category) {
    return <p className="p-6">The wet food category is missing from the catalogue.</p>;
  }

  const toggleFavourite = (id: string) =>
    setFavourites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  const addToBasket = (listingId: string) => {
    const listing = brands
      .flatMap((brand) => brand.products.flatMap((product) => product.listings))
      .find((item) => item.id === listingId);
    const product = brands
      .flatMap((brand) => brand.products)
      .find((item) => item.listings.some((row) => row.id === listingId));
    if (!listing || !product || product.status === "excluded") return;
    setBasketStored((prev: unknown) => {
      const items = parseBasket(prev, brands);
      const index = items.findIndex((item) => item.listingId === listingId);
      if (index === -1) return [...items, { listingId, productId: product.id, qty: 6 }];
      return items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, qty: Math.min(240, item.qty + 6) } : item,
      );
    });
    setTab("basket");
  };

  const savePrice = (productId: string, input: ManualPriceInput) => {
    const retailer = retailerById(catalogue.retailers, input.retailerId);
    if (!retailer) return;
    const listing: Listing = {
      id: newId(),
      productId,
      retailerId: retailer.id,
      retailerName: retailer.name,
      packLabel: input.packLabel,
      unitsPerPack: input.unitsPerPack,
      unitPrice: input.unitPrice,
      packTotal: lineTotal(input.unitPrice, input.unitsPerPack),
      currency: "EUR",
      trust: input.trust,
      observedOn: input.observedOn,
      note: input.note || null,
      origin: "entered",
      writtenByPriceCheck: false,
    };
    setEnteredListings((prev) => [...prev, listing]);
  };

  const offers = [...catalogue.offers, ...enteredOffers];
  const memberships = [...catalogue.memberships, ...enteredMemberships];
  const purchases = [...catalogue.purchases, ...enteredPurchases];

  return (
    <div className="min-h-screen bg-background">
      <a className="skip-link" href="#shopping">
        Skip to shopping
      </a>
      <header className="w-full border-b border-border bg-card/80">
        <div className="shop-column px-3 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Private shopping assistant
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl">Happy Cats</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Which flavour is the best recorded value, and where was it last seen?
          </p>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{AUTH_BOUNDARY}</p>
        </div>
      </header>

      {/*
        Column on purpose: the menu is a full-width row above the panel.
        Do not place the nav beside the catalogue.
      */}
      <div className="shop-column gap-6 px-3 py-6 sm:px-6 sm:py-8">
        <Dashboard
          pets={catalogue.pets}
          household={catalogue.household}
          brands={brands}
          loyalty={catalogue.loyalty}
          favourites={favourites}
          stock={stock}
          onStockChange={setStock}
        />

        <nav aria-label="Shopping sections" className="shop-nav">
          <ul>
            {TABS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={tab === item.id ? "page" : undefined}
                  onClick={() => setTab(item.id)}
                  className={tab === item.id ? "is-current" : undefined}
                >
                  {item.label}
                  {item.id === "basket" && basketCount > 0 ? (
                    <span className="num"> ({basketCount})</span>
                  ) : null}
                  {item.id === "favourites" && favourites.length > 0 ? (
                    <span className="num"> ({favourites.length})</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div id="shopping" tabIndex={-1} className="shop-panel">
          {tab === "catalogue" || tab === "favourites" ? (
            <section aria-labelledby="catalogue-heading" className="min-w-0 space-y-4">
              <div>
                <h2 id="catalogue-heading" className="text-2xl">
                  {tab === "favourites" ? "Favourites" : category.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Retorn first, then Canagan. Open a brand, choose a flavour, then read the prices
                  on record.
                </p>
              </div>
              <TrustLegend />
              <ShopFilter
                retailers={catalogue.retailers}
                value={retailerId}
                onChange={setRetailerId}
              />
              <BrandAccordion
                brands={brands}
                category={category}
                retailers={catalogue.retailers}
                favourites={favourites}
                retailerId={retailerId}
                onToggleFavourite={toggleFavourite}
                onAdd={addToBasket}
                onRemoveEntered={(id) =>
                  setEnteredListings((prev) => prev.filter((listing) => listing.id !== id))
                }
                onSavePrice={savePrice}
                onlyFavourites={tab === "favourites"}
              />
            </section>
          ) : null}
          {tab === "basket" ? (
            <BasketBuilder
              brands={brands}
              items={basket}
              onQty={(index, qty) =>
                setBasketStored(
                  basket.map((item, itemIndex) => (itemIndex === index ? { ...item, qty } : item)),
                )
              }
              onRemove={(index) =>
                setBasketStored(basket.filter((_, itemIndex) => itemIndex !== index))
              }
              deliveryFree={deliveryFree}
              deliveryCost={deliveryCost}
              onDeliveryFree={setDeliveryFree}
              onDeliveryCost={setDeliveryCost}
              onRecord={(notes) => setEnteredPurchases((prev) => [...notes, ...prev])}
            />
          ) : null}
          {tab === "history" ? (
            <HistoryPanel
              purchases={purchases}
              onRemove={(id) =>
                setEnteredPurchases((prev) => prev.filter((purchase) => purchase.id !== id))
              }
            />
          ) : null}
          {tab === "offers" ? (
            <OffersPanel
              offers={offers}
              memberships={memberships}
              rules={catalogue.preferenceRules}
              retailers={catalogue.retailers}
              onAddOffer={(offer) => setEnteredOffers((prev) => [offer, ...prev])}
              onRemoveOffer={(id) =>
                setEnteredOffers((prev) => prev.filter((offer) => offer.id !== id))
              }
              onAddMembership={(membership) =>
                setEnteredMemberships((prev) => [membership, ...prev])
              }
              onRemoveMembership={(id) =>
                setEnteredMemberships((prev) => prev.filter((membership) => membership.id !== id))
              }
            />
          ) : null}
        </div>

        <footer className="pb-6 text-sm text-muted-foreground">
          <p>{ORDER_BOUNDARY}</p>
          <p className="mt-1">Saved prices change only when you record them.</p>
        </footer>
      </div>
    </div>
  );
}
