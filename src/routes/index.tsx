import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Dashboard } from "@/components/happy/Dashboard";
import { BrandAccordion } from "@/components/happy/BrandAccordion";
import { BasketBuilder, type BasketItem } from "@/components/happy/BasketBuilder";
import { HistoryPanel } from "@/components/happy/HistoryPanel";
import { OffersPanel } from "@/components/happy/OffersPanel";
import { useStoredState } from "@/lib/use-stored-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy Cats — wet cat food price comparison" },
      {
        name: "description",
        content:
          "A private shopping assistant for Sushi and Miso: compare verified pouch prices across Spanish pet shops, keep favourites and build a mixed basket.",
      },
      { property: "og:title", content: "Happy Cats — wet cat food price comparison" },
      {
        property: "og:description",
        content:
          "Compare verified wet cat food prices across retailers, track favourites and plan a mixed basket.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TABS = [
  { id: "catalogue", label: "Catalogue" },
  { id: "favourites", label: "Favourites" },
  { id: "basket", label: "Basket" },
  { id: "history", label: "History" },
  { id: "offers", label: "Offers & rules" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Index() {
  const [tab, setTab] = useState<TabId>("catalogue");
  const [favourites, setFavourites] = useStoredState<string[]>("hc-favourites", [
    "retorn-chicken",
    "retorn-tuna-salmon",
  ]);
  const [stock, setStock] = useStoredState<number>("hc-stock", 42);
  const [basket, setBasket] = useStoredState<BasketItem[]>("hc-basket", []);
  const [deliveryFree, setDeliveryFree] = useStoredState<number>("hc-free-over", 49);
  const [deliveryCost, setDeliveryCost] = useStoredState<number>("hc-ship", 4.95);

  const toggleFavourite = (id: string) =>
    setFavourites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  const addToBasket = (flavourId: string, retailer: string) => {
    setBasket((prev) => {
      const i = prev.findIndex((b) => b.flavourId === flavourId && b.retailer === retailer);
      if (i === -1) return [...prev, { flavourId, retailer, qty: 6 }];
      return prev.map((b, idx) => (idx === i ? { ...b, qty: b.qty + 6 } : b));
    });
    setTab("basket");
  };

  const basketCount = basket.reduce((a, b) => a + b.qty, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Private shopping assistant
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl">Happy Cats</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Which flavour is the best value right now, and where should you buy it?
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <Dashboard favourites={favourites} stock={stock} onStockChange={setStock} />

        <nav aria-label="Shopping sections" className="w-full">
          <ul className="flex w-full flex-wrap gap-2 rounded-xl border border-border bg-card p-1.5">
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  aria-current={tab === t.id ? "page" : undefined}
                  onClick={() => setTab(t.id)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:px-4 ${
                    tab === t.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {t.label}
                  {t.id === "basket" && basketCount > 0 ? (
                    <span className="num ml-1.5">({basketCount})</span>
                  ) : null}
                  {t.id === "favourites" && favourites.length > 0 ? (
                    <span className="num ml-1.5">({favourites.length})</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="w-full">
          {tab === "catalogue" && (
            <BrandAccordion
              favourites={favourites}
              onToggleFavourite={toggleFavourite}
              onAdd={addToBasket}
            />
          )}
          {tab === "favourites" && (
            <BrandAccordion
              favourites={favourites}
              onToggleFavourite={toggleFavourite}
              onAdd={addToBasket}
              onlyFavourites
            />
          )}
          {tab === "basket" && (
            <BasketBuilder
              items={basket}
              onQty={(i, qty) => setBasket((p) => p.map((b, idx) => (idx === i ? { ...b, qty } : b)))}
              onRemove={(i) => setBasket((p) => p.filter((_, idx) => idx !== i))}
              deliveryFree={deliveryFree}
              deliveryCost={deliveryCost}
              onDeliveryFree={setDeliveryFree}
              onDeliveryCost={setDeliveryCost}
            />
          )}
          {tab === "history" && <HistoryPanel />}
          {tab === "offers" && <OffersPanel />}
        </div>

        <footer className="pb-8 text-xs text-muted-foreground">
          Happy Cats suggests baskets for you to approve. It never places orders or payments, and
          saved prices are only updated by hand.
        </footer>
      </main>
    </div>
  );
}
