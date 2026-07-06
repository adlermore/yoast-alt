import type { Analyzer, AnalyzerResult, Check, ParsedDocument } from "@/types";
import { buildAnalyzerResult } from "@/lib/scores";
import {
  checkContent,
  checkDescription,
  checkHeadings,
  checkImages,
  checkIndexability,
  checkLinks,
  checkPageMeta,
  checkSocial,
  checkStructuredData,
  checkTitle,
} from "./checks";

/** Ordered list of check modules composing the SEO analyzer. */
const CHECK_MODULES: ReadonlyArray<(doc: ParsedDocument) => Check[]> = [
  checkTitle,
  checkDescription,
  checkIndexability,
  checkHeadings,
  checkContent,
  checkPageMeta,
  checkSocial,
  checkStructuredData,
  checkImages,
  checkLinks,
];

/**
 * Structural on-page SEO analyzer. Composes independent, pure check modules
 * into a single scored result. Focus-keyword analysis is intentionally handled
 * by the dedicated keyword analyzer to keep concerns separate.
 */
export const seoAnalyzer: Analyzer = {
  id: "seo",
  label: "SEO",
  category: "seo",
  analyze(doc: ParsedDocument): AnalyzerResult {
    const checks = CHECK_MODULES.flatMap((run) => run(doc));
    return buildAnalyzerResult({
      id: "seo",
      label: "SEO",
      category: "seo",
      checks,
    });
  },
};
