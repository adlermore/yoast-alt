import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { KEYWORD_THRESHOLDS } from "@/constants/thresholds";
import { countOccurrences, keywordWordCount } from "../match";

/** Keyword density: too low signals weak relevance, too high signals stuffing. */
export function checkKeywordDensity(doc: ParsedDocument, keyword: string): Check[] {
  const totalWords = doc.content.wordCount;
  if (totalWords === 0) {
    return [
      createCheck({
        id: "keyword-density",
        title: "Keyword density",
        status: "info",
        detail: "No body text was found to measure keyword density.",
      }),
    ];
  }

  const occurrences = countOccurrences(doc.content.text, keyword);
  // Density weights the phrase by its word length, so a 2-word keyword counts
  // its 2 words toward the numerator — consistent with how tools report it.
  const density = (occurrences * keywordWordCount(keyword)) / totalWords * 100;
  const rounded = Math.round(density * 100) / 100;
  const { min, max, stuffing } = KEYWORD_THRESHOLDS.density;
  const detail = `The keyword appears ${occurrences} time(s) — ${rounded}% density (recommended ${min}–${max}%).`;

  if (occurrences === 0) {
    return [
      createCheck({
        id: "keyword-density",
        title: "Keyword density",
        status: "error",
        detail: `The focus keyword does not appear in the body text.`,
        weight: 3,
        recommendation: {
          problem: "The focus keyword is absent from the body content.",
          reason:
            "If the target term never appears in the copy, the page is unlikely to rank for it.",
          howToFix:
            "Use the focus keyword naturally in the body — headings, the intro, and a few times throughout.",
          priority: "high",
          impact: "High — core relevance signal for the target query.",
        },
      }),
    ];
  }

  if (density >= stuffing) {
    return [
      createCheck({
        id: "keyword-density",
        title: "Keyword density",
        status: "error",
        detail,
        weight: 3,
        recommendation: {
          problem: "Keyword density is high enough to look like keyword stuffing.",
          reason:
            "Over-repetition reads unnaturally and can trigger spam signals rather than help rankings.",
          howToFix:
            "Reduce repetitions and use synonyms and natural variations instead.",
          priority: "high",
          impact: "High — over-optimization can suppress rankings.",
        },
      }),
    ];
  }

  if (density < min) {
    return [
      createCheck({
        id: "keyword-density",
        title: "Keyword density",
        status: "warning",
        detail,
        weight: 3,
        recommendation: {
          problem: "Keyword density is below the recommended range.",
          reason:
            "Very few mentions may under-signal the topic to search engines.",
          howToFix:
            "Add a few more natural mentions of the keyword or close variants where they fit.",
          priority: "medium",
          impact: "Medium — supports topical relevance.",
        },
      }),
    ];
  }

  if (density > max) {
    return [
      createCheck({
        id: "keyword-density",
        title: "Keyword density",
        status: "warning",
        detail,
        weight: 3,
        recommendation: {
          problem: "Keyword density is above the recommended range.",
          reason: "Repeating the exact term too often reads unnaturally.",
          howToFix: "Replace some exact-match mentions with synonyms or pronouns.",
          priority: "medium",
          impact: "Medium — protects against over-optimization.",
        },
      }),
    ];
  }

  return [
    createCheck({ id: "keyword-density", title: "Keyword density", status: "pass", detail, weight: 3 }),
  ];
}
