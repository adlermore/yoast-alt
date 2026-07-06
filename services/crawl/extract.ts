/**
 * Cheap per-page extraction from already-downloaded HTML — no extra network
 * (§Design-principle-3: nothing in the hot path may add round-trips). Pulls
 * exactly what the auditor and orphan detector need from one Cheerio parse.
 */

import "server-only";
import * as cheerio from "cheerio";
import { createHash } from "node:crypto";
import { countWords, normalizeWhitespace } from "@/lib/html";
import { normalizeUrl, resolveLink, sameSite } from "@/lib/crawl/normalize";

export interface PageData {
  title: string | null;
  description: string | null;
  h1: string | null;
  h1Count: number;
  wordCount: number;
  contentHash: string | null;
  noindex: boolean;
  canonical: string | null;
  outlinks: string[];
}

export function extractPageData(body: string, pageUrl: string, baseUrl: string): PageData {
  const $ = cheerio.load(body);

  const title = $("head title").first().text().trim() || null;
  const description = $('meta[name="description"]').attr("content")?.trim() || null;

  const h1s = $("h1");
  const h1 = h1s.first().text().trim() || null;

  const robotsMeta = ($('meta[name="robots"]').attr("content") ?? "").toLowerCase();
  const noindex = robotsMeta.includes("noindex");

  const canonicalRaw = $('link[rel="canonical"]').attr("href")?.trim();
  const canonical = canonicalRaw ? normalizeUrl(canonicalRaw, pageUrl) : null;

  const clone = $("body").clone();
  clone.find("script, style, noscript, template, svg, iframe").remove();
  const text = normalizeWhitespace(clone.text());
  const wordCount = countWords(text);
  const contentHash =
    wordCount >= 50 ? createHash("sha1").update(text).digest("hex") : null;

  const outlinks = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const target = resolveLink(href, pageUrl);
    if (target && target !== pageUrl && sameSite(target, baseUrl)) {
      outlinks.add(target);
    }
  });

  return {
    title,
    description,
    h1,
    h1Count: h1s.length,
    wordCount,
    contentHash,
    noindex,
    canonical,
    outlinks: [...outlinks],
  };
}
