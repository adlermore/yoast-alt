import type { CheerioAPI } from "cheerio";
import type { LinkNode } from "@/types";
import { classifyLink, resolveUrl } from "@/lib/html";
import { cleanAttr, elementText } from "../dom";

export function extractLinks($: CheerioAPI, baseUrl?: string): LinkNode[] {
  const links: LinkNode[] = [];

  $("a[href]").each((_, el) => {
    const $el = $(el);
    const href = cleanAttr($el.attr("href"));
    if (href === null) return;

    const rel = cleanAttr($el.attr("rel"));
    const relTokens = rel ? rel.toLowerCase().split(/\s+/) : [];
    const kind = classifyLink(href, baseUrl);

    const text = elementText($el);
    const ariaLabel = cleanAttr($el.attr("aria-label"));
    const title = cleanAttr($el.attr("title"));
    const hasLabeledImage =
      $el.find("img").filter((_, img) => {
        const alt = cleanAttr($(img).attr("alt"));
        return alt !== null && alt.length > 0;
      }).length > 0;

    const resolvedHref =
      resolveUrl(href, baseUrl) ??
      (kind === "anchor" || kind === "mailto" || kind === "tel" ? href : null);

    links.push({
      href,
      resolvedHref,
      text,
      rel,
      target: cleanAttr($el.attr("target")),
      isInternal: kind === "internal",
      isExternal: kind === "external",
      isAnchor: kind === "anchor",
      isMailto: kind === "mailto",
      isTel: kind === "tel",
      isEmptyAnchor:
        text.length === 0 && !ariaLabel && !title && !hasLabeledImage,
      nofollow: relTokens.includes("nofollow"),
      sponsored: relTokens.includes("sponsored"),
      ugc: relTokens.includes("ugc"),
    });
  });

  return links;
}
