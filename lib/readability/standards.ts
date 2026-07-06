/**
 * Content-standards evaluation — pure and isomorphic (runs client-side for
 * instant feedback). Scores text against user-configurable standards and
 * produces a scorecard, a marked-up (long + passive) rendering model, and a
 * prioritized "what to fix" list.
 */

import {
  countWords,
  splitSentences,
  tokenizeWords,
  truncate,
} from "@/lib/html";
import {
  countTextSyllables,
  fleschReadingEase,
  interpretFlesch,
} from "./metrics";
import { findPassiveRanges } from "./detect";

export interface ContentStandards {
  maxWordsPerSentence: number;
  maxPassivePct: number;
  minTotalWords: number;
  minReadingEase: number;
}

export const DEFAULT_STANDARDS: ContentStandards = {
  maxWordsPerSentence: 20,
  maxPassivePct: 10,
  minTotalWords: 300,
  minReadingEase: 60,
};

/** At most this share of sentences may exceed the max length (Yoast's rule). */
const LONG_SENTENCE_TOLERANCE = 0.25;

export type MetricKey = "words" | "sentence" | "passive" | "reading";

export interface StandardMetric {
  key: MetricKey;
  label: string;
  value: string;
  unit: string | null;
  detail: string;
  met: boolean;
  badge: string;
}

export interface SentencePart {
  text: string;
  passive: boolean;
}

export interface MarkedSentence {
  words: number;
  long: boolean;
  passive: boolean;
  parts: SentencePart[];
}

export interface MarkedParagraph {
  sentences: MarkedSentence[];
}

export interface FixItem {
  type: "long" | "passive" | "length" | "reading";
  badge: string;
  heading: string;
  text: string;
}

export interface StandardsResult {
  totalWords: number;
  sentenceCount: number;
  longCount: number;
  passiveSentenceCount: number;
  metrics: StandardMetric[];
  standardsNotMet: number;
  paragraphs: MarkedParagraph[];
  fixes: FixItem[];
}

function splitParts(sentence: string): SentencePart[] {
  const ranges = findPassiveRanges(sentence);
  if (ranges.length === 0) return [{ text: sentence, passive: false }];

  const parts: SentencePart[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) {
      parts.push({ text: sentence.slice(cursor, range.start), passive: false });
    }
    parts.push({ text: sentence.slice(range.start, range.end), passive: true });
    cursor = range.end;
  }
  if (cursor < sentence.length) {
    parts.push({ text: sentence.slice(cursor), passive: false });
  }
  return parts;
}

export function evaluateContent(
  text: string,
  standards: ContentStandards,
): StandardsResult {
  const trimmed = text.trim();
  const totalWords = countWords(trimmed);

  // Process per paragraph so the marked-up view and the metrics share the exact
  // same sentence set.
  const rawParagraphs = trimmed
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const source = rawParagraphs.length > 0 ? rawParagraphs : trimmed ? [trimmed] : [];

  const maxLen = Math.max(1, standards.maxWordsPerSentence);
  const paragraphs: MarkedParagraph[] = [];
  const longSentences: { words: number; text: string }[] = [];
  const passiveSentences: string[] = [];
  let sentenceCount = 0;

  for (const paragraph of source) {
    const sentences = splitSentences(paragraph);
    const marked: MarkedSentence[] = sentences.map((sentence) => {
      const words = tokenizeWords(sentence).length;
      const long = words > maxLen;
      const parts = splitParts(sentence);
      const passive = parts.some((part) => part.passive);
      sentenceCount += 1;
      if (long) longSentences.push({ words, text: sentence });
      if (passive) passiveSentences.push(sentence);
      return { words, long, passive, parts };
    });
    paragraphs.push({ sentences: marked });
  }

  const longCount = longSentences.length;
  const passiveSentenceCount = passiveSentences.length;
  const longPct = sentenceCount > 0 ? Math.round((longCount / sentenceCount) * 100) : 0;
  const passivePct =
    sentenceCount > 0 ? Math.round((passiveSentenceCount / sentenceCount) * 100) : 0;
  const avg =
    sentenceCount > 0 ? Math.round((totalWords / sentenceCount) * 10) / 10 : 0;
  const reading =
    totalWords >= 1 && sentenceCount >= 1
      ? fleschReadingEase(totalWords, sentenceCount, countTextSyllables(trimmed))
      : null;

  // --- Scorecard ---
  const wordsMet = totalWords >= standards.minTotalWords;
  const sentenceMet = longCount === 0 || longPct <= LONG_SENTENCE_TOLERANCE * 100;
  const passiveMet = passivePct <= standards.maxPassivePct;
  const readingMet = reading !== null && reading >= standards.minReadingEase;
  const readingVerdict = reading !== null ? interpretFlesch(reading) : null;

  const metrics: StandardMetric[] = [
    {
      key: "words",
      label: "Total words",
      value: String(totalWords),
      unit: null,
      detail: wordsMet
        ? `Meets the ${standards.minTotalWords}-word minimum`
        : `Needs ${standards.minTotalWords - totalWords} more to reach ${standards.minTotalWords}`,
      met: wordsMet,
      badge: wordsMet ? "Long enough" : "Too short",
    },
    {
      key: "sentence",
      label: "Sentence length",
      value: avg.toFixed(1),
      unit: "avg",
      detail:
        sentenceCount > 0
          ? `${longCount} of ${sentenceCount} sentences over ${standards.maxWordsPerSentence} words (${longPct}%)`
          : "No sentences yet",
      met: sentenceMet,
      badge: sentenceMet ? "Good length" : "Too many long",
    },
    {
      key: "passive",
      label: "Passive voice",
      value: String(passivePct),
      unit: "%",
      detail: `${passiveSentenceCount} of ${sentenceCount} sentences · limit ${standards.maxPassivePct}%`,
      met: passiveMet,
      badge: passiveMet ? "Within limit" : "Over limit",
    },
    {
      key: "reading",
      label: "Reading ease",
      value: reading !== null ? String(reading) : "—",
      unit: "/100",
      detail:
        readingVerdict !== null
          ? `${readingVerdict.label} · target ${standards.minReadingEase}+`
          : "Add more text to score",
      met: readingMet,
      badge: readingMet ? "Reader-friendly" : "Hard to read",
    },
  ];

  const standardsNotMet = metrics.filter((m) => !m.met).length;

  // --- What to fix ---
  const fixes: FixItem[] = [];
  if (!wordsMet && totalWords > 0) {
    fixes.push({
      type: "length",
      badge: "LENGTH",
      heading: `${standards.minTotalWords - totalWords} more words`,
      text: `Expand the content to at least ${standards.minTotalWords} words to satisfy the length standard.`,
    });
  }
  for (const sentence of [...longSentences].sort((a, b) => b.words - a.words)) {
    fixes.push({
      type: "long",
      badge: "LONG",
      heading: `${sentence.words} words`,
      text: `Split this sentence: "${truncate(sentence.text, 80)}"`,
    });
  }
  for (const sentence of passiveSentences) {
    fixes.push({
      type: "passive",
      badge: "PASSIVE",
      heading: "passive voice",
      text: `Rewrite in the active voice: "${truncate(sentence, 80)}"`,
    });
  }

  return {
    totalWords,
    sentenceCount,
    longCount,
    passiveSentenceCount,
    metrics,
    standardsNotMet,
    paragraphs,
    fixes,
  };
}
