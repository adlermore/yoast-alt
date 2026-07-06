import type {
  Analyzer,
  AnalysisContext,
  AnalyzerResult,
  ParsedDocument,
} from "@/types";
import { buildAnalyzerResult, createCheck } from "@/lib/scores";
import { checkKeywordDensity, checkKeywordPlacement } from "./checks";
import { normalizeKeyword } from "./match";

/**
 * Focus-keyword analyzer. Scores how well the page targets a single focus
 * keyword — placement across title/description/H1/intro/subheadings/URL/alt
 * and body density. Returns an informational-only result when no keyword is
 * supplied (the orchestrator omits it from scoring in that case).
 */
export const keywordAnalyzer: Analyzer = {
  id: "keyword",
  label: "Keyword",
  category: "keyword",
  analyze(doc: ParsedDocument, context: AnalysisContext): AnalyzerResult {
    const keyword = normalizeKeyword(context.focusKeyword ?? "");

    if (!keyword) {
      return buildAnalyzerResult({
        id: "keyword",
        label: "Keyword",
        category: "keyword",
        checks: [
          createCheck({
            id: "keyword-set",
            title: "Focus keyword",
            status: "info",
            detail: "No focus keyword was provided, so keyword targeting was not analyzed.",
          }),
        ],
      });
    }

    const checks = [
      ...checkKeywordPlacement(doc, keyword),
      ...checkKeywordDensity(doc, keyword),
    ];

    return buildAnalyzerResult({
      id: "keyword",
      label: "Keyword",
      category: "keyword",
      checks,
    });
  },
};
