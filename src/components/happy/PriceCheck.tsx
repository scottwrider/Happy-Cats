import { useState } from "react";
import { checkPublicPage } from "@/lib/check-public-page";
import { ALLOWED_PRICE_CHECK_HOSTS } from "@/lib/price-check-policy";
import type { PriceCheckResult } from "@/lib/run-price-check";
import { PRICE_CHECK_BOUNDARY } from "@/lib/boundaries";

export function PriceCheck() {
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<PriceCheckResult | null>(null);
  const [open, setOpen] = useState(false);

  const run = async () => {
    setPending(true);
    try {
      const next = await checkPublicPage({ data: { url } });
      setResult(next);
    } catch {
      setResult({
        ok: false,
        message: "The check did not finish. Nothing was saved.",
        savedUnitPrice: null,
        requestedUrl: null,
        httpStatus: null,
        bytesRead: null,
        truncated: false,
        title: null,
        priceHints: [],
        excerpt: null,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-w-0 rounded-lg border border-border bg-card p-3">
      <h4 className="text-base">
        <button
          type="button"
          className="flex w-full min-w-0 items-center justify-between gap-3 text-left font-semibold"
          aria-expanded={open}
          aria-controls="price-check-panel"
          onClick={() => setOpen((value) => !value)}
        >
          Check a public shop page
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
      </h4>
      {open ? (
        <div id="price-check-panel" className="mt-3 min-w-0">
          <p className="text-sm text-muted-foreground">{PRICE_CHECK_BOUNDARY}</p>
          <form
            className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void run();
            }}
          >
            <label className="min-w-0 flex-1 text-sm font-semibold">
              Page address
              <input
                type="url"
                inputMode="url"
                spellCheck={false}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://naturanimal.es/…"
                className="mt-1 w-full min-w-0 max-w-full rounded-md border border-input bg-background px-2 py-2 font-normal"
              />
            </label>
            <button type="submit" className="btn btn-quiet sm:self-end" disabled={pending}>
              {pending ? "Checking…" : "Check page"}
            </button>
          </form>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-semibold">Shops this check will open</summary>
            <ul className="mt-2 flex flex-wrap gap-2">
              {ALLOWED_PRICE_CHECK_HOSTS.map((host) => (
                <li
                  key={host}
                  className="num rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {host}
                </li>
              ))}
            </ul>
          </details>
          {result ? (
            <div aria-live="polite" className="mt-3 break-words text-sm">
              <p className="font-semibold">{result.message}</p>
              {result.savedUnitPrice === null ? (
                <p className="text-muted-foreground">Saved unit price: none.</p>
              ) : null}
              {result.title ? <p>Page title: {result.title}</p> : null}
              {result.priceHints.length > 0 ? (
                <>
                  <p className="mt-2">
                    Text fragments that look like prices. They are not saved. Type a figure into the
                    form above if you want to keep it.
                  </p>
                  <ul className="num mt-1 list-disc pl-5">
                    {result.priceHints.map((hint) => (
                      <li key={hint}>{hint}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {result.excerpt ? (
                <p className="mt-2 text-muted-foreground">{result.excerpt}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
