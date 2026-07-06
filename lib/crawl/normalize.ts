/**
 * URL normalization for the crawler — load-bearing for accuracy. Both Surik
 * specs call inconsistent normalization the #1 source of false positives, so
 * every URL (sitemap entry, link target, seed, redirect destination) passes
 * through the exact same rules:
 *
 *   1. Drop the #fragment.
 *   2. Lowercase scheme + host; default scheme to https.
 *   3. Strip a leading "www." (treat www and non-www as one site).
 *   4. Path defaults to "/"; strip a trailing slash except on root.
 *   5. Preserve the query string as-is.
 */

/** Non-navigational href schemes that must never be crawled or link-checked. */
const SKIP_SCHEMES = ["mailto:", "tel:", "javascript:", "data:", "sms:", "blob:"];

export function stripWww(host: string): string {
  return host.replace(/^www\./i, "");
}

/** Normalize an absolute or relative URL. Returns null if unparseable or non-http(s). */
export function normalizeUrl(raw: string, base?: string): string | null {
  try {
    const url = base ? new URL(raw, base) : new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    url.hash = "";
    url.hostname = stripWww(url.hostname.toLowerCase());

    let path = url.pathname || "/";
    if (path.length > 1) path = path.replace(/\/+$/, "");
    if (path === "") path = "/";
    url.pathname = path;

    return `${url.protocol}//${url.host}${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

/** Normalize a user-entered seed, defaulting the scheme to https when absent. */
export function normalizeSeed(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return normalizeUrl(withScheme);
}

/** Registrable-host equality after stripping www (same-site test). */
export function sameSite(a: string, b: string): boolean {
  try {
    return (
      stripWww(new URL(a).hostname.toLowerCase()) ===
      stripWww(new URL(b).hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

/**
 * SSRF guard — reject localhost and private/link-local ranges so the crawler
 * can't be pointed at internal infrastructure or cloud metadata endpoints.
 */
export function isBlockedHost(hostname: string): boolean {
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

/** Cloudflare email-protection & friends: never crawl or link-check these. */
export function isCdnCgi(url: string): boolean {
  try {
    return new URL(url).pathname.startsWith("/cdn-cgi/");
  } catch {
    return false;
  }
}

/**
 * Resolve an `<a href>` against its page URL into a normalized, crawlable URL,
 * or null if it is a non-navigational scheme, a bare fragment, or /cdn-cgi/.
 */
export function resolveLink(href: string, pageUrl: string): string | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const lower = trimmed.toLowerCase();
  if (SKIP_SCHEMES.some((scheme) => lower.startsWith(scheme))) return null;

  const normalized = normalizeUrl(trimmed, pageUrl);
  if (!normalized || isCdnCgi(normalized)) return null;
  return normalized;
}
