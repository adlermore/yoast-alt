/**
 * Server-side page fetcher for URL analysis.
 *
 * Retrieves a page's HTML over plain HTTP (no JavaScript rendering) plus the
 * response metadata the technical analyzer needs, and probes for robots.txt and
 * an XML sitemap. Total and defensive: it returns a typed result rather than
 * throwing, and guards against fetching internal/private hosts.
 */

import "server-only";
import type { HttpMeta } from "@/types";
import { MAX_HTML_CHARS } from "@/constants/limits";
import { evaluateAiBotAccess } from "@/lib/geo/ai-bots";

const USER_AGENT =
  "Mozilla/5.0 (compatible; SearchlightBot/1.0; +SEO analysis workbench)";
const TIMEOUT_MS = 15_000;

export interface FetchedPage {
  html: string;
  http: HttpMeta;
}

export type FetchPageResult =
  | { ok: true; page: FetchedPage }
  | { ok: false; message: string };

/** Reject localhost and private/link-local ranges to limit SSRF surface. */
function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "::1" || host === "0.0.0.0") return true;
  if (/^127\./.test(host)) return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  return false;
}

/** Normalize user input into a fetchable http(s) URL, or return null. */
export function normalizeInputUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key.toLowerCase()] = value;
  });
  return record;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: { "user-agent": USER_AGENT, ...(init.headers ?? {}) },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
}

/** Probe robots.txt at the origin; also report whether it declares a sitemap. */
async function probeRobots(
  origin: string,
): Promise<{ found: boolean; sitemap: boolean; body: string | null }> {
  try {
    const res = await fetchWithTimeout(`${origin}/robots.txt`);
    if (!res.ok) return { found: false, sitemap: false, body: null };
    const body = (await res.text()).slice(0, 100_000);
    return { found: true, sitemap: /^\s*sitemap:/im.test(body), body };
  } catch {
    return { found: false, sitemap: false, body: null };
  }
}

/** Probe the /llms.txt convention (a Markdown site map for AI assistants). */
async function probeLlmsTxt(origin: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${origin}/llms.txt`);
    if (!res.ok) return false;
    const type = res.headers.get("content-type") ?? "";
    // Soft-404s answer with an HTML error page; the real file is plain text.
    return !type.includes("html");
  } catch {
    return false;
  }
}

/** Probe the conventional /sitemap.xml location as a fallback. */
async function probeSitemap(origin: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${origin}/sitemap.xml`);
    if (!res.ok) return false;
    const type = res.headers.get("content-type") ?? "";
    return type.includes("xml") || type.includes("text");
  } catch {
    return false;
  }
}

export async function fetchPage(rawUrl: string): Promise<FetchPageResult> {
  const url = normalizeInputUrl(rawUrl);
  if (!url) {
    return { ok: false, message: "Enter a valid http(s) URL, e.g. https://example.com/page." };
  }
  if (isBlockedHost(url.hostname)) {
    return { ok: false, message: "That host is not allowed. Enter a public website URL." };
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(url.href);
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "TimeoutError"
        ? "the request timed out"
        : "the request failed";
    return { ok: false, message: `Could not fetch that URL — ${reason}.` };
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("html")) {
    return {
      ok: false,
      message: `The URL did not return an HTML page (content-type: ${contentType || "unknown"}).`,
    };
  }

  const rawHtml = await response.text();
  const html = rawHtml.length > MAX_HTML_CHARS ? rawHtml.slice(0, MAX_HTML_CHARS) : rawHtml;

  const origin = url.origin;
  const [robots, sitemapFallback, llmsTxtFound] = await Promise.all([
    probeRobots(origin),
    probeSitemap(origin),
    probeLlmsTxt(origin),
  ]);

  const http: HttpMeta = {
    statusCode: response.status,
    headers: headersToRecord(response.headers),
    finalUrl: response.url || url.href,
    redirected: response.redirected,
    robotsTxtFound: robots.found,
    sitemapFound: robots.sitemap || sitemapFallback,
    aiBots: robots.body !== null ? evaluateAiBotAccess(robots.body) : undefined,
    llmsTxtFound,
  };

  return { ok: true, page: { html, http } };
}
