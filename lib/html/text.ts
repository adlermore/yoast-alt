/**
 * Pure text utilities shared by the parser and readability analyzers.
 * No DOM, no I/O — trivially unit-testable.
 */

/** Collapse all runs of whitespace to single spaces and trim. */
export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Word tokens, using Unicode letters/numbers so non-Latin scripts count. */
export function tokenizeWords(value: string): string[] {
  const matches = value.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu);
  return matches ?? [];
}

export function countWords(value: string): number {
  return tokenizeWords(value).length;
}

export function countCharacters(value: string): number {
  return normalizeWhitespace(value).length;
}

/**
 * Split text into sentences. Uses terminal punctuation as boundaries while
 * ignoring common abbreviations and decimals well enough for scoring purposes.
 */
export function splitSentences(value: string): string[] {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return [];
  return normalized
    .split(/(?<=[.!?])(?:["'”’)\]]*)\s+(?=[\p{Lu}\p{N}"'“(\[])/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

export function countSentences(value: string): number {
  return splitSentences(value).length;
}

/** Estimated reading time in minutes at ~200 words per minute. */
export function estimateReadingTime(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.max(1, Math.round(wordCount / 200));
}

/** Escape text for safe interpolation into HTML markup. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Truncate for display, appending an ellipsis when shortened. */
export function truncate(value: string, max: number): string {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}
