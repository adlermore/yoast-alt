/**
 * Central tuning constants for analyzers. Kept in one place so scoring rules are
 * auditable and consistent across the SEO, readability, and keyword modules.
 */

export const SEO_THRESHOLDS = {
  title: { min: 30, max: 60, hardMax: 70 },
  description: { min: 120, max: 160, hardMax: 165 },
  content: { thin: 300, recommended: 600 },
  headings: { maxH1: 1 },
} as const;

export const READABILITY_THRESHOLDS = {
  /** Below this word count the text is too short to assess meaningfully. */
  minWords: 50,
  sentence: { longWords: 20, tooLongRatio: 0.25 },
  paragraph: { longWords: 150 },
  passiveVoiceRatio: 0.1,
  transitionWordRatio: 0.3,
  consecutiveSentences: 3,
  subheadingGapWords: 300,
} as const;

export const KEYWORD_THRESHOLDS = {
  density: { min: 0.5, max: 2.5, stuffing: 3 },
} as const;
