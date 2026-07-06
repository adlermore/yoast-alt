import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { SEO_THRESHOLDS } from "@/constants/thresholds";
import { classifyLength } from "../length";

/** Meta description presence and length. */
export function checkDescription(doc: ParsedDocument): Check[] {
  const { description, descriptionLength } = doc.meta;
  const range = SEO_THRESHOLDS.description;

  if (!description) {
    return [
      createCheck({
        id: "description-exists",
        title: "Meta description",
        status: "error",
        detail: "No meta description was found.",
        weight: 3,
        recommendation: {
          problem: "The page has no meta description.",
          reason:
            "Search engines use it as the result snippet; a compelling description lifts click-through rate.",
          howToFix:
            "Add a <meta name=\"description\"> of 120–160 characters that summarizes the page.",
          priority: "high",
          impact: "Medium–High — strongly influences click-through rate.",
        },
      }),
    ];
  }

  const checks: Check[] = [
    createCheck({
      id: "description-exists",
      title: "Meta description",
      status: "pass",
      detail: "A meta description is present.",
      weight: 3,
    }),
  ];

  const verdict = classifyLength(descriptionLength, range);
  const lengthNote = `Current length: ${descriptionLength} characters (recommended ${range.min}–${range.max}).`;

  if (verdict === "ok") {
    checks.push(
      createCheck({
        id: "description-length",
        title: "Description length",
        status: "pass",
        detail: lengthNote,
        weight: 1,
      }),
    );
  } else {
    const tooLong = verdict === "long" || verdict === "too-long";
    checks.push(
      createCheck({
        id: "description-length",
        title: "Description length",
        status: "warning",
        detail: lengthNote,
        weight: 1,
        recommendation: {
          problem: tooLong
            ? "The description is longer than recommended and may be truncated."
            : "The description is shorter than recommended.",
          reason:
            "Google typically displays 150–160 characters; content beyond that is cut off with an ellipsis.",
          howToFix: tooLong
            ? "Shorten to 160 characters or fewer, leading with the most important information."
            : "Expand toward 150–160 characters with a clear, benefit-led summary.",
          priority: "medium",
          impact: "Medium — affects how the snippet reads in search results.",
        },
      }),
    );
  }

  return checks;
}
