import type { CheerioAPI } from "cheerio";
import type { OpenGraphData } from "@/types";
import { cleanAttr } from "../dom";

export const EMPTY_OPEN_GRAPH: OpenGraphData = {
  title: null,
  description: null,
  image: null,
  url: null,
  type: null,
  siteName: null,
  locale: null,
  raw: {},
};

export function extractOpenGraph($: CheerioAPI): OpenGraphData {
  const raw: Record<string, string> = {};

  $('meta[property^="og:"]').each((_, el) => {
    const property = cleanAttr($(el).attr("property"));
    const content = cleanAttr($(el).attr("content"));
    if (property && content) raw[property.toLowerCase()] = content;
  });

  return {
    title: raw["og:title"] ?? null,
    description: raw["og:description"] ?? null,
    image: raw["og:image"] ?? raw["og:image:url"] ?? null,
    url: raw["og:url"] ?? null,
    type: raw["og:type"] ?? null,
    siteName: raw["og:site_name"] ?? null,
    locale: raw["og:locale"] ?? null,
    raw,
  };
}
