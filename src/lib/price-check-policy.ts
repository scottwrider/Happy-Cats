/**
 * Host allowlist for the public page check.
 * Exact host match only (apex and www). Subdomains, IPs, and redirects are refused.
 */

export const PRICE_CHECK_APEX_HOSTS = [
  "naturanimal.es",
  "todomascota.es",
  "retorn.com",
  "canagan.es",
  "canagan.com",
  "mascotasana.es",
  "zoocity.hr",
  "elcorteingles.es",
  "carrefour.es",
  "zooplus.es",
  "nutritienda.com",
] as const;

export const ALLOWED_PRICE_CHECK_HOSTS = PRICE_CHECK_APEX_HOSTS.flatMap((host) => [
  host,
  `www.${host}`,
]);

const ALLOWED = new Set<string>(ALLOWED_PRICE_CHECK_HOSTS);

export const PRICE_CHECK_MAX_BYTES = 256 * 1024;
export const PRICE_CHECK_TIMEOUT_MS = 5_000;

export class PriceCheckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PriceCheckError";
  }
}

export function assertAllowedPriceCheckUrl(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new PriceCheckError("Enter a shop page address.");
  }
  if (trimmed.length > 2000) {
    throw new PriceCheckError("That address is too long.");
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new PriceCheckError("That address could not be read.");
  }

  if (url.protocol !== "https:") {
    throw new PriceCheckError("Only https shop pages can be checked.");
  }
  if (url.username || url.password) {
    throw new PriceCheckError("Addresses with a username or password are blocked.");
  }
  if (url.port !== "" && url.port !== "443") {
    throw new PriceCheckError("Only the standard https port can be checked.");
  }

  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!ALLOWED.has(host) || isBlockedHost(host)) {
    throw new PriceCheckError("That website is not on the shop list.");
  }

  url.hash = "";
  return url.toString();
}

function isBlockedHost(host: string): boolean {
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host.includes(":")) return true;
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
}
