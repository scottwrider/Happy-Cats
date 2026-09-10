export type TrustLevel = "verified" | "manual" | "receipt";
export type FlavourStatus = "approved" | "excluded" | "review";

export type Listing = {
  retailer: string;
  packSize: string;
  unitsPerPack: number;
  unitPrice: number;
  trust: TrustLevel;
  lastChecked: string;
  note?: string;
};

export type Flavour = {
  id: string;
  name: string;
  grams: number;
  texture: string;
  status: FlavourStatus;
  reason?: string;
  listings: Listing[];
};

export type Brand = {
  id: string;
  name: string;
  origin: string;
  blurb: string;
  flavours: Flavour[];
};

export const CATS = [
  { name: "Sushi", detail: "male, ~4 years" },
  { name: "Miso", detail: "female, ~1 year" },
];

export const HOUSEHOLD = {
  postcode: "28004, Madrid",
  portionsPerDay: "6–8 wet portions",
  flavoursPerDay: 4,
};

export const RETAILERS = [
  "Naturanimal",
  "TodoMascota",
  "Retorn",
  "Canagan Spain",
  "MascotaSana",
  "ZOOCITY",
  "El Corte Inglés",
  "Carrefour marketplace",
  "Zooplus",
  "Nutritienda",
];

export const PREFERENCES = {
  wanted: ["Small chunks or flakes", "Gravy or broth", "Wet pouches"],
  excluded: ["Prawns", "Mussels", "Jelly", "Wheat", "Sausage-like textures", "Large fish chunks"],
  review: ["Any recipe containing vegetables"],
};

export const BRANDS: Brand[] = [
  {
    id: "retorn",
    name: "Retorn",
    origin: "Spain",
    blurb: "Small chunks in broth, 80 g pouches. House staple.",
    flavours: [
      {
        id: "retorn-chicken",
        name: "Chicken",
        grams: 80,
        texture: "Chunks in broth",
        status: "approved",
        listings: [
          {
            retailer: "Naturanimal",
            packSize: "single 80 g",
            unitsPerPack: 1,
            unitPrice: 1.55,
            trust: "receipt",
            lastChecked: "2026-09-03",
            note: "In-store receipt",
          },
          {
            retailer: "TodoMascota",
            packSize: "18 × 80 g",
            unitsPerPack: 18,
            unitPrice: 1.33,
            trust: "receipt",
            lastChecked: "2026-03-31",
            note: "€23.94 for the pack, free delivery",
          },
          {
            retailer: "ZOOCITY",
            packSize: "12 × 80 g",
            unitsPerPack: 12,
            unitPrice: 1.49,
            trust: "manual",
            lastChecked: "2026-08-28",
            note: "Entered by hand from the shelf",
          },
        ],
      },
      {
        id: "retorn-tuna-salmon",
        name: "Tuna & salmon",
        grams: 80,
        texture: "Flakes in broth",
        status: "approved",
        listings: [
          {
            retailer: "TodoMascota",
            packSize: "24 × 80 g",
            unitsPerPack: 24,
            unitPrice: 1.53,
            trust: "verified",
            lastChecked: "2026-09-09",
            note: "Confirmed on the product page",
          },
          {
            retailer: "Naturanimal",
            packSize: "single 80 g",
            unitsPerPack: 1,
            unitPrice: 1.85,
            trust: "receipt",
            lastChecked: "2026-09-03",
          },
        ],
      },
      {
        id: "retorn-chicken-rabbit",
        name: "Chicken & rabbit",
        grams: 80,
        texture: "Chunks in broth",
        status: "approved",
        listings: [
          {
            retailer: "TodoMascota",
            packSize: "18 × 80 g",
            unitsPerPack: 18,
            unitPrice: 1.33,
            trust: "receipt",
            lastChecked: "2026-03-31",
          },
          {
            retailer: "MascotaSana",
            packSize: "6 × 80 g",
            unitsPerPack: 6,
            unitPrice: 1.62,
            trust: "manual",
            lastChecked: "2026-07-14",
          },
        ],
      },
      {
        id: "retorn-tuna-prawn",
        name: "Tuna & prawn",
        grams: 80,
        texture: "Flakes with whole prawns",
        status: "excluded",
        reason: "Contains prawns",
        listings: [
          {
            retailer: "Zooplus",
            packSize: "12 × 80 g",
            unitsPerPack: 12,
            unitPrice: 1.41,
            trust: "manual",
            lastChecked: "2026-06-02",
          },
        ],
      },
    ],
  },
  {
    id: "canagan",
    name: "Canagan",
    origin: "United Kingdom",
    blurb: "75 g pouches, grain free. Slightly pricier per pouch.",
    flavours: [
      {
        id: "canagan-chicken-beef",
        name: "Chicken & beef",
        grams: 75,
        texture: "Chunks in gravy",
        status: "approved",
        listings: [
          {
            retailer: "Naturanimal",
            packSize: "single 75 g",
            unitsPerPack: 1,
            unitPrice: 1.95,
            trust: "receipt",
            lastChecked: "2026-09-03",
          },
          {
            retailer: "Canagan Spain",
            packSize: "12 × 75 g",
            unitsPerPack: 12,
            unitPrice: 1.79,
            trust: "verified",
            lastChecked: "2026-09-08",
          },
        ],
      },
      {
        id: "canagan-chicken-sardines",
        name: "Chicken & sardines",
        grams: 75,
        texture: "Flakes in gravy",
        status: "approved",
        listings: [
          {
            retailer: "Naturanimal",
            packSize: "single 75 g",
            unitsPerPack: 1,
            unitPrice: 1.95,
            trust: "receipt",
            lastChecked: "2026-09-03",
          },
          {
            retailer: "Nutritienda",
            packSize: "8 × 75 g",
            unitsPerPack: 8,
            unitPrice: 1.88,
            trust: "manual",
            lastChecked: "2026-08-11",
          },
        ],
      },
      {
        id: "canagan-tuna-salmon",
        name: "Tuna & salmon",
        grams: 75,
        texture: "Flakes in gravy",
        status: "approved",
        listings: [
          {
            retailer: "Naturanimal",
            packSize: "single 75 g",
            unitsPerPack: 1,
            unitPrice: 1.95,
            trust: "receipt",
            lastChecked: "2026-09-03",
          },
          {
            retailer: "El Corte Inglés",
            packSize: "12 × 75 g",
            unitsPerPack: 12,
            unitPrice: 2.05,
            trust: "manual",
            lastChecked: "2026-05-20",
          },
        ],
      },
      {
        id: "canagan-chicken-vegetables",
        name: "Chicken with garden vegetables",
        grams: 75,
        texture: "Chunks in gravy with peas and carrot",
        status: "review",
        reason: "Contains vegetables — needs review",
        listings: [
          {
            retailer: "Carrefour marketplace",
            packSize: "6 × 75 g",
            unitsPerPack: 6,
            unitPrice: 1.99,
            trust: "manual",
            lastChecked: "2026-04-17",
          },
        ],
      },
    ],
  },
];

export type Purchase = {
  id: string;
  date: string;
  retailer: string;
  kind: "receipt" | "order";
  lines: { label: string; qty: number; total: number }[];
  total: number;
  note?: string;
};

export const PURCHASES: Purchase[] = [
  {
    id: "naturanimal-2026-09-03",
    date: "2026-09-03",
    retailer: "Naturanimal",
    kind: "receipt",
    lines: [
      { label: "Retorn chicken 80 g", qty: 1, total: 1.55 },
      { label: "Retorn tuna & salmon 80 g", qty: 1, total: 1.85 },
      { label: "Canagan chicken & beef 75 g", qty: 1, total: 1.95 },
      { label: "Canagan chicken & sardines 75 g", qty: 1, total: 1.95 },
      { label: "Canagan tuna & salmon 75 g", qty: 1, total: 1.95 },
    ],
    total: 9.25,
    note: "In-store, single pouches",
  },
  {
    id: "todomascota-2026-03-31",
    date: "2026-03-31",
    retailer: "TodoMascota",
    kind: "order",
    lines: [
      { label: "Retorn tuna & salmon 80 g", qty: 24, total: 36.83 },
      { label: "Retorn chicken 80 g", qty: 18, total: 23.94 },
      { label: "Retorn chicken & rabbit 80 g", qty: 18, total: 23.94 },
    ],
    total: 84.71,
    note: "Free delivery on this order",
  },
];

export type SavedOffer = {
  id: string;
  retailer: string;
  detail: string;
  recorded: string;
};

export const SAVED_OFFERS: SavedOffer[] = [
  {
    id: "todomascota-free-delivery",
    retailer: "TodoMascota",
    detail: "Free delivery over €49 on wet food orders",
    recorded: "2026-03-31",
  },
  {
    id: "zoocity-points",
    retailer: "ZOOCITY",
    detail: "Loyalty balance 154 points — last known, not live",
    recorded: "2026-02-10",
  },
  {
    id: "naturanimal-bulk",
    retailer: "Naturanimal",
    detail: "5% off when buying 12 pouches or more in store",
    recorded: "2026-09-03",
  },
];

export const MEMBERSHIPS = [
  { retailer: "ZOOCITY", status: "Club card, delivers to 28004", recorded: "2026-02-10" },
  { retailer: "TodoMascota", status: "Account with saved address", recorded: "2026-03-31" },
];

export const TRUST_LABEL: Record<TrustLevel, string> = {
  verified: "Verified",
  manual: "Manual",
  receipt: "Receipt",
};

export const STATUS_LABEL: Record<FlavourStatus, string> = {
  approved: "Suitable",
  excluded: "Excluded",
  review: "Needs review",
};

export const euro = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso + "T00:00:00"),
  );

export const ALL_FLAVOURS = BRANDS.flatMap((b) =>
  b.flavours.map((f) => ({ ...f, brandName: b.name, brandId: b.id })),
);

export const findFlavour = (id: string) => ALL_FLAVOURS.find((f) => f.id === id);

export const bestListing = (f: Flavour) =>
  [...f.listings].sort((a, b) => a.unitPrice - b.unitPrice)[0]!;
