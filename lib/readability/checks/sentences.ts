import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { splitSentences, tokenizeWords, truncate } from "@/lib/html";
import { READABILITY_THRESHOLDS } from "@/constants/thresholds";

/** Flag a high proportion of overly long sentences and surface the worst offenders. */
export function checkSentenceLength(doc: ParsedDocument): Check[] {
  if (doc.content.wordCount < READABILITY_THRESHOLDS.minWords) return [];

  const sentences = splitSentences(doc.content.text);
  if (sentences.length === 0) return [];

  const { longWords, tooLongRatio } = READABILITY_THRESHOLDS.sentence;
  const long = sentences
    .map((sentence, index) => ({ sentence, index, words: tokenizeWords(sentence).length }))
    .filter((entry) => entry.words > longWords);

  const ratio = long.length / sentences.length;
  const pct = Math.round(ratio * 100);
  const detail = `${pct}% of sentences (${long.length}/${sentences.length}) run longer than ${longWords} words.`;

  if (ratio <= tooLongRatio) {
    return [
      createCheck({
        id: "sentence-length",
        title: "Sentence length",
        status: "pass",
        detail,
        weight: 2,
      }),
    ];
  }

  const sample = [...long].sort((a, b) => b.words - a.words).slice(0, 5);

  return [
    createCheck({
      id: "sentence-length",
      title: "Sentence length",
      status: "warning",
      detail,
      weight: 2,
      highlights: sample.map((entry) => `${entry.words} words: ${truncate(entry.sentence, 120)}`),
      highlightSentences: sample.map((entry) => entry.index),
      recommendation: {
        problem: `Over ${Math.round(tooLongRatio * 100)}% of sentences exceed ${longWords} words.`,
        reason:
          "Long sentences are hard to follow and tire the reader, hurting comprehension.",
        howToFix:
          "Split long sentences into two, or cut filler clauses. Aim to keep most sentences under 20 words.",
        priority: "medium",
        impact: "Medium — affects readability and engagement.",
      },
    }),
  ];
}
