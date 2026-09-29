-- Happy Cats catalogue for a future Cloudflare D1 database.
-- Map each table to a Drizzle sqliteTable of the same name.
-- The Lovable app does not open a database. It reads src/lib/catalogue.ts
-- and keeps household edits in the browser.
--
-- The public page check must never INSERT into price_observations.
-- written_by_price_check is constrained to 0 so a later adapter cannot
-- record a fetched page as a saved unit price.

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  variant_noun TEXT NOT NULL,
  variant_noun_plural TEXT NOT NULL,
  unit_noun TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE brands (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  origin TEXT,
  summary TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE retailers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  delivers_to_household INTEGER NOT NULL DEFAULT 0,
  note TEXT
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  brand_id TEXT NOT NULL REFERENCES brands(id),
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  measure TEXT NOT NULL,
  form TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'excluded', 'review')),
  reason TEXT
);

CREATE TABLE product_attributes (
  product_id TEXT NOT NULL REFERENCES products(id),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  PRIMARY KEY (product_id, label)
);

CREATE TABLE price_observations (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  retailer_id TEXT NOT NULL REFERENCES retailers(id),
  pack_label TEXT NOT NULL,
  units_per_pack INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  pack_total REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  trust TEXT NOT NULL CHECK (trust IN ('verified', 'manual', 'receipt')),
  observed_on TEXT NOT NULL,
  note TEXT,
  origin TEXT NOT NULL CHECK (origin IN ('reference', 'entered')),
  written_by_price_check INTEGER NOT NULL DEFAULT 0 CHECK (written_by_price_check = 0)
);

CREATE TABLE pets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sex TEXT NOT NULL,
  age_label TEXT NOT NULL
);

CREATE TABLE household (
  id TEXT PRIMARY KEY,
  postcode TEXT NOT NULL,
  city TEXT NOT NULL,
  portions_label TEXT NOT NULL,
  flavours_per_day INTEGER NOT NULL,
  portions_midpoint INTEGER NOT NULL
);

CREATE TABLE preference_rules (
  id TEXT PRIMARY KEY,
  effect TEXT NOT NULL CHECK (effect IN ('wanted', 'excluded', 'review')),
  text TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE purchases (
  id TEXT PRIMARY KEY,
  purchased_on TEXT NOT NULL,
  retailer_id TEXT NOT NULL REFERENCES retailers(id),
  kind TEXT NOT NULL CHECK (kind IN ('receipt', 'order')),
  origin TEXT NOT NULL CHECK (origin IN ('reference', 'entered')),
  total REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  note TEXT
);

CREATE TABLE purchase_lines (
  id TEXT PRIMARY KEY,
  purchase_id TEXT NOT NULL REFERENCES purchases(id),
  label TEXT NOT NULL,
  qty INTEGER NOT NULL,
  total REAL NOT NULL
);

CREATE TABLE saved_offers (
  id TEXT PRIMARY KEY,
  retailer_id TEXT NOT NULL REFERENCES retailers(id),
  detail TEXT NOT NULL,
  recorded_on TEXT,
  live INTEGER NOT NULL DEFAULT 0 CHECK (live = 0),
  origin TEXT NOT NULL CHECK (origin IN ('reference', 'entered'))
);

CREATE TABLE memberships (
  id TEXT PRIMARY KEY,
  retailer_id TEXT NOT NULL REFERENCES retailers(id),
  detail TEXT NOT NULL,
  recorded_on TEXT,
  live INTEGER NOT NULL DEFAULT 0 CHECK (live = 0),
  origin TEXT NOT NULL CHECK (origin IN ('reference', 'entered'))
);

CREATE TABLE loyalty_snapshots (
  id TEXT PRIMARY KEY,
  retailer_id TEXT NOT NULL REFERENCES retailers(id),
  points INTEGER NOT NULL,
  recorded_on TEXT,
  live INTEGER NOT NULL DEFAULT 0 CHECK (live = 0),
  note TEXT NOT NULL
);
