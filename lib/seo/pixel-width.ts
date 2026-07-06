/**
 * SERP pixel-width estimation.
 *
 * Google truncates titles and meta descriptions by rendered pixel width, not
 * character count — roughly 580px for titles (20px Arial) and 920px for
 * descriptions (14px Arial) on desktop. A 60-character title of narrow letters
 * fits; the same count of wide letters gets cut. This module estimates the
 * rendered width from Arial advance widths (units per 1000 em) so checks and
 * the SERP preview flag truncation the way Google actually applies it.
 */

/** Font sizes Google renders desktop snippets at. */
export const SERP_TITLE_FONT_PX = 20;
export const SERP_DESCRIPTION_FONT_PX = 14;

/** Arial advance widths in units per 1000 em, for the printable ASCII range. */
const ARIAL_WIDTHS: Record<string, number> = {
  " ": 278, "!": 278, '"': 355, "#": 556, "$": 556, "%": 889, "&": 667,
  "'": 191, "(": 333, ")": 333, "*": 389, "+": 584, ",": 278, "-": 333,
  ".": 278, "/": 278, "0": 556, "1": 556, "2": 556, "3": 556, "4": 556,
  "5": 556, "6": 556, "7": 556, "8": 556, "9": 556, ":": 278, ";": 278,
  "<": 584, "=": 584, ">": 584, "?": 556, "@": 1015, "A": 667, "B": 667,
  "C": 722, "D": 722, "E": 667, "F": 611, "G": 778, "H": 722, "I": 278,
  "J": 500, "K": 667, "L": 556, "M": 833, "N": 722, "O": 778, "P": 667,
  "Q": 778, "R": 722, "S": 667, "T": 611, "U": 722, "V": 667, "W": 944,
  "X": 667, "Y": 667, "Z": 611, "[": 278, "\\": 278, "]": 278, "^": 469,
  "_": 556, "`": 333, "a": 556, "b": 556, "c": 500, "d": 556, "e": 556,
  "f": 278, "g": 556, "h": 556, "i": 222, "j": 222, "k": 500, "l": 222,
  "m": 833, "n": 556, "o": 556, "p": 556, "q": 556, "r": 333, "s": 500,
  "t": 278, "u": 556, "v": 500, "w": 722, "x": 500, "y": 500, "z": 500,
  "{": 334, "|": 260, "}": 334, "~": 584,
};

/** Average lowercase advance — used for Cyrillic, accented Latin, etc. */
const DEFAULT_WIDTH = 556;
/** CJK ideographs, kana, and fullwidth forms render at a full em. */
const CJK_WIDTH = 1000;

function isFullWidth(codePoint: number): boolean {
  return (
    (codePoint >= 0x2e80 && codePoint <= 0x9fff) || // CJK radicals, kana, ideographs
    (codePoint >= 0xac00 && codePoint <= 0xd7af) || // Hangul syllables
    (codePoint >= 0xf900 && codePoint <= 0xfaff) || // CJK compatibility
    (codePoint >= 0xff00 && codePoint <= 0xff60)    // fullwidth forms
  );
}

function charUnits(char: string): number {
  const known = ARIAL_WIDTHS[char];
  if (known !== undefined) return known;
  const codePoint = char.codePointAt(0) ?? 0;
  return isFullWidth(codePoint) ? CJK_WIDTH : DEFAULT_WIDTH;
}

/** Estimated rendered width of `text` in pixels at `fontSizePx` in Arial. */
export function estimateTextWidth(text: string, fontSizePx: number): number {
  let units = 0;
  for (const char of text) units += charUnits(char);
  return Math.round((units / 1000) * fontSizePx);
}

export function titlePixelWidth(text: string): number {
  return estimateTextWidth(text, SERP_TITLE_FONT_PX);
}

export function descriptionPixelWidth(text: string): number {
  return estimateTextWidth(text, SERP_DESCRIPTION_FONT_PX);
}

export type PixelVerdict = "short" | "ok" | "truncated";

export interface PixelRange {
  min: number;
  max: number;
}

export function classifyPixelWidth(width: number, range: PixelRange): PixelVerdict {
  if (width > range.max) return "truncated";
  if (width < range.min) return "short";
  return "ok";
}
