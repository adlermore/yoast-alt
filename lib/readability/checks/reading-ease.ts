import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { countSentences } from "@/lib/html";
import { READABILITY_THRESHOLDS } from "@/constants/thresholds";
import {
  countTextSyllables,
  fleschReadingEase,
  interpretFlesch,
} from "../metrics";

/** Overall reading ease via the Flesch Reading Ease formula. */
export function checkReadingEase(doc: ParsedDocument): Check[] {
  const { text, wordCount } = doc.content;
  if (wordCount < READABILITY_THRESHOLDS.minWords) {
    return [
      createCheck({
        id: "reading-ease",
        title: "Reading ease",
        status: "info",
        detail: `Only ${wordCount} words — too little text to assess readability.`,
      }),
    ];
  }

  const sentences = doc.content.sentenceCount || countSentences(text);
  const syllables = countTextSyllables(text);
  const score = fleschReadingEase(wordCount, sentences, syllables);
  if (score === null) {
    return [
      createCheck({
        id: "reading-ease",
        title: "Reading ease",
        status: "info",
        detail: "Could not compute a reading-ease score for this text.",
      }),
    ];
  }

  const verdict = interpretFlesch(score);
  const detail = `Flesch reading ease ${score}/100 — ${verdict.label} (reads at ~${verdict.grade}).`;
  const status = score >= 60 ? "pass" : score >= 30 ? "warning" : "error";
  if (status === "pass") {
    return [createCheck({ id: "reading-ease", title: "Reading ease", status, detail, weight: 2 })];
  }

  return [
    createCheck({
      id: "reading-ease",
      title: "Reading ease",
      status,
      detail,
      weight: 2,
      recommendation: {
        problem: "The text is harder to read than ideal for a general audience.",
        reason:
          "Dense, complex writing increases bounce rate and lowers comprehension and engagement.",
        howToFix:
          "Use shorter sentences and simpler, more common words. Break up complex ideas into steps.",
        priority: status === "error" ? "high" : "medium",
        impact: "Medium — affects engagement and time on page.",
      },
    }),
  ];
}
