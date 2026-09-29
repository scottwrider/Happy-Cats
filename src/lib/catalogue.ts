/**
 * Household catalogue.
 *
 * The types match src/db/schema.sql so a later Cloudflare D1 + Drizzle adapter
 * can replace getSeedCatalogue() without renaming the shopping screens.
 * Nothing here is cat-food-specific: a category owns brands, products, and
 * price observations. Wet food is the only category shipped in this pass.
 *
 * Seeded unit prices come only from the benchmark receipts. Other shops are
 * listed with no price until someone records one. The public page check must
 * never insert a price observation.
 */

export type TrustLevel = "verified" | "manual" | "receipt";
export type ProductStatus = "approved" | "excluded" | "review";
export type PreferenceEffect = "wanted" | "excluded" | "review";
export type RecordOrigin = "reference" | "entered";

export type Category = {
  id: string;
  name: string;
  variantNoun: string;
  variantNounPlural: string;
  unitNoun: string;
  sortOrder: number;
};

export type Retailer = {
  id: string;
  name: string;
  deliversToHousehold: boolean;
  note: string | null;
};

export type Listing = {
  id: string;
  productId: string;
  retailerId: string;
  retailerName: string;
  packLabel: string;
  unitsPerPack: number;
  /** Price for one unit (one pouch, for wet food). */
  unitPrice: number;
  /** Amount recorded for the whole pack. */
  packTotal: number;
  currency: "EUR";
  trust: TrustLevel;
  observedOn: string;
  note: string | null;
  origin: RecordOrigin;
  /** The page check is not allowed to set this to true. */
  writtenByPriceCheck: false;
};

export type Product = {
  id: string;
  categoryId: string;
  brandId: string;
  name: string;
  amount: number;
  measure: string;
  form: string;
  attributes: { label: string; value: string }[];
  status: ProductStatus;
  reason: string | null;
  listings: Listing[];
};

export type Brand = {
  id: string;
  categoryId: string;
  name: string;
  origin: string;
  summary: string;
  sortOrder: number;
  products: Product[];
};

export type Pet = {
  id: string;
  name: string;
  sex: string;
  ageLabel: string;
};

export type Household = {
  postcode: string;
  city: string;
  portionsLabel: string;
  flavoursPerDay: number;
  portionsMidpoint: number;
  alsoDryFood: boolean;
  mixedBulkWelcome: boolean;
};

export type PreferenceRule = {
  id: string;
  effect: PreferenceEffect;
  text: string;
  sortOrder: number;
};

export type PurchaseLine = {
  label: string;
  qty: number;
  total: number;
};

export type Purchase = {
  id: string;
  date: string;
  retailerId: string;
  retailerName: string;
  kind: "receipt" | "order";
  origin: RecordOrigin;
  lines: PurchaseLine[];
  total: number;
  note: string | null;
};

export type SavedOffer = {
  id: string;
  retailerId: string;
  retailerName: string;
  detail: string;
  recordedOn: string | null;
  live: false;
  origin: RecordOrigin;
};

export type Membership = {
  id: string;
  retailerId: string;
  retailerName: string;
  detail: string;
  recordedOn: string | null;
  live: false;
  origin: RecordOrigin;
};

export type LoyaltySnapshot = {
  id: string;
  retailerId: string;
  retailerName: string;
  points: number;
  recordedOn: string | null;
  live: false;
  note: string;
};

export type Catalogue = {
  categories: Category[];
  brands: Brand[];
  retailers: Retailer[];
  pets: Pet[];
  household: Household;
  preferenceRules: PreferenceRule[];
  purchases: Purchase[];
  offers: SavedOffer[];
  memberships: Membership[];
  loyalty: LoyaltySnapshot[];
};

export const TRUST_LABEL: Record<TrustLevel, string> = {
  verified: "Verified",
  manual: "Manual",
  receipt: "Receipt",
};

export const STATUS_LABEL: Record<ProductStatus, string> = {
  approved: "Approved",
  excluded: "Excluded",
  review: "Needs review",
};

const receipt = (
  listing: Omit<Listing, "currency" | "trust" | "origin" | "writtenByPriceCheck">,
): Listing => ({
  ...listing,
  currency: "EUR",
  trust: "receipt",
  origin: "reference",
  writtenByPriceCheck: false,
});

const SEED: Catalogue = {
  categories: [
    {
      id: "wet-food",
      name: "Wet food",
      variantNoun: "flavour",
      variantNounPlural: "flavours",
      unitNoun: "pouch",
      sortOrder: 0,
    },
  ],
  retailers: [
    {
      id: "naturanimal",
      name: "Naturanimal",
      deliversToHousehold: false,
      note: "In-store receipt on 3 Sep 2026.",
    },
    {
      id: "todomascota",
      name: "TodoMascota",
      deliversToHousehold: false,
      note: "Order on 31 Mar 2026, delivered free.",
    },
    {
      id: "retorn-shop",
      name: "Retorn",
      deliversToHousehold: false,
      note: null,
    },
    {
      id: "canagan-spain",
      name: "Canagan Spain",
      deliversToHousehold: false,
      note: null,
    },
    {
      id: "mascotasana",
      name: "MascotaSana",
      deliversToHousehold: false,
      note: null,
    },
    {
      id: "zoocity",
      name: "ZOOCITY",
      deliversToHousehold: true,
      note: "Confirmed to deliver to 28004. Loyalty is not connected.",
    },
    {
      id: "el-corte-ingles",
      name: "El Corte Inglés",
      deliversToHousehold: false,
      note: null,
    },
    {
      id: "carrefour",
      name: "Carrefour marketplace",
      deliversToHousehold: false,
      note: null,
    },
    {
      id: "zooplus",
      name: "Zooplus",
      deliversToHousehold: false,
      note: null,
    },
    {
      id: "nutritienda",
      name: "Nutritienda",
      deliversToHousehold: false,
      note: null,
    },
  ],
  pets: [
    { id: "sushi", name: "Sushi", sex: "male", ageLabel: "about 4 years old" },
    { id: "miso", name: "Miso", sex: "female", ageLabel: "about 1 year old" },
  ],
  household: {
    postcode: "28004",
    city: "Madrid",
    portionsLabel: "6–8 wet portions a day",
    flavoursPerDay: 4,
    portionsMidpoint: 7,
    alsoDryFood: true,
    mixedBulkWelcome: true,
  },
  preferenceRules: [
    { id: "chunks", effect: "wanted", text: "Small chunks or flakes", sortOrder: 0 },
    { id: "gravy", effect: "wanted", text: "Gravy or broth", sortOrder: 1 },
    { id: "pouches", effect: "wanted", text: "Wet pouches", sortOrder: 2 },
    { id: "new-foods", effect: "wanted", text: "New suitable foods can be proposed", sortOrder: 3 },
    {
      id: "mixed-bulk",
      effect: "wanted",
      text: "Mixed bulk purchases are welcome",
      sortOrder: 4,
    },
    { id: "prawns", effect: "excluded", text: "Prawns", sortOrder: 5 },
    { id: "mussels", effect: "excluded", text: "Mussels", sortOrder: 6 },
    { id: "jelly", effect: "excluded", text: "Jelly", sortOrder: 7 },
    { id: "wheat", effect: "excluded", text: "Wheat", sortOrder: 8 },
    { id: "sausage", effect: "excluded", text: "Sausage-like textures", sortOrder: 9 },
    { id: "large-fish", effect: "excluded", text: "Large fish chunks", sortOrder: 10 },
    {
      id: "vegetables",
      effect: "review",
      text: "Any recipe containing vegetables",
      sortOrder: 11,
    },
  ],
  brands: [
    {
      id: "retorn",
      categoryId: "wet-food",
      name: "Retorn",
      origin: "Spain",
      summary: "80 g wet pouches. First brand to compare.",
      sortOrder: 0,
      products: [
        {
          id: "retorn-chicken",
          categoryId: "wet-food",
          brandId: "retorn",
          name: "Chicken",
          amount: 80,
          measure: "g",
          form: "pouch",
          attributes: [{ label: "Texture", value: "Chunks in broth" }],
          status: "approved",
          reason: null,
          listings: [
            receipt({
              id: "retorn-chicken-naturanimal",
              productId: "retorn-chicken",
              retailerId: "naturanimal",
              retailerName: "Naturanimal",
              packLabel: "1 × 80 g",
              unitsPerPack: 1,
              unitPrice: 1.55,
              packTotal: 1.55,
              observedOn: "2026-09-03",
              note: "Naturanimal receipt, 3 Sep 2026.",
            }),
            receipt({
              id: "retorn-chicken-todomascota",
              productId: "retorn-chicken",
              retailerId: "todomascota",
              retailerName: "TodoMascota",
              packLabel: "18 × 80 g",
              unitsPerPack: 18,
              unitPrice: 23.94 / 18,
              packTotal: 23.94,
              observedOn: "2026-03-31",
              note: "18 pouches for €23.94 on the 31 Mar 2026 order. Free delivery on that order.",
            }),
          ],
        },
        {
          id: "retorn-tuna-salmon",
          categoryId: "wet-food",
          brandId: "retorn",
          name: "Tuna & salmon",
          amount: 80,
          measure: "g",
          form: "pouch",
          attributes: [{ label: "Texture", value: "Flakes in broth" }],
          status: "approved",
          reason: null,
          listings: [
            receipt({
              id: "retorn-tuna-naturanimal",
              productId: "retorn-tuna-salmon",
              retailerId: "naturanimal",
              retailerName: "Naturanimal",
              packLabel: "1 × 80 g",
              unitsPerPack: 1,
              unitPrice: 1.85,
              packTotal: 1.85,
              observedOn: "2026-09-03",
              note: "Naturanimal receipt, 3 Sep 2026.",
            }),
            receipt({
              id: "retorn-tuna-todomascota",
              productId: "retorn-tuna-salmon",
              retailerId: "todomascota",
              retailerName: "TodoMascota",
              packLabel: "24 × 80 g",
              unitsPerPack: 24,
              unitPrice: 36.83 / 24,
              packTotal: 36.83,
              observedOn: "2026-03-31",
              note: "24 pouches for €36.83 on the 31 Mar 2026 order. Free delivery on that order.",
            }),
          ],
        },
        {
          id: "retorn-chicken-rabbit",
          categoryId: "wet-food",
          brandId: "retorn",
          name: "Chicken & rabbit",
          amount: 80,
          measure: "g",
          form: "pouch",
          attributes: [{ label: "Texture", value: "Chunks in broth" }],
          status: "approved",
          reason: null,
          listings: [
            receipt({
              id: "retorn-rabbit-todomascota",
              productId: "retorn-chicken-rabbit",
              retailerId: "todomascota",
              retailerName: "TodoMascota",
              packLabel: "18 × 80 g",
              unitsPerPack: 18,
              unitPrice: 23.94 / 18,
              packTotal: 23.94,
              observedOn: "2026-03-31",
              note: "18 pouches for €23.94 on the 31 Mar 2026 order. Free delivery on that order.",
            }),
          ],
        },
        {
          id: "retorn-tuna-prawn",
          categoryId: "wet-food",
          brandId: "retorn",
          name: "Tuna & prawn",
          amount: 80,
          measure: "g",
          form: "pouch",
          attributes: [{ label: "Texture", value: "Contains prawns" }],
          status: "excluded",
          reason: "Contains prawns",
          listings: [],
        },
      ],
    },
    {
      id: "canagan",
      categoryId: "wet-food",
      name: "Canagan",
      origin: "United Kingdom",
      summary: "75 g wet pouches.",
      sortOrder: 1,
      products: [
        {
          id: "canagan-chicken-beef",
          categoryId: "wet-food",
          brandId: "canagan",
          name: "Chicken & beef",
          amount: 75,
          measure: "g",
          form: "pouch",
          attributes: [{ label: "Texture", value: "Chunks in gravy" }],
          status: "approved",
          reason: null,
          listings: [
            receipt({
              id: "canagan-beef-naturanimal",
              productId: "canagan-chicken-beef",
              retailerId: "naturanimal",
              retailerName: "Naturanimal",
              packLabel: "1 × 75 g",
              unitsPerPack: 1,
              unitPrice: 1.95,
              packTotal: 1.95,
              observedOn: "2026-09-03",
              note: "Naturanimal receipt, 3 Sep 2026.",
            }),
          ],
        },
        {
          id: "canagan-chicken-sardines",
          categoryId: "wet-food",
          brandId: "canagan",
          name: "Chicken & sardines",
          amount: 75,
          measure: "g",
          form: "pouch",
          attributes: [{ label: "Texture", value: "Flakes in gravy" }],
          status: "approved",
          reason: null,
          listings: [
            receipt({
              id: "canagan-sardines-naturanimal",
              productId: "canagan-chicken-sardines",
              retailerId: "naturanimal",
              retailerName: "Naturanimal",
              packLabel: "1 × 75 g",
              unitsPerPack: 1,
              unitPrice: 1.95,
              packTotal: 1.95,
              observedOn: "2026-09-03",
              note: "Naturanimal receipt, 3 Sep 2026.",
            }),
          ],
        },
        {
          id: "canagan-tuna-salmon",
          categoryId: "wet-food",
          brandId: "canagan",
          name: "Tuna & salmon",
          amount: 75,
          measure: "g",
          form: "pouch",
          attributes: [{ label: "Texture", value: "Flakes in gravy" }],
          status: "approved",
          reason: null,
          listings: [
            receipt({
              id: "canagan-tuna-naturanimal",
              productId: "canagan-tuna-salmon",
              retailerId: "naturanimal",
              retailerName: "Naturanimal",
              packLabel: "1 × 75 g",
              unitsPerPack: 1,
              unitPrice: 1.95,
              packTotal: 1.95,
              observedOn: "2026-09-03",
              note: "Naturanimal receipt, 3 Sep 2026.",
            }),
          ],
        },
        {
          id: "canagan-chicken-vegetables",
          categoryId: "wet-food",
          brandId: "canagan",
          name: "Chicken with vegetables",
          amount: 75,
          measure: "g",
          form: "pouch",
          attributes: [{ label: "Texture", value: "Contains vegetables" }],
          status: "review",
          reason: "Contains vegetables — needs review",
          listings: [],
        },
      ],
    },
  ],
  purchases: [
    {
      id: "naturanimal-2026-09-03",
      date: "2026-09-03",
      retailerId: "naturanimal",
      retailerName: "Naturanimal",
      kind: "receipt",
      origin: "reference",
      lines: [
        { label: "Retorn chicken 80 g", qty: 1, total: 1.55 },
        { label: "Retorn tuna/salmon 80 g", qty: 1, total: 1.85 },
        { label: "Canagan chicken/beef 75 g", qty: 1, total: 1.95 },
        { label: "Canagan chicken/sardines 75 g", qty: 1, total: 1.95 },
        { label: "Canagan tuna/salmon 75 g", qty: 1, total: 1.95 },
      ],
      total: 9.25,
      note: "In-store, single pouches.",
    },
    {
      id: "todomascota-2026-03-31",
      date: "2026-03-31",
      retailerId: "todomascota",
      retailerName: "TodoMascota",
      kind: "order",
      origin: "reference",
      lines: [
        { label: "Retorn tuna/salmon 80 g", qty: 24, total: 36.83 },
        { label: "Retorn chicken 80 g", qty: 18, total: 23.94 },
        { label: "Retorn chicken/rabbit 80 g", qty: 18, total: 23.94 },
      ],
      total: 84.71,
      note: "Free delivery on this order.",
    },
  ],
  offers: [
    {
      id: "todomascota-free-delivery-2026-03-31",
      retailerId: "todomascota",
      retailerName: "TodoMascota",
      detail: "Free delivery on the 31 Mar 2026 order. Not a live promotion.",
      recordedOn: "2026-03-31",
      live: false,
      origin: "reference",
    },
  ],
  memberships: [
    {
      id: "zoocity-delivers",
      retailerId: "zoocity",
      retailerName: "ZOOCITY",
      detail: "Confirmed to deliver to 28004. Shop sign-in is not connected.",
      recordedOn: null,
      live: false,
      origin: "reference",
    },
  ],
  loyalty: [
    {
      id: "zoocity-points",
      retailerId: "zoocity",
      retailerName: "ZOOCITY",
      points: 154,
      recordedOn: null,
      live: false,
      note: "Last known balance. Historical, not a live loyalty sync.",
    },
  ],
};

export function getSeedCatalogue(): Catalogue {
  const catalogue = structuredClone(SEED);
  catalogue.brands.sort((a, b) => a.sortOrder - b.sortOrder);
  catalogue.preferenceRules.sort((a, b) => a.sortOrder - b.sortOrder);
  return catalogue;
}

export const euro = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

export const formatDate = (iso: string | null) => {
  if (!iso) return "Date not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
};

export const lineTotal = (unitPrice: number, qty: number) =>
  Math.round(unitPrice * qty * 100) / 100;

export function daysOfFood(pouches: number, midpoint: number) {
  if (midpoint <= 0) return 0;
  return Math.floor(pouches / midpoint);
}

export type PricedProduct = { brand: Brand; product: Product; listing: Listing };

export function bestRecordedPrice(brands: Brand[]): PricedProduct | null {
  const rows: PricedProduct[] = [];
  for (const brand of brands) {
    for (const product of brand.products) {
      if (product.status !== "approved") continue;
      for (const listing of product.listings) rows.push({ brand, product, listing });
    }
  }
  if (rows.length === 0) return null;
  const verified = rows.filter((row) => row.listing.trust === "verified");
  const manual = rows.filter((row) => row.listing.trust === "manual");
  const pool = verified.length > 0 ? verified : manual.length > 0 ? manual : rows;
  pool.sort(
    (a, b) =>
      a.listing.unitPrice - b.listing.unitPrice || a.product.name.localeCompare(b.product.name),
  );
  return pool[0] ?? null;
}

export function latestObservedOn(brands: Brand[]): string | null {
  let latest: string | null = null;
  for (const brand of brands) {
    for (const product of brand.products) {
      for (const listing of product.listings) {
        if (latest === null || listing.observedOn > latest) latest = listing.observedOn;
      }
    }
  }
  return latest;
}

export function findListing(brands: Brand[], listingId: string): PricedProduct | null {
  for (const brand of brands) {
    for (const product of brand.products) {
      for (const listing of product.listings) {
        if (listing.id === listingId) return { brand, product, listing };
      }
    }
  }
  return null;
}

export function findProduct(brands: Brand[], productId: string) {
  for (const brand of brands) {
    for (const product of brand.products) {
      if (product.id === productId) return { brand, product };
    }
  }
  return null;
}

export function retailerById(retailers: Retailer[], id: string) {
  return retailers.find((retailer) => retailer.id === id) ?? null;
}
