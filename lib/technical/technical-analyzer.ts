import type {
  Analyzer,
  AnalysisContext,
  AnalyzerResult,
  Check,
  ParsedDocument,
} from "@/types";
import { buildAnalyzerResult } from "@/lib/scores";
import { checkDocumentTechnical, checkHttpTechnical } from "./checks";

/**
 * Technical SEO analyzer. Covers delivery and infrastructure concerns distinct
 * from the on-page SEO analyzer: mixed content, URL structure, semantic
 * landmarks, and — when the page was fetched by URL — HTTP status, response
 * headers, robots.txt, and sitemap presence.
 */
export const technicalAnalyzer: Analyzer = {
  id: "technical",
  label: "Technical",
  category: "technical",
  analyze(doc: ParsedDocument, context: AnalysisContext): AnalyzerResult {
    const checks: Check[] = [...checkDocumentTechnical(doc, context)];
    if (context.http) {
      checks.push(...checkHttpTechnical(context.http));
    }

    return buildAnalyzerResult({
      id: "technical",
      label: "Technical",
      category: "technical",
      checks,
    });
  },
};
