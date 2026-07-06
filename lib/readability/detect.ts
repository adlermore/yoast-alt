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

/** Whether a sentence contains a transition word or phrase. */
export function hasTransition(sentence: string): boolean {
  const lower = sentence.toLowerCase();
  if (TRANSITION_PHRASES.some((phrase) => lower.includes(phrase))) return true;
  return tokenizeWords(lower).some((word) => TRANSITION_WORDS.has(word));
}
