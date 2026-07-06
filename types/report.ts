/**
 * The persisted report contract.
 *
 * A report is the aggregation of every analyzer result for a single analysis,
 * plus the headline scores. Reports are serialized to JSON on disk (no
 * database) so they can be reopened from History.
 */

import type { AnalyzerResult, AnalyzerCategory, TextAnnotations } from "./analysis";
import type { DocumentSource, ParsedDocument } from "./document";

export interface ScoreBreakdown {
  overall: number;
  seo: number;
  readability: number;
  keyword: number;
  technical: number;
  /** 0 in reports saved before the GEO analyzer existed. */
  geo: number;
}

export interface ReportInput {
  source: DocumentSource;
  /** URL for URL analysis; a short label otherwise. */
  target: string;
  focusKeyword: string | null;
}

export interface Report {
  id: string;
  createdAt: string;
  input: ReportInput;
  scores: ScoreBreakdown;
  results: AnalyzerResult[];
  /** Client-safe parsed document (source HTML and body text stripped). */
  document: ParsedDocument;
  /** Inline text problems for highlighting, when the analysis produced text. */
  annotations: TextAnnotations | null;
}

/**
 * The in-memory result of running the analyzer suite over a document — the
 * scored payload the UI renders and the basis for a persisted {@link Report}.
 */
export interface AnalysisOutcome {
  results: AnalyzerResult[];
  scores: ScoreBreakdown;
}

/** Lightweight index entry for the History list (avoids loading full reports). */
export interface ReportSummary {
  id: string;
  createdAt: string;
  source: DocumentSource;
  target: string;
  focusKeyword: string | null;
  overall: number;
}

export type CategoryScores = Partial<Record<AnalyzerCategory, number>>;
