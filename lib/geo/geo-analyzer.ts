/**
 * GEO (Generative Engine Optimization) analyzer.
 *
 * Assesses how visible and citable a page is to AI search platforms — Google
 * AI Overviews, ChatGPT Search, Perplexity, and assistant browsing. Two signal
 * families: access (can AI crawlers fetch the site — robots.txt, llms.txt;
 * URL mode only) and citability (can an LLM lift a self-contained answer out
 * of the content — works in every input mode).
 */

import type {
  AnalysisContext,
  Analyzer,
  AnalyzerResult,
  Check,
  ParsedDocument,
} from "@/types";
import { buildAnalyzerResult } from "@/lib/scores";
import { checkAiCrawlers, checkCitability, checkLlmsTxt } from "./checks";

const CHECK_MODULES: ReadonlyArray<
  (doc: ParsedDocument, context: AnalysisContext) => Check[]
> = [checkAiCrawlers, checkLlmsTxt, checkCitability];

export const geoAnalyzer: Analyzer = {
  id: "geo",
  label: "GEO / AI",
  category: "geo",
  analyze(doc: ParsedDocument, context: AnalysisContext): AnalyzerResult {
    const checks = CHECK_MODULES.flatMap((run) => run(doc, context));
    return buildAnalyzerResult({
      id: "geo",
      label: "GEO / AI",
      category: "geo",
      checks,
    });
  },
};
