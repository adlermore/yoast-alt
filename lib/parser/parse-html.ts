/**
 * The parser orchestrator.
 *
 * Loads HTML once and runs every extractor. Each extractor is wrapped so that a
 * failure degrades to an empty result plus a warning — the parser never throws,
 * satisfying the "fail gracefully, never crash" requirement.
 */

import * as cheerio from "cheerio";
import type { DocumentSource, ParsedDocument } from "@/types";
import { byteLength } from "./dom";
import {
  EMPTY_CONTENT,
  EMPTY_META,
  EMPTY_OPEN_GRAPH,
  EMPTY_STRUCTURE,
  EMPTY_TWITTER,
  extractContent,
  extractHeadings,
  extractImages,
  extractLinks,
  extractMeta,
  extractOpenGraph,
  extractStructure,
  extractStructuredData,
  extractTwitter,
} from "./extractors";

export interface ParseHtmlOptions {
  /** Canonical source URL, recorded on the document. */
  url?: string;
  /** Base for resolving relative links/images. Defaults to `url`. */
  baseUrl?: string;
  source?: DocumentSource;
  /** Injected timestamp; keeps `parseHtml` deterministic and testable. */
  parsedAt?: string;
}

export function parseHtml(
  html: string,
  options: ParseHtmlOptions = {},
): ParsedDocument {
  const warnings: string[] = [];
  const source = options.source ?? "html";
  const baseUrl = options.baseUrl ?? options.url;
  const safeHtml = typeof html === "string" ? html : "";

  const $ = cheerio.load(safeHtml);

  const safely = <T>(label: string, fn: () => T, fallback: T): T => {
    try {
      return fn();
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      warnings.push(`Failed to extract ${label}: ${message}`);
      return fallback;
    }
  };

  return {
    url: options.url ?? null,
    source,
    meta: safely("meta", () => extractMeta($), EMPTY_META),
    openGraph: safely("Open Graph", () => extractOpenGraph($), EMPTY_OPEN_GRAPH),
    twitter: safely("Twitter cards", () => extractTwitter($), EMPTY_TWITTER),
    headings: safely("headings", () => extractHeadings($), []),
    images: safely("images", () => extractImages($, baseUrl), []),
    links: safely("links", () => extractLinks($, baseUrl), []),
    structuredData: safely(
      "structured data",
      () => extractStructuredData($),
      [],
    ),
    content: safely("content", () => extractContent($), EMPTY_CONTENT),
    structure: safely("structure", () => extractStructure($), EMPTY_STRUCTURE),
    html: { value: safeHtml, sizeBytes: byteLength(safeHtml) },
    parsedAt: options.parsedAt ?? "",
    warnings,
  };
}
