import type { Check, ParsedDocument, StructuredDataItem } from "@/types";
import { createCheck } from "@/lib/scores";
import { RECOMMENDED_TYPES, TYPE_REQUIREMENTS } from "./requirements";

type Node = Record<string, unknown>;

/** Flatten JSON-LD data (arrays and @graph) into a list of typed nodes. */
function collectNodes(data: unknown, acc: Node[] = []): Node[] {
  if (Array.isArray(data)) {
    data.forEach((entry) => collectNodes(entry, acc));
  } else if (data && typeof data === "object") {
    const node = data as Node;
    const graph = node["@graph"];
    if (Array.isArray(graph)) graph.forEach((entry) => collectNodes(entry, acc));
    if ("@type" in node) acc.push(node);
  }
  return acc;
}

/** Normalize a node's `@type` (string or array) into a list of type names. */
function typeNames(node: Node): string[] {
  const type = node["@type"];
  if (typeof type === "string") return [type];
  if (Array.isArray(type)) return type.filter((t): t is string => typeof t === "string");
  return [];
}

function hasValue(node: Node, key: string): boolean {
  const value = node[key];
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

/** Whether any structured data is present at all. */
export function checkSchemaPresence(items: StructuredDataItem[]): Check[] {
  if (items.length > 0) {
    return [
      createCheck({
        id: "schema-present",
        title: "Structured data present",
        status: "pass",
        detail: `Found ${items.length} structured-data block(s).`,
        weight: 2,
      }),
    ];
  }
  return [
    createCheck({
      id: "schema-present",
      title: "Structured data present",
      status: "warning",
      detail: "No structured data (JSON-LD, microdata, or RDFa) was found.",
      weight: 2,
      recommendation: {
        problem: "The page has no structured data.",
        reason:
          "Schema.org markup makes pages eligible for rich results and clarifies entities to search engines.",
        howToFix:
          "Add JSON-LD markup describing the page (e.g. Article, Product, Organization, BreadcrumbList).",
        priority: "medium",
        impact: "Medium — unlocks rich-result eligibility.",
      },
    }),
  ];
}

/** Whether every block parses as valid structured data. */
export function checkSchemaValidity(items: StructuredDataItem[]): Check[] {
  if (items.length === 0) return [];
  const invalid = items.filter((item) => !item.valid);
  if (invalid.length === 0) {
    return [
      createCheck({
        id: "schema-valid",
        title: "Structured data validity",
        status: "pass",
        detail: "All structured-data blocks parsed successfully.",
        weight: 2,
      }),
    ];
  }
  return [
    createCheck({
      id: "schema-valid",
      title: "Structured data validity",
      status: "error",
      detail: `${invalid.length} of ${items.length} structured-data block(s) failed to parse.`,
      weight: 2,
      highlights: invalid.map(
        (item, index) => `Block ${index + 1} (${item.format}): ${item.error ?? "invalid"}`,
      ),
      recommendation: {
        problem: "One or more structured-data blocks contain invalid syntax.",
        reason: "Invalid markup is ignored by search engines, wasting the opportunity.",
        howToFix:
          "Fix the JSON syntax and validate with the Rich Results Test / Schema Markup Validator.",
        priority: "high",
        impact: "High — invalid markup provides no benefit.",
      },
    }),
  ];
}

/** Recommended types present + required properties for each detected type. */
export function checkSchemaTypes(items: StructuredDataItem[]): Check[] {
  if (items.length === 0) return [];
  const checks: Check[] = [];

  const nodes = items.flatMap((item) => (item.valid ? collectNodes(item.data) : []));
  const presentTypes = new Set(nodes.flatMap(typeNames));

  // Recommended type coverage.
  const missingRecommended = RECOMMENDED_TYPES.filter((type) => !presentTypes.has(type));
  checks.push(
    createCheck({
      id: "schema-recommended-types",
      title: "Recommended types",
      status: missingRecommended.length === 0 ? "pass" : "info",
      detail:
        missingRecommended.length === 0
          ? "Organization, WebSite, and BreadcrumbList markup are all present."
          : `Consider adding: ${missingRecommended.join(", ")}.`,
      weight: 1,
    }),
  );

  // Required-property completeness per detected type.
  const problems: string[] = [];
  for (const node of nodes) {
    for (const type of typeNames(node)) {
      const required = TYPE_REQUIREMENTS[type];
      if (!required) continue;
      const missing = required.filter((key) => !hasValue(node, key));
      if (missing.length > 0) {
        problems.push(`${type} is missing: ${missing.join(", ")}.`);
      }
    }
  }

  if (problems.length > 0) {
    checks.push(
      createCheck({
        id: "schema-required-props",
        title: "Required properties",
        status: "warning",
        detail: `${problems.length} structured-data type(s) are missing recommended properties.`,
        weight: 2,
        highlights: problems.slice(0, 8),
        recommendation: {
          problem: "Some structured-data types are missing recommended properties.",
          reason:
            "Incomplete markup can disqualify the page from the corresponding rich result.",
          howToFix:
            "Add the missing properties listed above so each type meets rich-result requirements.",
          priority: "medium",
          impact: "Medium — completeness affects rich-result eligibility.",
        },
      }),
    );
  } else if (nodes.some((node) => typeNames(node).some((t) => t in TYPE_REQUIREMENTS))) {
    checks.push(
      createCheck({
        id: "schema-required-props",
        title: "Required properties",
        status: "pass",
        detail: "Detected types include their recommended properties.",
        weight: 2,
      }),
    );
  }

  return checks;
}

/** Convenience: run every schema check over a document's structured data. */
export function runSchemaChecks(doc: ParsedDocument): Check[] {
  const items = doc.structuredData;
  return [
    ...checkSchemaPresence(items),
    ...checkSchemaValidity(items),
    ...checkSchemaTypes(items),
  ];
}
