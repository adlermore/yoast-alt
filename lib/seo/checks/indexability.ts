import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { isHttps } from "@/lib/html";

/** Indexability signals: robots directives, canonical, and HTTPS. */
export function checkIndexability(doc: ParsedDocument): Check[] {
  const checks: Check[] = [];
  const robots = doc.meta.robots?.toLowerCase() ?? "";
  const noindex = robots.includes("noindex");
  const nofollow = robots.includes("nofollow");

  checks.push(
    createCheck({
      id: "indexable",
      title: "Indexability",
      status: noindex ? "error" : "pass",
      detail: noindex
        ? "A robots \"noindex\" directive prevents this page from being indexed."
        : "No robots directive blocks indexing.",
      weight: 3,
      recommendation: noindex
        ? {
            problem: "The page is set to noindex.",
            reason:
              "A noindex directive removes the page from search results entirely.",
            howToFix:
              "Remove \"noindex\" from the robots meta tag if the page should rank.",
            priority: "critical",
            impact: "Critical — the page cannot appear in search results.",
          }
        : undefined,
    }),
  );

  if (nofollow) {
    checks.push(
      createCheck({
        id: "robots-nofollow",
        title: "Robots nofollow",
        status: "warning",
        detail: "A robots \"nofollow\" directive stops link equity flowing from this page.",
        weight: 1,
        recommendation: {
          problem: "The page-level robots tag contains \"nofollow\".",
          reason:
            "Search engines will not follow any links on the page, isolating linked pages.",
          howToFix:
            "Remove \"nofollow\" unless you intentionally want to withhold crawling of all links.",
          priority: "medium",
          impact: "Medium — affects internal link discovery and equity.",
        },
      }),
    );
  }

  checks.push(
    createCheck({
      id: "canonical",
      title: "Canonical URL",
      status: doc.meta.canonical ? "pass" : "warning",
      detail: doc.meta.canonical
        ? `Canonical points to ${doc.meta.canonical}.`
        : "No canonical URL is declared.",
      weight: 2,
      recommendation: doc.meta.canonical
        ? undefined
        : {
            problem: "The page has no canonical URL.",
            reason:
              "Canonicals consolidate ranking signals and prevent duplicate-content dilution.",
            howToFix:
              "Add <link rel=\"canonical\"> pointing to the preferred absolute URL of this page.",
            priority: "medium",
            impact: "Medium — helps avoid duplicate-content issues.",
          },
    }),
  );

  // HTTPS is only assessable when a source URL is known.
  if (doc.url) {
    const secure = isHttps(doc.url);
    checks.push(
      createCheck({
        id: "https",
        title: "HTTPS",
        status: secure ? "pass" : "error",
        detail: secure
          ? "The page is served over HTTPS."
          : "The page is not served over HTTPS.",
        weight: 2,
        recommendation: secure
          ? undefined
          : {
              problem: "The page is served over insecure HTTP.",
              reason:
                "HTTPS is a confirmed ranking signal and required for user trust and modern browser features.",
              howToFix:
                "Serve the site over HTTPS and redirect all HTTP traffic to the secure version.",
              priority: "high",
              impact: "High — affects rankings and user trust.",
            },
      }),
    );
  }

  return checks;
}
