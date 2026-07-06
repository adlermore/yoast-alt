/**
 * Inline text annotator. Splits the analyzed text into sentences and tags each
 * long sentence so the UI can highlight the offending ranges. Uses the same
 * threshold as the readability check, keeping the score and the highlights
 * consistent.
 */

import type { TextAnnotations, TextIssueType, TextSegment } from "@/types";
import { splitSentences, tokenizeWords } from "@/lib/html";
import { READABILITY_THRESHOLDS } from "@/constants/thresholds";

/** Cap the annotated text so a huge page cannot bloat the payload. */
const MAX_ANNOTATE_CHARS = 40_000;

export function annotateText(text: string): TextAnnotations {
  const trimmed = text.trim();
  const truncated = trimmed.length > MAX_ANNOTATE_CHARS;
  const scoped = truncated ? trimmed.slice(0, MAX_ANNOTATE_CHARS) : trimmed;

  const longLimit = READABILITY_THRESHOLDS.sentence.longWords;
  const counts: Record<TextIssueType, number> = {
    "long-sentence": 0,
  };

  const segments: TextSegment[] = splitSentences(scoped).map((sentence) => {
    const words = tokenizeWords(sentence).length;
    const issues: TextIssueType[] = [];
    if (words > longLimit) {
      issues.push("long-sentence");
      counts["long-sentence"] += 1;
    }
    return { text: sentence, words, issues };
  });

  return {
    segments,
    truncated,
    sentenceCount: segments.length,
    longSentenceLimit: longLimit,
    counts,
  };
}
