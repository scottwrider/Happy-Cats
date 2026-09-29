export const AUTH_BOUNDARY =
  "Sign-in is not connected. This Lovable project has no Cloudflare Sites authentication, and no login is simulated. Keep it on a private household device.";

export const ORDER_BOUNDARY =
  "Happy Cats only recommends a basket for you to approve. It never places an order or takes a payment.";

export const PRICE_CHECK_BOUNDARY =
  "A public page check reads one https shop page. It refuses other websites and redirects, stops after a size and time cap, and never saves a unit price.";

export const STUBS = [
  {
    id: "oauth",
    title: "Retailer account sign-in",
    detail: "OAuth and shop sessions are not connected.",
  },
  {
    id: "loyalty",
    title: "Live loyalty",
    detail: "The ZOOCITY balance of 154 points is historical. It is not synced.",
  },
  {
    id: "scanning",
    title: "Automatic price scanning",
    detail: "Nothing scans shops in the background or writes prices on its own.",
  },
  {
    id: "ocr",
    title: "Receipt recognition",
    detail: "Photos and OCR are not available. Receipts are typed in.",
  },
  {
    id: "voice",
    title: "Voice controls",
    detail: "There is no conversational or voice interface.",
  },
  {
    id: "checkout",
    title: "Checkout",
    detail: "No orders and no payments. Buying still happens on the shop's own site.",
  },
] as const;
