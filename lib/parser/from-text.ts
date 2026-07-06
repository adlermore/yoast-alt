/**
 * Build a {@link ParsedDocument} from raw article text.
 *
 * Plain text has no markup, so we wrap it in minimal, well-formed HTML (one
 * <p> per blank-line-separated block, plus an optional title/H1) and route it
 * through the same {@link parseHtml} pipeline. This keeps a single source of
 * truth for the document model — readability and keyword analysis then work
 * identically whether the input was HTML or text.
 */

import type { ParsedDocument } from "@/types";
import { escapeHtml } from "@/lib/html";
import { parseHtml } from "./parse-html";

export interface ParseTextOptions {
  title?: string;
  parsedAt?: string;
}

export function parseText(text: string, options: ParseTextOptions = {}): ParsedDocument {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, " ")}</p>`)
    .join("");

  const title = options.title?.trim();
  const head = title ? `<title>${escapeHtml(title)}</title>` : "";
  const h1 = title ? `<h1>${escapeHtml(title)}</h1>` : "";
  const bodyParagraphs = paragraphs || `<p>${escapeHtml(text.trim())}</p>`;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">${head}</head><body><main>${h1}${bodyParagraphs}</main></body></html>`;

  return parseHtml(html, { source: "text", parsedAt: options.parsedAt });
}
