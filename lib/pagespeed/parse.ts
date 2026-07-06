/**
 * Pure parsing of a PageSpeed Insights v5 response into our {@link StrategyResult}.
 * No I/O — the fetch layer hands the JSON here.
 */

import type {
  FieldMetric,
  LabMetric,
  MetricRating,
  PsiOpportunity,
  PsiStrategy,
  StrategyResult,
} from "@/types";

interface PsiAudit {
  id?: string;
  title?: string;
  description?: string;
  score?: number | null;
  displayValue?: string;
  details?: {
    type?: string;
    overallSavingsMs?: number;
    overallSavingsBytes?: number;
  };
}

interface PsiExperience {
  metrics?: Record<string, { percentile?: number; category?: string }>;
  overall_category?: string;
}

export interface PsiJson {
  lighthouseResult?: {
    finalUrl?: string;
    requestedUrl?: string;
    categories?: { performance?: { score?: number | null } };
    audits?: Record<string, PsiAudit>;
  };
  loadingExperience?: PsiExperience;
  originLoadingExperience?: PsiExperience;
  error?: { message?: string };
}

function ratingFromCategory(category?: string): MetricRating {
  switch (category) {
    case "FAST":
      return "good";
    case "AVERAGE":
      return "needs-improvement";
    case "SLOW":
      return "poor";
    default:
      return "none";
  }
}

function ratingFromScore(score: number | null | undefined): MetricRating {
  if (score === null || score === undefined) return "none";
  if (score >= 0.9) return "good";
  if (score >= 0.5) return "needs-improvement";
  return "poor";
}

function formatMs(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(1)} s` : `${Math.round(value)} ms`;
}

const FIELD_MAP: {
  key: string;
  id: string;
  label: string;
  format: (percentile: number) => string;
}[] = [
  { key: "LARGEST_CONTENTFUL_PAINT_MS", id: "LCP", label: "Largest Contentful Paint", format: formatMs },
  { key: "INTERACTION_TO_NEXT_PAINT", id: "INP", label: "Interaction to Next Paint", format: formatMs },
  {
    key: "CUMULATIVE_LAYOUT_SHIFT_SCORE",
    id: "CLS",
    label: "Cumulative Layout Shift",
    format: (p) => (p / 100).toFixed(2),
  },
  { key: "FIRST_CONTENTFUL_PAINT_MS", id: "FCP", label: "First Contentful Paint", format: formatMs },
  { key: "EXPERIMENTAL_TIME_TO_FIRST_BYTE", id: "TTFB", label: "Time to First Byte", format: formatMs },
];

const LAB_MAP: { audit: string; id: string; label: string }[] = [
  { audit: "largest-contentful-paint", id: "LCP", label: "Largest Contentful Paint" },
  { audit: "first-contentful-paint", id: "FCP", label: "First Contentful Paint" },
  { audit: "total-blocking-time", id: "TBT", label: "Total Blocking Time" },
  { audit: "cumulative-layout-shift", id: "CLS", label: "Cumulative Layout Shift" },
  { audit: "speed-index", id: "SI", label: "Speed Index" },
  { audit: "interactive", id: "TTI", label: "Time to Interactive" },
];

function parseField(experience: PsiExperience): FieldMetric[] {
  const metrics = experience.metrics ?? {};
  const out: FieldMetric[] = [];
  for (const { key, id, label, format } of FIELD_MAP) {
    const metric = metrics[key];
    if (!metric || typeof metric.percentile !== "number") continue;
    out.push({
      id,
      label,
      displayValue: format(metric.percentile),
      rating: ratingFromCategory(metric.category),
    });
  }
  return out;
}

export function parsePsi(json: PsiJson, strategy: PsiStrategy): StrategyResult {
  const lh = json.lighthouseResult ?? {};
  const audits = lh.audits ?? {};

  const rawScore = lh.categories?.performance?.score;
  const performanceScore =
    rawScore === null || rawScore === undefined ? null : Math.round(rawScore * 100);

  // Field: prefer URL-level CrUX, fall back to origin-level.
  const urlExp = json.loadingExperience;
  const originExp = json.originLoadingExperience;
  let field: FieldMetric[] = [];
  let fieldSource: "url" | "origin" | null = null;
  let overallFieldRating: MetricRating = "none";
  if (urlExp?.metrics && Object.keys(urlExp.metrics).length > 0) {
    field = parseField(urlExp);
    fieldSource = "url";
    overallFieldRating = ratingFromCategory(urlExp.overall_category);
  } else if (originExp?.metrics && Object.keys(originExp.metrics).length > 0) {
    field = parseField(originExp);
    fieldSource = "origin";
    overallFieldRating = ratingFromCategory(originExp.overall_category);
  }

  // Lab metrics.
  const lab: LabMetric[] = [];
  for (const { audit, id, label } of LAB_MAP) {
    const a = audits[audit];
    if (!a) continue;
    lab.push({
      id,
      label,
      displayValue: a.displayValue ?? "—",
      score: a.score ?? null,
      rating: ratingFromScore(a.score),
    });
  }

  // Opportunities (ranked by estimated time saved).
  const opportunities: PsiOpportunity[] = Object.values(audits)
    .filter(
      (a) =>
        a.details?.type === "opportunity" &&
        ((a.details.overallSavingsMs ?? 0) > 0 || (a.details.overallSavingsBytes ?? 0) > 0),
    )
    .map((a) => ({
      id: a.id ?? "",
      title: a.title ?? "",
      description: a.description ?? "",
      displayValue: a.displayValue ?? "",
      savingsMs: Math.round(a.details?.overallSavingsMs ?? 0),
      savingsBytes: Math.round(a.details?.overallSavingsBytes ?? 0),
    }))
    .sort((a, b) => b.savingsMs - a.savingsMs)
    .slice(0, 12);

  return {
    strategy,
    performanceScore,
    fieldAvailable: field.length > 0,
    fieldSource,
    overallFieldRating,
    field,
    lab,
    opportunities,
  };
}
