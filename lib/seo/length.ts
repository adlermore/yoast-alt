/** Shared length classification for title/description-style fields. */

export type LengthVerdict = "short" | "ok" | "long" | "too-long";

export interface LengthRange {
  min: number;
  max: number;
  hardMax: number;
}

export function classifyLength(length: number, range: LengthRange): LengthVerdict {
  if (length < range.min) return "short";
  if (length > range.hardMax) return "too-long";
  if (length > range.max) return "long";
  return "ok";
}
