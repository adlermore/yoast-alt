/**
 * Sentence-level detectors shared by the readability checks. Heuristic and
 * English-oriented — they flag candidates for review, not grammatical certainty.
 */

import { tokenizeWords } from "@/lib/html";
import {
  BE_FORMS,
  IRREGULAR_PARTICIPLES,
  TRANSITION_PHRASES,
  TRANSITION_WORDS,
} from "./wordlists";

/**
 * Detect passive voice: a "to be" form followed within a few words by a past
 * participle (regular -ed or a known irregular).
 */
export function isPassiveSentence(sentence: string): boolean {
  const words = tokenizeWords(sentence.toLowerCase());
  for (let i = 0; i < words.length; i += 1) {
    if (!BE_FORMS.has(words[i])) continue;
    const end = Math.min(i + 3, words.length - 1);
    for (let j = i + 1; j <= end; j += 1) {
      const word = words[j];
      if (IRREGULAR_PARTICIPLES.has(word)) return true;
      if (word.length > 3 && word.endsWith("ed")) return true;
    }
  }
  return false;
}

const BE_PATTERN = [...BE_FORMS].join("|");

export interface PassiveRange {
  start: number;
  end: number;
}

/**
 * Locate passive-voice constructions within a sentence: a "to be" form,
 * optionally followed by up to two adverbs, then a past participle (regular -ed
 * or a known irregular). Returns character ranges so the UI can highlight the
 * exact phrase (e.g. "were reviewed", "are increasingly influenced").
 */
export function findPassiveRanges(sentence: string): PassiveRange[] {
  const re = new RegExp(
    `\\b(?:${BE_PATTERN})\\b(?:\\s+[\\p{L}]+ly){0,2}\\s+([\\p{L}]+)`,
    "giu",
  );
  const ranges: PassiveRange[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(sentence)) !== null) {
    const participle = match[1].toLowerCase();
    const isParticiple =
      IRREGULAR_PARTICIPLES.has(participle) ||
      (participle.length > 3 && participle.endsWith("ed"));
    if (isParticiple) {
      ranges.push({ start: match.index, end: match.index + match[0].length });
    }
  }
  return ranges;
}

/** Whether a sentence contains a transition word or phrase. */
export function hasTransition(sentence: string): boolean {
  const lower = sentence.toLowerCase();
  if (TRANSITION_PHRASES.some((phrase) => lower.includes(phrase))) return true;
  return tokenizeWords(lower).some((word) => TRANSITION_WORDS.has(word));
}
