import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { SEO_THRESHOLDS } from "@/constants/thresholds";

/** Content volume: flag thin content and under-length pages. */
export function checkContent(doc: ParsedDocument): Check[] {
  const words = doc.content.wordCount;
  const { thin, recommended } = SEO_THRESHOLDS.content;
  const detail = `The page has ${words} words (recommended at least ${recommended}).`;

  if (words < thin) {
    return [
      createCheck({
        id: "content-length",
        title: "Content length",
        status: "error",
        detail,
        weight: 2,
        recommendation: {
          problem: "The page has very little textual content (thin content).",
          reason:
            "Thin pages struggle to demonstrate value or topical depth and rank poorly.",
          howToFix:
            "Expand the content to comprehensively cover the topic, ideally 600+ words where appropriate.",
          priority: "high",
          impact: "High — thin content is a common ranking limiter.",
        },
      }),
    ];
  }

  if (words < recommended) {
    return [
      createCheck({
        id: "content-length",
        title: "Content length",
        status: "warning",
        detail,
        weight: 2,
        recommendation: {
          problem: "The page is on the shorter side for competitive topics.",
          reason:
            "Longer, thorough content tends to satisfy intent better for informational queries.",
          howToFix:
            "Consider expanding with examples, detail, or supporting sections where it adds value.",
          priority: "low",
          impact: "Low–Medium — depends on topic and competition.",
        },
      }),
    ];
  }

  return [
    createCheck({
      id: "content-length",
      title: "Content length",
      status: "pass",
      detail,
      weight: 2,
    }),
  ];
}
