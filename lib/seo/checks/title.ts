import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { SEO_THRESHOLDS } from "@/constants/thresholds";
import { classifyLength } from "../length";

/** Title presence and length (the single most important on-page element). */
export function checkTitle(doc: ParsedDocument): Check[] {
  const { title, titleLength } = doc.meta;
  const range = SEO_THRESHOLDS.title;

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

  const verdict = classifyLength(titleLength, range);
  const lengthNote = `Current length: ${titleLength} characters (recommended ${range.min}–${range.max}).`;

  if (verdict === "ok") {
    checks.push(
      createCheck({
        id: "title-length",
        title: "Title length",
        status: "pass",
        detail: lengthNote,
        weight: 2,
      }),
    );
  } else {
    const tooLong = verdict === "long" || verdict === "too-long";
    checks.push(
      createCheck({
        id: "title-length",
        title: "Title length",
        status: verdict === "too-long" ? "error" : "warning",
        detail: lengthNote,
        weight: 2,
        recommendation: {
          problem: tooLong
            ? "The title is longer than recommended and may be truncated in search results."
            : "The title is shorter than recommended and under-uses valuable space.",
          reason:
            "Search engines display roughly 50–60 characters; titles outside this range read poorly or get cut off.",
          howToFix: tooLong
            ? "Trim the title to 60 characters or fewer while keeping the primary topic first."
            : "Expand the title toward 50–60 characters with descriptive, relevant wording.",
          priority: verdict === "too-long" ? "high" : "medium",
          impact: "Medium — affects click-through rate from search results.",
        },
      }),
    );
  }

  return checks;
}
