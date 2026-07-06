import type { CheerioAPI } from "cheerio";
import type { TwitterCardData } from "@/types";
import { cleanAttr } from "../dom";

export const EMPTY_TWITTER: TwitterCardData = {
  card: null,
  title: null,
  description: null,
  image: null,
  site: null,
  creator: null,
  raw: {},
};

export function extractTwitter($: CheerioAPI): TwitterCardData {
  const raw: Record<string, string> = {};

  // Twitter tags appear under `name` (spec) but `property` is common in the wild.
  $('meta[name^="twitter:"], meta[property^="twitter:"]').each((_, el) => {
    const key = cleanAttr($(el).attr("name")) ?? cleanAttr($(el).attr("property"));
    const content = cleanAttr($(el).attr("content"));
    if (key && content) raw[key.toLowerCase()] = content;
  });

  return {
    card: raw["twitter:card"] ?? null,
    title: raw["twitter:title"] ?? null,
    description: raw["twitter:description"] ?? null,
    image: raw["twitter:image"] ?? raw["twitter:image:src"] ?? null,
    site: raw["twitter:site"] ?? null,
    creator: raw["twitter:creator"] ?? null,
    raw,
  };
}
