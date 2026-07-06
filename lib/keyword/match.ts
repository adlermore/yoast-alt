/**
 * Focus-keyword matching helpers. Whole-phrase, case-insensitive, and
 * Unicode-aware so non-Latin keywords work. All functions are total.
 */

import { tokenizeWords } from "@/lib/html";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Normalize a keyword for comparison (trim + collapse inner whitespace). */
export function normalizeKeyword(keyword: string): string {
  return keyword.replace(/\s+/g, " ").trim();
}

/**
 * Count whole-phrase occurrences of `keyword` in `haystack`, respecting
 * word boundaries so "art" does not match inside "start".
 */
export function countOccurrences(haystack: string, keyword: string): number {
  const kw = normalizeKeyword(keyword);
  if (!kw || !haystack) return 0;
  try {
    const pattern = new RegExp(
      `(?<![\\p{L}\\p{N}])${escapeRegExp(kw)}(?![\\p{L}\\p{N}])`,
      "giu",
    );
    return (haystack.match(pattern) ?? []).length;
  } catch {
    // Extremely unlikely (escaping covers metachars); degrade to a plain scan.
    return haystack.toLowerCase().split(kw.toLowerCase()).length - 1;
  }
}

/** Whether the keyword appears at least once in the text. */
export function containsKeyword(haystack: string | null, keyword: string): boolean {
  if (!haystack) return false;
  return countOccurrences(haystack, keyword) > 0;
}

/** The number of word tokens in the keyword phrase (for density weighting). */
export function keywordWordCount(keyword: string): number {
  return tokenizeWords(normalizeKeyword(keyword)).length || 1;
}

/** First ~`words` words of the text — a proxy for the introduction. */
export function leadingText(text: string, words = 100): string {
  return tokenizeWords(text).slice(0, words).join(" ");
}
