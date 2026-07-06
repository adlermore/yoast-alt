import type { Analyzer, AnalyzerResult, ParsedDocument } from "@/types";
import { buildAnalyzerResult } from "@/lib/scores";
import { runSchemaChecks } from "./checks";

/**
 * Structured-data analyzer. Detects Schema.org markup, verifies it parses, and
 * checks recommended types and required properties for rich-result eligibility.
 */
export const schemaAnalyzer: Analyzer = {
  id: "schema",
  label: "Schema",
  category: "schema",
  analyze(doc: ParsedDocument): AnalyzerResult {
    return buildAnalyzerResult({
      id: "schema",
      label: "Schema",
      category: "schema",
      checks: runSchemaChecks(doc),
    });
  },
};
