import type { Check, HttpMeta } from "@/types";
import { createCheck } from "@/lib/scores";
import { isHttps } from "@/lib/html";

/** Response-level checks, available only when a page was fetched by URL. */
export function checkHttpTechnical(http: HttpMeta): Check[] {
  const checks: Check[] = [];
  const { statusCode, headers, finalUrl } = http;

  // Status code.
  const statusOk = statusCode >= 200 && statusCode < 300;
  const isRedirectLanded = http.redirected;
  checks.push(
    createCheck({
      id: "http-status",
      title: "HTTP status",
      status: statusOk ? "pass" : statusCode >= 400 ? "error" : "warning",
      detail: statusOk
        ? `Responded ${statusCode}${isRedirectLanded ? " (after a redirect)" : ""}.`
        : `Responded with status ${statusCode}.`,
      weight: 3,
      recommendation: statusOk
        ? undefined
        : {
            problem: `The URL returned HTTP ${statusCode}.`,
            reason:
              "Non-200 responses can prevent indexing or signal broken/blocked content.",
            howToFix:
              statusCode >= 400
                ? "Fix the underlying error so the page returns 200, or update links pointing to it."
                : "Ensure the final URL is the canonical destination and returns 200 directly.",
            priority: statusCode >= 400 ? "high" : "medium",
            impact: "High — affects whether the page can be crawled and indexed.",
          },
    }),
  );

  // X-Robots-Tag header (header-level noindex).
  const xRobots = headers["x-robots-tag"];
  if (xRobots) {
    const noindex = xRobots.toLowerCase().includes("noindex");
    checks.push(
      createCheck({
        id: "x-robots-tag",
        title: "X-Robots-Tag header",
        status: noindex ? "error" : "info",
        detail: `X-Robots-Tag: ${xRobots}`,
        weight: noindex ? 3 : 1,
        recommendation: noindex
          ? {
              problem: "An X-Robots-Tag header sets noindex.",
              reason: "This blocks indexing at the HTTP level, even if the HTML looks fine.",
              howToFix: "Remove noindex from the X-Robots-Tag response header if the page should rank.",
              priority: "critical",
              impact: "Critical — the page cannot appear in search results.",
            }
          : undefined,
      }),
    );
  }

  // Compression.
  const encoding = headers["content-encoding"] ?? "";
  const compressed = /\b(gzip|br|deflate|zstd)\b/i.test(encoding);
  checks.push(
    createCheck({
      id: "compression",
      title: "Compression",
      status: compressed ? "pass" : "warning",
      detail: compressed
        ? `Response is compressed (${encoding}).`
        : "The response is not compressed.",
      weight: 1,
      recommendation: compressed
        ? undefined
        : {
            problem: "The HTML response is served uncompressed.",
            reason: "Compression (gzip/brotli) cuts transfer size and speeds up load.",
            howToFix: "Enable gzip or brotli compression at the server or CDN.",
            priority: "medium",
            impact: "Medium — affects load time and Core Web Vitals.",
          },
    }),
  );

  // Caching.
  const cacheControl = headers["cache-control"];
  checks.push(
    createCheck({
      id: "cache-control",
      title: "Cache-Control",
      status: cacheControl ? "pass" : "info",
      detail: cacheControl
        ? `Cache-Control: ${cacheControl}`
        : "No Cache-Control header was set.",
      weight: 1,
    }),
  );

  // HSTS on secure pages.
  if (isHttps(finalUrl)) {
    const hsts = Boolean(headers["strict-transport-security"]);
    checks.push(
      createCheck({
        id: "hsts",
        title: "HSTS",
        status: hsts ? "pass" : "info",
        detail: hsts
          ? "Strict-Transport-Security is enabled."
          : "No Strict-Transport-Security header was set.",
        weight: 1,
      }),
    );
  }

  // robots.txt presence.
  checks.push(
    createCheck({
      id: "robots-txt",
      title: "robots.txt",
      status: http.robotsTxtFound ? "pass" : "warning",
      detail: http.robotsTxtFound
        ? "A robots.txt file is reachable at the site root."
        : "No robots.txt was found at the site root.",
      weight: 1,
      recommendation: http.robotsTxtFound
        ? undefined
        : {
            problem: "The site has no robots.txt.",
            reason:
              "robots.txt guides crawlers and is where the XML sitemap is typically declared.",
            howToFix: "Add a /robots.txt that allows crawling and references your sitemap.",
            priority: "low",
            impact: "Low–Medium — affects crawl guidance.",
          },
    }),
  );

  // XML sitemap presence.
  checks.push(
    createCheck({
      id: "xml-sitemap",
      title: "XML sitemap",
      status: http.sitemapFound ? "pass" : "warning",
      detail: http.sitemapFound
        ? "An XML sitemap is reachable."
        : "No XML sitemap was found at the common locations.",
      weight: 1,
      recommendation: http.sitemapFound
        ? undefined
        : {
            problem: "No XML sitemap was found.",
            reason: "Sitemaps help search engines discover and prioritize your pages.",
            howToFix: "Publish an XML sitemap and reference it from robots.txt.",
            priority: "low",
            impact: "Low–Medium — aids discovery of pages.",
          },
    }),
  );

  return checks;
}
