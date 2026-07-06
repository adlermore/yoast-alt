import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { SEO_THRESHOLDS, SERP_PIXEL_LIMITS } from "@/constants/thresholds";
import { classifyPixelWidth, descriptionPixelWidth } from "../pixel-width";

/** Meta description presence and SERP width. */
export function checkDescription(doc: ParsedDocument): Check[] {
  const { description, descriptionLength } = doc.meta;
  const range = SEO_THRESHOLDS.description;
  const pixelRange = SERP_PIXEL_LIMITS.description;

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

  // Truncation is decided by rendered pixel width (~920px on desktop at 14px
  // Arial), not by a fixed character count.
  const width = descriptionPixelWidth(description);
  const verdict = classifyPixelWidth(width, pixelRange);
  const widthNote = `Estimated width: ${width}px of ~${pixelRange.max}px available (${descriptionLength} characters).`;

  if (verdict === "ok") {
    checks.push(
      createCheck({
        id: "description-length",
        title: "Description width in search results",
        status: "pass",
        detail: widthNote,
        weight: 1,
      }),
    );
  } else {
    const truncated = verdict === "truncated";
    checks.push(
      createCheck({
        id: "description-length",
        title: "Description width in search results",
        status: "warning",
        detail: widthNote,
        weight: 1,
        recommendation: {
          problem: truncated
            ? "The description is wider than Google's desktop display budget and will be cut off with an ellipsis."
            : "The description is much narrower than the available space.",
          reason:
            "Google displays roughly 920px of description width on desktop (about 150–160 characters depending on the letters used); anything beyond is truncated.",
          howToFix: truncated
            ? `Shorten toward ${range.max} characters or fewer, leading with the most important information.`
            : `Expand toward ${range.min}–${range.max} characters with a clear, benefit-led summary.`,
          priority: "medium",
          impact: "Medium — affects how the snippet reads in search results.",
        },
      }),
    );
  }

  return checks;
}
