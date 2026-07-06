/**
 * Thin, safe wrappers over Cheerio used by the extractors. Keeping these here
 * means individual extractors stay declarative and never touch attribute
 * plumbing directly.
 */

import type { CheerioAPI } from "cheerio";
import { normalizeWhitespace } from "@/lib/html";

/** Trim an attribute value; treat empty/whitespace/undefined as absent. */
export function cleanAttr(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Normalized text of a selection (structurally typed to avoid node-type imports). */
export function elementText(node: { text(): string }): string {
  return normalizeWhitespace(node.text() ?? "");
}

/** First matching element's normalized text, or `null` when absent/empty. */
export function firstText($: CheerioAPI, selector: string): string | null {
  const el = $(selector).first();
  if (el.length === 0) return null;
  const text = elementText(el);
  return text.length > 0 ? text : null;
}

export function metaByName($: CheerioAPI, name: string): string | null {
  return cleanAttr($(`meta[name="${name}"]`).first().attr("content"));
}

export function metaByProperty($: CheerioAPI, property: string): string | null {
  return cleanAttr($(`meta[property="${property}"]`).first().attr("content"));
}

/** UTF-8 byte length — needed because HTML size is measured in bytes, not chars. */
export function byteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}
