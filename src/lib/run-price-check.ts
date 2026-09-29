/**
 * Reads one public shop page and returns text for a person to look at.
 *
 * It has no catalogue, no localStorage, and no database handle.
 * savedUnitPrice is always null. Callers must not treat priceHints as a
 * saved unit price.
 */

import {
  PRICE_CHECK_MAX_BYTES,
  PRICE_CHECK_TIMEOUT_MS,
  PriceCheckError,
  assertAllowedPriceCheckUrl,
} from "./price-check-policy";

export type PriceCheckResult = {
  ok: boolean;
  message: string;
  savedUnitPrice: null;
  requestedUrl: string | null;
  httpStatus: number | null;
  bytesRead: number | null;
  truncated: boolean;
  title: string | null;
  priceHints: string[];
  excerpt: string | null;
};

const empty = (message: string, requestedUrl: string | null = null): PriceCheckResult => ({
  ok: false,
  message,
  savedUnitPrice: null,
  requestedUrl,
  httpStatus: null,
  bytesRead: null,
  truncated: false,
  title: null,
  priceHints: [],
  excerpt: null,
});

export async function runPriceCheck(
  rawUrl: string,
  fetchImpl: typeof fetch,
): Promise<PriceCheckResult> {
  let requestedUrl: string;
  try {
    requestedUrl = assertAllowedPriceCheckUrl(rawUrl);
  } catch (error) {
    const message =
      error instanceof PriceCheckError ? error.message : "That page cannot be checked.";
    return empty(`${message} Nothing was saved.`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PRICE_CHECK_TIMEOUT_MS);

  try {
    const response = await fetchImpl(requestedUrl, {
      method: "GET",
      redirect: "error",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        accept: "text/html,application/xhtml+xml,text/plain;q=0.8",
        "user-agent": "HappyCatsPriceCheck/1.0",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      return {
        ...empty("Redirects are blocked. Nothing was saved.", requestedUrl),
        httpStatus: response.status,
      };
    }

    if (!response.ok) {
      await response.body?.cancel();
      return {
        ...empty(
          `The shop responded with status ${response.status}. Nothing was saved.`,
          requestedUrl,
        ),
        httpStatus: response.status,
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!isTextDocument(contentType)) {
      await response.body?.cancel();
      return {
        ...empty("That page is not a text document. Nothing was saved.", requestedUrl),
        httpStatus: response.status,
      };
    }

    if (!response.body) {
      return {
        ...empty("The page had no text. Nothing was saved.", requestedUrl),
        httpStatus: response.status,
      };
    }

    const read = await readAtMost(response.body, PRICE_CHECK_MAX_BYTES);
    const html = new TextDecoder("utf-8", { fatal: false }).decode(read.bytes);
    const title = extractTitle(html);
    const visible = visibleText(html);
    const priceHints = extractPriceHints(visible);

    return {
      ok: true,
      message: read.truncated
        ? "Read part of the page, then stopped at the size cap. Nothing was saved."
        : "Read the page. Nothing was saved.",
      savedUnitPrice: null,
      requestedUrl,
      httpStatus: response.status,
      bytesRead: read.bytes.byteLength,
      truncated: read.truncated,
      title,
      priceHints,
      excerpt: visible.slice(0, 280) || null,
    };
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    const message = error instanceof Error ? error.message : "";
    if (name === "AbortError" || name === "TimeoutError") {
      return empty("The check stopped because it took too long. Nothing was saved.", requestedUrl);
    }
    if (/redirect/i.test(message)) {
      return empty("Redirects are blocked. Nothing was saved.", requestedUrl);
    }
    return empty("The page could not be read. Nothing was saved.", requestedUrl);
  } finally {
    clearTimeout(timer);
  }
}

function isTextDocument(contentType: string) {
  const value = contentType.toLowerCase();
  return (
    value.includes("text/html") ||
    value.includes("text/plain") ||
    value.includes("application/xhtml+xml")
  );
}

async function readAtMost(stream: ReadableStream<Uint8Array>, maxBytes: number) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let truncated = false;

  try {
    while (size < maxBytes) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      const room = maxBytes - size;
      if (value.byteLength > room) {
        chunks.push(value.slice(0, room));
        size += room;
        truncated = true;
        break;
      }
      chunks.push(value);
      size += value.byteLength;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { bytes, truncated };
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]{0,300})<\/title>/i);
  const raw = match?.[1];
  if (!raw) return null;
  const title = cleanText(raw, 140);
  return title || null;
}

function visibleText(html: string) {
  const withoutCode = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  return cleanText(withoutCode, 20_000);
}

function extractPriceHints(text: string) {
  const hints: string[] = [];
  const pattern = /€\s?\d{1,4}(?:[.,]\d{2})?|\d{1,4}[.,]\d{2}\s?€/g;
  for (const match of text.matchAll(pattern)) {
    const hint = match[0]?.replace(/\s+/g, " ").trim();
    if (!hint || hints.includes(hint)) continue;
    hints.push(hint);
    if (hints.length >= 8) break;
  }
  return hints;
}

function cleanText(value: string, max: number) {
  return stripControls(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function stripControls(value: string) {
  let text = "";
  for (const char of value) {
    const code = char.charCodeAt(0);
    text += code < 32 || code === 127 ? " " : char;
  }
  return text;
}
