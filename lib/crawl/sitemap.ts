/**
 * Pure XML sitemap parsing. Distinguishes a <sitemapindex> (whose <loc>s are
 * child sitemaps to recurse into) from a <urlset> (whose <loc>s are pages).
 * Index recursion and gzip decompression are handled by the fetch layer.
 */

export interface SitemapParse {
  /** Page URLs (from a <urlset>). */
  urls: string[];
  /** Child sitemap URLs (from a <sitemapindex>). */
  sitemaps: string[];
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'");
}

export function parseSitemapXml(xml: string): SitemapParse {
  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  const locs = [...xml.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi)]
    .map((match) => decodeXmlEntities(match[1].trim()))
    .filter(Boolean);

  return isIndex ? { urls: [], sitemaps: locs } : { urls: locs, sitemaps: [] };
}
