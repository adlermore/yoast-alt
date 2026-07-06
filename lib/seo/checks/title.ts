import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { SEO_THRESHOLDS, SERP_PIXEL_LIMITS } from "@/constants/thresholds";
import { classifyPixelWidth, titlePixelWidth } from "../pixel-width";

/** Title presence and SERP width (the single most important on-page element). */
export function checkTitle(doc: ParsedDocument): Check[] {
  const { title, titleLength } = doc.meta;
  const range = SEO_THRESHOLDS.title;
  const pixelRange = SERP_PIXEL_LIMITS.title;

  if (!title) {
    return [
      createCheck({
        id: "title-exists",
        title: "Title tag",
        status: "error",
        detail: "No <title> tag was found.",
        weight: 3,
        recommendation: {
          problem: "The page has no title tag.",
          reason:
            "The title is the clickable headline in search results and a primary ranking signal.",
          howToFix:
            "Add a unique, descriptive <title> of 30–60 characters inside <head>.",
          priority: "critical",
          impact: "High — directly affects rankings and click-through rate.",
        },
      }),
    ];
  }

  const checks: Check[] = [
    createCheck({
      id: "title-exists",
      title: "Title tag",
      status: "pass",
      detail: `Title is present: “${title}”.`,
      weight: 3,
    }),
  ];

  // Google truncates by rendered pixel width, not character count — a title of
  // narrow letters fits where the same count of wide letters gets cut off.
  const width = titlePixelWidth(title);
  const verdict = classifyPixelWidth(width, pixelRange);
  const widthNote = `Estimated width: ${width}px of ~${pixelRange.max}px available (${titleLength} characters).`;

  if (verdict === "ok") {
    checks.push(
      createCheck({
        id: "title-length",
        title: "Title width in search results",
        status: "pass",
        detail: widthNote,
        weight: 2,
      }),
    );
  } else {
    const truncated = verdict === "truncated";
    checks.push(
      createCheck({
        id: "title-length",
        title: "Title width in search results",
        status: truncated ? "error" : "warning",
        detail: widthNote,
        weight: 2,
        recommendation: {
          problem: truncated
            ? "The title is wider than Google's desktop display budget and will be truncated with an ellipsis."
            : "The title is much narrower than the available space and under-uses the snippet.",
          reason:
            "Google cuts titles at roughly 580px of rendered width (about 55–65 characters depending on the letters used), not at a fixed character count.",
          howToFix: truncated
            ? `Trim the title until it fits within ~${pixelRange.max}px (roughly ${range.max} characters), keeping the primary topic first.`
            : `Expand the title toward ${range.min}–${range.max} characters with descriptive, relevant wording.`,
          priority: truncated ? "high" : "medium",
          impact: "Medium — affects click-through rate from search results.",
        },
      }),
    );
  }

  return checks;
}
