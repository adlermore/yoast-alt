/**
 * The scoring engine.
 *
 * Pure, framework-free functions that convert a list of {@link Check}s into a
 * weighted 0–100 score, a grade, and a summary. Every analyzer routes through
 * here so weighting logic lives in exactly one place.
 */

import type {
  Check,
  CheckStatus,
  ScoreGrade,
  ScoreSummary,
  AnalyzerResult,
  AnalyzerCategory,
} from "@/types";

/** Score contribution of each status, on a 0–100 scale. `info` is unscored. */
const STATUS_SCORE: Record<Exclude<CheckStatus, "info">, number> = {
  pass: 100,
  warning: 50,
  error: 0,
};

const GRADE_THRESHOLDS: ReadonlyArray<[min: number, grade: ScoreGrade]> = [
  [90, "excellent"],
  [75, "good"],
  [50, "ok"],
  [25, "poor"],
  [0, "bad"],
];

/** Checks that count toward the score (everything except `info`). */
export function scorableChecks(checks: readonly Check[]): Check[] {
  return checks.filter((check) => check.status !== "info");
}

/** Clamp to the inclusive 0–100 range and round to an integer. */
export function normalizeScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Weighted average of check scores. A check with no explicit weight counts as 1.
 * Returns 100 when there is nothing to score (an empty analyzer is not failing).
 */
export function computeScore(checks: readonly Check[]): number {
  const scorable = scorableChecks(checks);
  if (scorable.length === 0) return 100;

  let weightedSum = 0;
  let weightTotal = 0;

  for (const check of scorable) {
    const weight = check.weight > 0 ? check.weight : 1;
    weightedSum += STATUS_SCORE[check.status as keyof typeof STATUS_SCORE] * weight;
    weightTotal += weight;
  }

  return normalizeScore(weightedSum / weightTotal);
}

export function gradeFromScore(score: number): ScoreGrade {
  const clamped = normalizeScore(score);
  for (const [min, grade] of GRADE_THRESHOLDS) {
    if (clamped >= min) return grade;
  }
  return "bad";
}

export function summarize(checks: readonly Check[]): ScoreSummary {
  const summary: ScoreSummary = { passed: 0, warnings: 0, errors: 0, total: 0 };
  for (const check of checks) {
    switch (check.status) {
      case "pass":
        summary.passed += 1;
        summary.total += 1;
        break;
      case "warning":
        summary.warnings += 1;
        summary.total += 1;
        break;
      case "error":
        summary.errors += 1;
        summary.total += 1;
        break;
      case "info":
        break;
    }
  }
  return summary;
}

/** Weighted mean of several sub-scores; ignores entries with zero weight. */
export function weightedAverage(
  entries: ReadonlyArray<{ score: number; weight: number }>,
): number {
  let weightedSum = 0;
  let weightTotal = 0;
  for (const { score, weight } of entries) {
    if (weight <= 0) continue;
    weightedSum += normalizeScore(score) * weight;
    weightTotal += weight;
  }
  if (weightTotal === 0) return 0;
  return normalizeScore(weightedSum / weightTotal);
}

export interface BuildResultInput {
  id: string;
  label: string;
  category: AnalyzerCategory;
  checks: Check[];
}

/**
 * Assemble a complete {@link AnalyzerResult} from raw checks. This is the single
 * entry point analyzers use to return their output.
 */
export function buildAnalyzerResult(input: BuildResultInput): AnalyzerResult {
  const score = computeScore(input.checks);
  return {
    id: input.id,
    label: input.label,
    category: input.category,
    score,
    grade: gradeFromScore(score),
    checks: input.checks,
    summary: summarize(input.checks),
  };
}
