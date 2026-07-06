import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { READABILITY_THRESHOLDS } from "@/constants/thresholds";

/** Average paragraph length — long walls of text hurt scannability. */
export function checkParagraphLength(doc: ParsedDocument): Check[] {
  const { wordCount, paragraphCount } = doc.content;
  if (wordCount < READABILITY_THRESHOLDS.minWords || paragraphCount === 0) return [];

  const avg = Math.round(wordCount / paragraphCount);
  const limit = READABILITY_THRESHOLDS.paragraph.longWords;
  const detail = `About ${avg} words per paragraph across ${paragraphCount} paragraph(s).`;

  if (avg <= limit) {
    return [
      createCheck({
        id: "paragraph-length",
        title: "Paragraph length",
        status: "pass",
        detail,
        weight: 1,
      }),
    ];
  }

  return [
    createCheck({
      id: "paragraph-length",
      title: "Paragraph length",
      status: "warning",
      detail,
      weight: 1,
      recommendation: {
        problem: `Paragraphs average ${avg} words, above the ${limit}-word guideline.`,
        reason:
          "Long paragraphs read as walls of text and discourage scanning, especially on mobile.",
        howToFix:
          "Break long paragraphs into shorter ones, each focused on a single idea.",
        priority: "low",
        impact: "Low–Medium — affects scannability.",
      },
    }),
  ];
}

/** Long content should be broken up with subheadings. */
export function checkSubheadingDistribution(doc: ParsedDocument): Check[] {
  const { wordCount } = doc.content;
  const gap = READABILITY_THRESHOLDS.subheadingGapWords;
  if (wordCount <= gap) return [];

  const subheadings = doc.headings.filter((heading) => heading.level >= 2).length;

  if (subheadings === 0) {
    return [
      createCheck({
        id: "subheading-distribution",
        title: "Subheading distribution",
        status: "warning",
        detail: `${wordCount} words with no subheadings (H2–H6).`,
        weight: 1,
        recommendation: {
          problem: "Long content has no subheadings to break it up.",
          reason:
            "Subheadings give readers a scannable structure and reinforce topical sections.",
          howToFix:
            "Add descriptive H2/H3 subheadings roughly every 300 words.",
          priority: "medium",
          impact: "Medium — affects scannability and on-page SEO.",
        },
      }),
    ];
  }

  const wordsPerSub = Math.round(wordCount / subheadings);
  const detail = `${subheadings} subheading(s) for ${wordCount} words (~${wordsPerSub} words each).`;
  if (wordsPerSub <= gap) {
    return [
      createCheck({
        id: "subheading-distribution",
        title: "Subheading distribution",
        status: "pass",
        detail,
        weight: 1,
      }),
    ];
  }

  return [
    createCheck({
      id: "subheading-distribution",
      title: "Subheading distribution",
      status: "warning",
      detail,
      weight: 1,
      recommendation: {
        problem: `Subheadings are spaced ~${wordsPerSub} words apart, above the ${gap}-word guideline.`,
        reason: "Sparse subheadings leave long stretches of text hard to scan.",
        howToFix: "Add more subheadings so sections stay around 300 words.",
        priority: "low",
        impact: "Low–Medium — affects scannability.",
      },
    }),
  ];
}
