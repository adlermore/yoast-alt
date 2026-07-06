/**
 * Analysis contracts.
 *
 * Every analyzer — regardless of category — produces the same
 * {@link AnalyzerResult} shape. This uniformity is what lets the scoring engine,
 * the report generator, and the UI treat all analyzers interchangeably.
 */

import type { ParsedDocument } from "./document";

export type CheckStatus = "pass" | "warning" | "error" | "info";

export type AnalyzerCategory =
  | "seo"
  | "readability"
  | "keyword"
  | "technical"
  | "schema"
  | "images"
  | "links"
  | "meta"
  | "headings"
  | "content";

export type Priority = "critical" | "high" | "medium" | "low";

export type ScoreGrade = "excellent" | "good" | "ok" | "poor" | "bad";

/**
 * An actionable recommendation attached to a failing or warning check.
 * Mirrors the report structure required by the product spec.
 */
export interface Recommendation {
  problem: string;
  reason: string;
  howToFix: string;
  priority: Priority;
  /** Human-readable estimated impact, e.g. "High — affects click-through rate". */
  impact: string;
}

/** A single, atomic assertion about the document. */
export interface Check {
  id: string;
  title: string;
  status: CheckStatus;
  /** One-line explanation of the current state. */
  detail: string;
  /** Relative weight within the analyzer. Defaults to 1. `info` checks are unscored. */
  weight: number;
  recommendation?: Recommendation;
  /** Problematic excerpts to surface in the UI (e.g. long sentences). */
  highlights?: string[];
  /**
   * Sentence indices (into the analyzed text's sentences) each highlight maps
   * to, aligned position-for-position with {@link highlights}. Lets the UI
   * scroll to and highlight the exact fragment in the text review.
   */
  highlightSentences?: number[];
}

export interface ScoreSummary {
  passed: number;
  warnings: number;
  errors: number;
  /** Total scored checks (excludes `info`). */
  total: number;
}

export interface AnalyzerResult {
  id: string;
  label: string;
  category: AnalyzerCategory;
  /** Weighted 0–100 score derived from the checks. */
  score: number;
  grade: ScoreGrade;
  checks: Check[];
  summary: ScoreSummary;
}

/**
 * HTTP response metadata captured when a page is fetched by URL. Lets the
 * technical analyzer assess response-level signals (status, headers, robots.txt,
 * sitemap) that cannot be derived from HTML alone.
 */
export interface HttpMeta {
  statusCode: number;
  /** Response headers with lower-cased keys. */
  headers: Record<string, string>;
  /** URL actually landed on after any redirects. */
  finalUrl: string;
  redirected: boolean;
  robotsTxtFound: boolean;
  sitemapFound: boolean;
}

/** Optional inputs that steer analysis (e.g. the focus keyword). */
export interface AnalysisContext {
  focusKeyword?: string;
  url?: string;
  baseUrl?: string;
  /** Present only for URL analysis. */
  http?: HttpMeta;
}

/** A text problem that can be located to a specific sentence for inline marking. */
export type TextIssueType = "long-sentence";

/** One sentence of the analyzed text plus any problems detected in it. */
export interface TextSegment {
  text: string;
  words: number;
  issues: TextIssueType[];
}

/**
 * The analyzed text broken into sentences, each tagged with its issues, so the
 * UI can render the copy with problem ranges highlighted inline.
 */
export interface TextAnnotations {
  segments: TextSegment[];
  /** True when the text was too long and only a leading portion was annotated. */
  truncated: boolean;
  sentenceCount: number;
  /** The word count above which a sentence is flagged as long. */
  longSentenceLimit: number;
  counts: Record<TextIssueType, number>;
}

/**
 * The Strategy contract. Each analyzer is a small, pure, independently testable
 * unit that maps an input to an {@link AnalyzerResult}.
 */
export interface Analyzer<TInput = ParsedDocument> {
  id: string;
  label: string;
  category: AnalyzerCategory;
  analyze(input: TInput, context: AnalysisContext): AnalyzerResult;
}
