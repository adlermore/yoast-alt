import type { Check, OpenGraphData, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";

function missingOgFields(og: OpenGraphData): string[] {
  const required: [keyof OpenGraphData, string][] = [
    ["title", "og:title"],
    ["description", "og:description"],
    ["image", "og:image"],
  ];
  return required
    .filter(([key]) => !og[key])
    .map(([, label]) => label);
}

/** Social sharing metadata: Open Graph completeness and Twitter card. */
export function checkSocial(doc: ParsedDocument): Check[] {
  const checks: Check[] = [];
  const missing = missingOgFields(doc.openGraph);

  checks.push(
    createCheck({
      id: "open-graph",
      title: "Open Graph tags",
      status: missing.length === 0 ? "pass" : "warning",
      detail:
        missing.length === 0
          ? "Core Open Graph tags (title, description, image) are present."
          : `Missing Open Graph tags: ${missing.join(", ")}.`,
      weight: 1,
      highlights: missing.length > 0 ? missing : undefined,
      recommendation:
        missing.length === 0
          ? undefined
          : {
              problem: "Some core Open Graph tags are missing.",
              reason:
                "Open Graph controls how the page looks when shared on social platforms.",
              howToFix:
                "Add og:title, og:description, and og:image so shared links render a rich preview.",
              priority: "low",
              impact: "Low–Medium — affects social click-through, not rankings.",
            },
    }),
  );

  checks.push(
    createCheck({
      id: "twitter-card",
      title: "Twitter card",
      status: doc.twitter.card ? "pass" : "info",
      detail: doc.twitter.card
        ? `Twitter card type is “${doc.twitter.card}”.`
        : "No Twitter card meta tag was found (Open Graph is used as a fallback).",
      weight: 1,
    }),
  );

  return checks;
}
