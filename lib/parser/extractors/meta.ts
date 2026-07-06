import type { CheerioAPI } from "cheerio";
import type { DocumentMeta } from "@/types";
import { cleanAttr, firstText, metaByName } from "../dom";

export const EMPTY_META: DocumentMeta = {
  title: null,
  titleLength: 0,
  description: null,
  descriptionLength: 0,
  canonical: null,
  robots: null,
  viewport: null,
  charset: null,
  language: null,
  favicon: null,
  author: null,
  keywords: null,
  themeColor: null,
};

function detectCharset($: CheerioAPI): string | null {
  const direct = cleanAttr($("meta[charset]").first().attr("charset"));
  if (direct) return direct.toLowerCase();
  const httpEquiv = $('meta[http-equiv="Content-Type"]').first().attr("content");
  if (httpEquiv) {
    const match = /charset=([^;]+)/i.exec(httpEquiv);
    if (match) return match[1].trim().toLowerCase();
  }
  return null;
}

function detectFavicon($: CheerioAPI): string | null {
  const link = $(
    'link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
  ).first();
  return cleanAttr(link.attr("href"));
}

/** Extract all `<head>`-derived metadata into a {@link DocumentMeta}. */
export function extractMeta($: CheerioAPI): DocumentMeta {
  const title = firstText($, "head title") ?? firstText($, "title");
  const description = metaByName($, "description");

  return {
    title,
    titleLength: title?.length ?? 0,
    description,
    descriptionLength: description?.length ?? 0,
    canonical: cleanAttr($('link[rel="canonical"]').first().attr("href")),
    robots: metaByName($, "robots"),
    viewport: metaByName($, "viewport"),
    charset: detectCharset($),
    language: cleanAttr($("html").attr("lang")),
    favicon: detectFavicon($),
    author: metaByName($, "author"),
    keywords: metaByName($, "keywords"),
    themeColor: metaByName($, "theme-color"),
  };
}
