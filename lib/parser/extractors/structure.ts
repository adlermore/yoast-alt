import type { CheerioAPI } from "cheerio";
import type { DocumentStructure } from "@/types";

export const EMPTY_STRUCTURE: DocumentStructure = {
  hasHeader: false,
  hasFooter: false,
  hasNav: false,
  hasMain: false,
  hasAside: false,
  hasBreadcrumbs: false,
  scriptCount: 0,
  noscriptCount: 0,
  formCount: 0,
  buttonCount: 0,
  iframeCount: 0,
};

function detectBreadcrumbs($: CheerioAPI): boolean {
  const bySelector =
    $(
      'nav.breadcrumb, nav.breadcrumbs, .breadcrumb, .breadcrumbs, ol.breadcrumb, [itemtype*="BreadcrumbList"]',
    ).length > 0;
  if (bySelector) return true;

  const byAria = $("nav[aria-label], [aria-label]")
    .toArray()
    .some((el) => /breadcrumb/i.test($(el).attr("aria-label") ?? ""));
  if (byAria) return true;

  return $('script[type="application/ld+json"]')
    .toArray()
    .some((el) => $(el).text().includes("BreadcrumbList"));
}

export function extractStructure($: CheerioAPI): DocumentStructure {
  return {
    hasHeader: $("header").length > 0,
    hasFooter: $("footer").length > 0,
    hasNav: $("nav").length > 0,
    hasMain: $("main").length > 0,
    hasAside: $("aside").length > 0,
    hasBreadcrumbs: detectBreadcrumbs($),
    scriptCount: $("script").length,
    noscriptCount: $("noscript").length,
    formCount: $("form").length,
    buttonCount: $(
      'button, input[type="button"], input[type="submit"], input[type="reset"]',
    ).length,
    iframeCount: $("iframe").length,
  };
}
