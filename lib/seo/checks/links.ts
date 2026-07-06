import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";

/** Summary-level link health: internal linking and empty anchors. */
export function checkLinks(doc: ParsedDocument): Check[] {
  const checks: Check[] = [];
  const internal = doc.links.filter((link) => link.isInternal).length;
  const emptyAnchors = doc.links.filter((link) => link.isEmptyAnchor).length;

  checks.push(
    createCheck({
      id: "internal-links",
      title: "Internal links",
      status: internal > 0 ? "pass" : "warning",
      detail:
        internal > 0
          ? `The page has ${internal} internal link(s).`
          : "No internal links were found.",
      weight: 1,
      recommendation:
        internal > 0
          ? undefined
          : {
              problem: "The page has no internal links.",
              reason:
                "Internal links distribute authority and help users and crawlers discover related pages.",
              howToFix:
                "Add contextual internal links to relevant pages within the site.",
              priority: "medium",
              impact: "Medium — supports crawlability and topical structure.",
            },
    }),
  );

  if (emptyAnchors > 0) {
    checks.push(
      createCheck({
        id: "empty-anchors",
        title: "Empty link anchors",
        status: "warning",
        detail: `${emptyAnchors} link(s) have no descriptive anchor text or label.`,
        weight: 1,
        recommendation: {
          problem: "Some links have no anchor text, aria-label, or titled image.",
          reason:
            "Descriptive anchors tell users and search engines what the destination is about.",
          howToFix:
            "Add meaningful anchor text, or an aria-label for icon-only links.",
          priority: "low",
          impact: "Low–Medium — affects accessibility and link context.",
        },
      }),
    );
  }

  return checks;
}
