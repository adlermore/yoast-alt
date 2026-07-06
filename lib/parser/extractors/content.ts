import type { CheerioAPI } from "cheerio";
import type { ContentStats } from "@/types";
import {
  countSentences,
  countWords,
  estimateReadingTime,
  normalizeWhitespace,
} from "@/lib/html";

export const EMPTY_CONTENT: ContentStats = {
  text: "",
  wordCount: 0,
  characterCount: 0,
  paragraphCount: 0,
  sentenceCount: 0,
  listCount: 0,
  tableCount: 0,
  readingTimeMinutes: 0,
};

/** Non-content elements stripped before measuring visible text. */
const NON_CONTENT_SELECTOR = "script, style, noscript, template, svg, iframe";

/** Compute visible-text statistics from `<body>` (or the document root). */
export function extractContent($: CheerioAPI): ContentStats {
  // Both branches are Cheerio<Element>; cheerio.load always injects html/body.
  const body = $("body");
  const scope = body.length > 0 ? body : $("html");

  const clone = scope.clone();
  clone.find(NON_CONTENT_SELECTOR).remove();
  const text = normalizeWhitespace(clone.text());
  const wordCount = countWords(text);

  return {
    text,
    wordCount,
    characterCount: text.length,
    paragraphCount: $("p").length,
    sentenceCount: countSentences(text),
    listCount: $("ul, ol").length,
    tableCount: $("table").length,
    readingTimeMinutes: estimateReadingTime(wordCount),
  };
}
