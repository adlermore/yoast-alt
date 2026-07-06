import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { SEO_THRESHOLDS } from "@/constants/thresholds";

/** Heading structure: single H1, correct hierarchy, no empty headings. */
export function checkHeadings(doc: ParsedDocument): Check[] {
  const { headings } = doc;
  const checks: Check[] = [];
  const h1s = headings.filter((heading) => heading.level === 1);

  checks.push(
    createCheck({
      id: "h1-exists",
      title: "H1 heading",
      status: h1s.length > 0 ? "pass" : "error",
      detail:
        h1s.length > 0
          ? `An H1 is present: “${h1s[0].text || "(empty)"}”.`
          : "No H1 heading was found.",
      weight: 2,
      recommendation:
        h1s.length > 0
          ? undefined
          : {
              problem: "The page has no H1 heading.",
              reason:
                "The H1 states the page's main topic to users and search engines.",
              howToFix: "Add exactly one H1 that describes the page's primary subject.",
              priority: "high",
              impact: "Medium–High — clarifies topical relevance.",
            },
    }),
  );

  if (h1s.length > SEO_THRESHOLDS.headings.maxH1) {
    checks.push(
      createCheck({
        id: "h1-single",
        title: "Single H1",
        status: "warning",
        detail: `Found ${h1s.length} H1 headings; a page should generally have one.`,
        weight: 1,
        recommendation: {
          problem: "The page has multiple H1 headings.",
          reason:
            "Multiple H1s dilute the topical signal and can confuse document outline.",
          howToFix:
            "Keep a single H1 and demote the others to H2–H6 to reflect hierarchy.",
          priority: "medium",
          impact: "Low–Medium — affects content structure clarity.",
        },
      }),
    );
  }

  // Hierarchy: a heading level should not jump by more than one from the prior.
  const skips: string[] = [];
  for (let i = 1; i < headings.length; i += 1) {
    const prev = headings[i - 1];
    const current = headings[i];
    if (current.level > prev.level + 1) {
      skips.push(
        `H${prev.level} → H${current.level} at “${current.text || "(empty)"}”`,
      );
    }
  }

  if (headings.length > 0) {
    checks.push(
      createCheck({
        id: "heading-hierarchy",
        title: "Heading hierarchy",
        status: skips.length === 0 ? "pass" : "warning",
        detail:
          skips.length === 0
            ? "Heading levels increase by at most one step."
            : `Found ${skips.length} skipped heading level(s).`,
        weight: 1,
        highlights: skips.length > 0 ? skips : undefined,
        recommendation:
          skips.length === 0
            ? undefined
            : {
                problem: "Heading levels are skipped (e.g. H2 followed by H4).",
                reason:
                  "A logical outline helps assistive technology and search engines parse structure.",
                howToFix:
                  "Avoid jumping heading levels; step down one level at a time.",
                priority: "low",
                impact: "Low — mainly an accessibility and structure concern.",
              },
      }),
    );
  }

  const emptyHeadings = headings.filter(
    (heading) => heading.text.length === 0,
  ).length;
  if (emptyHeadings > 0) {
    checks.push(
      createCheck({
        id: "empty-headings",
        title: "Empty headings",
        status: "warning",
        detail: `Found ${emptyHeadings} empty heading element(s).`,
        weight: 1,
        recommendation: {
          problem: "Some heading elements contain no text.",
          reason:
            "Empty headings add noise to the outline and provide no semantic value.",
          howToFix:
            "Add descriptive text to each heading or remove the empty element.",
          priority: "low",
          impact: "Low — minor structure and accessibility issue.",
        },
      }),
    );
  }

  return checks;
}
