/**
 * The analysis orchestrator.
 *
 * Runs every registered analyzer over a {@link ParsedDocument} and aggregates
 * their scores into a {@link ScoreBreakdown}. The keyword analyzer is included
 * only when a focus keyword is supplied, so an unset keyword never dilutes the
 * overall score.
 */

import type {
  AnalysisContext,
  AnalysisOutcome,
  Analyzer,
  AnalyzerCategory,
  ParsedDocument,
} from "@/types";
import { seoAnalyzer } from "@/lib/seo";
import { readabilityAnalyzer } from "@/lib/readability";
import { technicalAnalyzer } from "@/lib/technical";
import { schemaAnalyzer } from "@/lib/schema";
import { keywordAnalyzer } from "@/lib/keyword";
import { geoAnalyzer } from "@/lib/geo";
import { normalizeScore, weightedAverage } from "@/lib/scores";

/** Toggles for the optional analyzers (SEO is always on). */
export interface RunOptions {
  readability?: boolean;
  technical?: boolean;
  schema?: boolean;
  geo?: boolean;
}

export function runAnalysis(
  doc: ParsedDocument,
  context: AnalysisContext = {},
  options: RunOptions = {},
): AnalysisOutcome {
  // Assemble the analyzer list in display order, honoring toggles. SEO is
  // always included; keyword runs only when a focus keyword is supplied.
  const analyzers: Analyzer[] = [seoAnalyzer];
  if (context.focusKeyword && context.focusKeyword.trim()) {
    analyzers.push(keywordAnalyzer);
  }
  if (options.readability !== false) analyzers.push(readabilityAnalyzer);
  if (options.technical !== false) analyzers.push(technicalAnalyzer);
  if (options.schema !== false) analyzers.push(schemaAnalyzer);
  if (options.geo !== false) analyzers.push(geoAnalyzer);

  const results = analyzers.map((analyzer) => analyzer.analyze(doc, context));

  const scoreFor = (category: AnalyzerCategory): number =>
    results.find((result) => result.category === category)?.score ?? 0;

  const overall = weightedAverage(
    results.map((result) => ({ score: result.score, weight: 1 })),
  );

  return {
    results,
    scores: {
      overall: normalizeScore(overall),
      seo: scoreFor("seo"),
      readability: scoreFor("readability"),
      keyword: scoreFor("keyword"),
      technical: scoreFor("technical"),
      geo: scoreFor("geo"),
    },
  };
}
