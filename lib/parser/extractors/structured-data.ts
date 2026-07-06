import type { CheerioAPI } from "cheerio";
import type { StructuredDataItem } from "@/types";
import { cleanAttr } from "../dom";

/** Recursively collect every `@type` from a parsed JSON-LD value (incl. `@graph`). */
function collectTypes(data: unknown): string[] {
  const types = new Set<string>();

  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      const typeValue = obj["@type"];
      if (typeof typeValue === "string") {
        types.add(typeValue);
      } else if (Array.isArray(typeValue)) {
        for (const value of typeValue) {
          if (typeof value === "string") types.add(value);
        }
      }
      const graph = obj["@graph"];
      if (Array.isArray(graph)) graph.forEach(visit);
    }
  };

  visit(data);
  return [...types];
}

/** Reduce an `itemtype` URL to its short type name (e.g. `.../Product` → `Product`). */
function shortenMicrodataType(itemtype: string): string[] {
  return itemtype
    .split(/\s+/)
    .map((entry) => entry.split(/[/#]/).filter(Boolean).pop() ?? entry)
    .filter((entry) => entry.length > 0);
}

/** Extract JSON-LD blocks (parsed + validated) and detect microdata item types. */
export function extractStructuredData($: CheerioAPI): StructuredDataItem[] {
  const items: StructuredDataItem[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text().trim();
    if (!raw) return;
    try {
      const data: unknown = JSON.parse(raw);
      items.push({
        types: collectTypes(data),
        format: "json-ld",
        raw,
        data,
        valid: true,
        error: null,
      });
    } catch (error) {
      items.push({
        types: [],
        format: "json-ld",
        raw,
        data: null,
        valid: false,
        error: error instanceof Error ? error.message : "Invalid JSON-LD",
      });
    }
  });

  $("[itemscope][itemtype]").each((_, el) => {
    const itemtype = cleanAttr($(el).attr("itemtype"));
    if (!itemtype) return;
    items.push({
      types: shortenMicrodataType(itemtype),
      format: "microdata",
      raw: itemtype,
      data: null,
      valid: true,
      error: null,
    });
  });

  return items;
}
