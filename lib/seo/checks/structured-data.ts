import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";

/** Structured-data presence and JSON-LD validity (summary level). */
export function checkStructuredData(doc: ParsedDocument): Check[] {
  const items = doc.structuredData;

  if (items.length === 0) {
    return [
      createCheck({
        id: "structured-data",
        title: "Structured data",
        status: "warning",
        detail: "No structured data (JSON-LD or microdata) was detected.",
        weight: 1,
        recommendation: {
          problem: "The page has no structured data.",
          reason:
            "Schema.org markup unlocks rich results and helps search engines understand content.",
          howToFix:
            "Add relevant JSON-LD (e.g. Article, Product, FAQ) describing the page.",
          priority: "medium",
          impact: "Medium — enables rich results and better understanding.",
        },
      }),
    ];
  }

  const invalid = items.filter((item) => !item.valid);
  const checks: Check[] = [
    createCheck({
      id: "structured-data",
      title: "Structured data",
      status: "pass",
      detail: `Found ${items.length} structured-data block(s).`,
      weight: 1,
    }),
  ];

  checks.push(
    createCheck({
      id: "structured-data-valid",
      title: "Structured data validity",
      status: invalid.length === 0 ? "pass" : "error",
      detail:
        invalid.length === 0
          ? "All JSON-LD blocks parsed successfully."
          : `${invalid.length} structured-data block(s) failed to parse.`,
      weight: 2,
      highlights:
        invalid.length > 0
          ? invalid.map((item) => item.error ?? "Invalid JSON-LD")
          : undefined,
      recommendation:
        invalid.length === 0
          ? undefined
          : {
              problem: "One or more JSON-LD blocks contain invalid JSON.",
              reason:
                "Invalid structured data is ignored by search engines and yields no rich results.",
              howToFix:
                "Fix the JSON syntax errors and validate with a structured-data testing tool.",
              priority: "high",
              impact: "Medium–High — broken markup provides zero benefit.",
            },
    }),
  );

  return checks;
}
