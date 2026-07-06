import type { CheerioAPI } from "cheerio";
import type { HeadingLevel, HeadingNode } from "@/types";
import { cleanAttr, elementText } from "../dom";

/** Extract h1–h6 in document order. */
export function extractHeadings($: CheerioAPI): HeadingNode[] {
  const headings: HeadingNode[] = [];

  $("h1, h2, h3, h4, h5, h6").each((index, el) => {
    const tag = el.tagName?.toLowerCase() ?? "";
    const level = Number(tag.slice(1)) as HeadingLevel;
    if (!Number.isInteger(level) || level < 1 || level > 6) return;

    const $el = $(el);
    headings.push({
      level,
      text: elementText($el),
      id: cleanAttr($el.attr("id")),
      order: index,
    });
  });

  return headings;
}
