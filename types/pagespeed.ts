/**
 * PageSpeed Insights (Lighthouse + CrUX) contracts.
 *
 * Field data (CrUX — real users, the actual ranking signal) and lab data
 * (Lighthouse — diagnostic) are kept in separate arrays and never conflated.
 */

export type PsiStrategy = "mobile" | "desktop";
export type PsiStrategyInput = PsiStrategy | "both";
export type MetricRating = "good" | "needs-improvement" | "poor" | "none";

/** A Core Web Vital from field (CrUX) data. */
export interface FieldMetric {
  id: string;
  label: string;
  displayValue: string;
  rating: MetricRating;
}

/** A lab (Lighthouse) metric. */
export interface LabMetric {
  id: string;
  label: string;
  displayValue: string;
  score: number | null;
  rating: MetricRating;
}

/** A ranked Lighthouse performance opportunity. */
export interface PsiOpportunity {
  id: string;
  title: string;
  description: string;
  displayValue: string;
  savingsMs: number;
  savingsBytes: number;
}

export interface StrategyResult {
  strategy: PsiStrategy;
  performanceScore: number | null;
  fieldAvailable: boolean;
  fieldSource: "url" | "origin" | null;
  overallFieldRating: MetricRating;
  field: FieldMetric[];
  lab: LabMetric[];
  opportunities: PsiOpportunity[];
}

export interface PageSpeedReport {
  url: string;
  fetchedUrl: string;
  strategies: StrategyResult[];
}
