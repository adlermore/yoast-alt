/**
 * Network layer for the crawler.
 *
 * Everything presents as a real Chrome browser (§4 bug #8 — a custom bot UA gets
 * WAF-403'd and makes the whole site look broken). robots.txt is fetched with
 * this same UA and an unreadable robots.txt is reported as allow-all (§10.1),
 * never as disallow-all.
 */

import "server-only";
import { gunzipSync } from "node:zlib";
import { MAX_HTML_CHARS } from "@/constants/limits";
import { normalizeUrl, sameSite } from "@/lib/crawl/normalize";

export const CRAWLER_UA =
  "Mozilla/5.0 (compatible; SearchlightBot/1.0; +Surik Tools SEO auditor)";

const HEADERS: Record<string, string> = {
  "user-agent": CRAWLER_UA,
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
};

export interface FetchOutcome {
  /** Requested URL, normalized. */
  requestedUrl: string;
  /** Final URL after redirects, normalized. */
  finalUrl: string;
  /** Final HTTP status. 0 = network/timeout error. `301` marks a cross-URL redirect. */
  status: number;
  contentType: string;
  isHtml: boolean;
  /** HTML body — empty for non-HTML or cross-URL redirects. */
  body: string;
  /** Normalized destination for a cross-URL redirect; null otherwise. */
  redirectTo: string | null;
  error: string | null;
}

function emptyOutcome(requestedUrl: string, error: string): FetchOutcome {
  return {
    requestedUrl,
    finalUrl: requestedUrl,
    status: 0,
    contentType: "",
    isHtml: false,
    body: "",
    redirectTo: null,
    error,
  };
}

/**
 * Fetch a page for crawling. Redirects are followed, then classified:
 * a redirect whose destination normalizes to the *same* URL is cosmetic
 * (trailing slash / www / scheme) and is treated as the page's real content;
 * a redirect to a *different* URL is recorded as a 3xx entry whose content is
 * never analysed here — the destination is crawled separately (§4 bugs #3/#4).
 */
export async function fetchCrawl(
  requestedUrl: string,
  timeoutMs = 20_000,
): Promise<FetchOutcome> {
  let response: Response;
  try {
    response = await fetch(requestedUrl, {
      headers: HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "TimeoutError" ? "timeout" : "fetch failed";
    return emptyOutcome(requestedUrl, reason);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isHtml = contentType.includes("html");
  const finalUrl = normalizeUrl(response.url) ?? requestedUrl;

  // Cross-URL redirect: content belongs to the destination, not this URL.
  if (response.redirected && finalUrl !== requestedUrl) {
    // Drain the body so the socket is freed.
    await response.arrayBuffer().catch(() => undefined);
    return {
      requestedUrl,
      finalUrl,
      status: 301,
      contentType,
      isHtml: false,
      body: "",
      redirectTo: finalUrl,
      error: null,
    };
  }

  let body = "";
  if (isHtml) {
    const raw = await response.text().catch(() => "");
    body = raw.length > MAX_HTML_CHARS ? raw.slice(0, MAX_HTML_CHARS) : raw;
  } else {
    await response.arrayBuffer().catch(() => undefined);
  }

  return {
    requestedUrl,
    finalUrl: requestedUrl,
    status: response.status,
    contentType,
    isHtml,
    body,
    redirectTo: null,
    error: null,
  };
}

export interface TextFetch {
  status: number;
  text: string | null;
}

/** Fetch a text resource (robots.txt / sitemap), decompressing `.gz` payloads. */
export async function fetchText(url: string, timeoutMs = 15_000): Promise<TextFetch> {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": CRAWLER_UA },
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    if (!response.ok) return { status: response.status, text: null };

    if (/\.gz($|\?)/i.test(url) || (response.headers.get("content-type") ?? "").includes("gzip")) {
      const buffer = Buffer.from(await response.arrayBuffer());
      try {
        return { status: response.status, text: gunzipSync(buffer).toString("utf8") };
      } catch {
        return { status: response.status, text: buffer.toString("utf8") };
      }
    }
    return { status: response.status, text: await response.text() };
  } catch {
    return { status: 0, text: null };
  }
}

/** Same-site guard used by the engine when expanding links. */
export function isSameSite(url: string, base: string): boolean {
  return sameSite(url, base);
}
