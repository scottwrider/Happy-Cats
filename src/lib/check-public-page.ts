import { createServerFn } from "@tanstack/react-start";
import { runPriceCheck } from "./run-price-check";

/**
 * Server endpoint for a single public shop page.
 * The handler returns text only. It does not receive the catalogue and
 * cannot write a saved unit price.
 */
export const checkPublicPage = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object" || !("url" in input)) return { url: "" };
    const url = (input as { url: unknown }).url;
    return { url: typeof url === "string" ? url : "" };
  })
  .handler(async ({ data }) => runPriceCheck(data.url, fetch));
