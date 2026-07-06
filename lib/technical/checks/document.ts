import type { AnalysisContext, Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { isHttps } from "@/lib/html";

/** Delivery/structure checks derivable from the HTML alone. */
export function checkDocumentTechnical(
  doc: ParsedDocument,
  context: AnalysisContext,
): Check[] {
  const checks: Check[] = [];
  const pageUrl = context.http?.finalUrl ?? doc.url ?? context.url ?? null;
  const secure = pageUrl ? isHttps(pageUrl) : false;

  // Mixed content — insecure sub-resources on a secure page.
  if (secure) {
    const insecure = [
      ...doc.images.map((image) => image.resolvedSrc),
      ...doc.links.map((link) => link.resolvedHref),
    ].filter((href): href is string => href !== null && href.startsWith("http://"));

    checks.push(
      createCheck({
        id: "mixed-content",
        title: "Mixed content",
        status: insecure.length === 0 ? "pass" : "error",
        detail:
          insecure.length === 0
            ? "No insecure (http://) resources found on this HTTPS page."
            : `${insecure.length} insecure http:// resource(s) referenced on an HTTPS page.`,
        weight: 2,
        highlights: insecure.slice(0, 5),
        recommendation:
          insecure.length === 0
            ? undefined
            : {
                problem: "The HTTPS page references resources over insecure HTTP.",
                reason:
                  "Browsers block or warn on mixed content, breaking assets and eroding trust.",
                howToFix: "Update the referenced URLs to https:// (or protocol-relative).",
                priority: "high",
                impact: "High — can break rendering and flag the page as not secure.",
              },
      }),
    );
  }

  // URL structure — only meaningful when a URL is known.
  if (pageUrl) {
    const issues: string[] = [];
    try {
      const parsed = new URL(pageUrl);
      const path = parsed.pathname;
      if (pageUrl.length > 100) issues.push(`URL is long (${pageUrl.length} chars).`);
      if (/[A-Z]/.test(path)) issues.push("Path contains uppercase letters.");
      if (path.includes("_")) issues.push("Path uses underscores (prefer hyphens).");
      const params = Array.from(parsed.searchParams.keys()).length;
      if (params > 2) issues.push(`URL has ${params} query parameters.`);
    } catch {
      issues.push("URL could not be parsed.");
    }

    checks.push(
      createCheck({
        id: "url-structure",
        title: "URL structure",
        status: issues.length === 0 ? "pass" : "warning",
        detail:
          issues.length === 0
            ? "The URL is clean, lowercase, and concise."
            : `Found ${issues.length} URL structure issue(s).`,
        weight: 1,
        highlights: issues.length > 0 ? issues : undefined,
        recommendation:
          issues.length === 0
            ? undefined
            : {
                problem: "The URL structure is not ideal.",
                reason:
                  "Short, lowercase, hyphenated URLs are easier to read, share, and crawl.",
                howToFix:
                  "Use lowercase words separated by hyphens, keep paths short, and avoid unnecessary parameters.",
                priority: "low",
                impact: "Low — minor usability and crawl-clarity gain.",
              },
      }),
    );
  }

  // Semantic landmark — a <main> region aids crawlers and assistive tech.
  checks.push(
    createCheck({
      id: "semantic-main",
      title: "Main content landmark",
      status: doc.structure.hasMain ? "pass" : "info",
      detail: doc.structure.hasMain
        ? "A <main> landmark identifies the primary content."
        : "No <main> landmark was found.",
      weight: 1,
      recommendation: doc.structure.hasMain
        ? undefined
        : {
            problem: "The page has no <main> landmark.",
            reason:
              "A <main> element helps browsers, crawlers, and screen readers locate primary content.",
            howToFix: "Wrap the primary content of the page in a single <main> element.",
            priority: "low",
            impact: "Low — accessibility and content-parsing clarity.",
          },
    }),
  );

  // Iframes can hide content from indexing.
  if (doc.structure.iframeCount > 0) {
    checks.push(
      createCheck({
        id: "iframe-content",
        title: "Iframe usage",
        status: "info",
        detail: `The page embeds ${doc.structure.iframeCount} iframe(s); their content is not indexed as part of this page.`,
        weight: 1,
      }),
    );
  }

  return checks;
}
