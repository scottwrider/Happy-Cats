import { getSeedCatalogue, type Catalogue } from "@/lib/catalogue";

/**
 * Read seam for the catalogue.
 *
 * The app calls load() from the home route. Today that returns the bundled
 * seed. A Cloudflare D1 adapter would implement the same method with Drizzle
 * queries against schema.sql and return the same Catalogue shape.
 *
 * Household edits (hearts, stock, basket, typed prices, offers, memberships,
 * purchase notes) stay in localStorage until there is a private database.
 * They are not part of this read.
 *
 * Do not call load() or any write from the public page check.
 */
export interface CatalogueSource {
  load(): Catalogue | Promise<Catalogue>;
}

export const seedCatalogueSource: CatalogueSource = {
  load: () => getSeedCatalogue(),
};
