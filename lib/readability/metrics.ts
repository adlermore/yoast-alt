/**
 * Pure readability metrics. No DOM, no I/O — every function maps plain text or
 * numbers to numbers so the readability checks stay trivially testable.
 */

import { tokenizeWords } from "@/lib/html";

/**
 * Heuristic English syllable count for a single word. Counts vowel groups,
 * drops a common silent trailing "e", and floors at 1. Good enough for the
 * Flesch approximation; it is not a linguistic tokenizer.
 */
export function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (clean.length === 0) return 0;
  if (clean.length <= 3) return 1;

  const normalized = clean
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const groups = normalized.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Total syllables across every word in the text. */
export function countTextSyllables(text: string): number {
  return tokenizeWords(text).reduce((sum, word) => sum + countSyllables(word), 0);
}

/**
 * Flesch Reading Ease (0–100, higher is easier). Returns `null` when there is
 * too little text to produce a meaningful score.
 */
export function fleschReadingEase(
  words: number,
  sentences: number,
  syllables: number,
): number | null {
  if (words < 1 || sentences < 1) return null;
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export interface FleschVerdict {
  label: string;
  /** Approximate US school grade band the text reads at. */
  grade: string;
}

/** Human-readable interpretation of a Flesch Reading Ease score. */
export function interpretFlesch(score: number): FleschVerdict {
  if (score >= 90) return { label: "Very easy", grade: "5th grade" };
  if (score >= 70) return { label: "Easy", grade: "6th–7th grade" };
  if (score >= 60) return { label: "Fairly easy", grade: "8th–9th grade" };
  if (score >= 50) return { label: "Plain English", grade: "10th–12th grade" };
  if (score >= 30) return { label: "Fairly difficult", grade: "College" };
  return { label: "Very difficult", grade: "College graduate" };
}
