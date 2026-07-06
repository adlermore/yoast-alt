/**
 * The crawl engine — a concurrent, depth-aware BFS that embodies the accuracy
 * lessons from both Surik specs:
 *
 *  - one crawl, reusable result (no per-format re-crawl);
 *  - correct URL normalization + www/non-www unification (via lib/crawl);
 *  - robots.txt fetched with a real UA, unreadable = allow-all (§10.1);
 *  - cosmetic self-redirects are content, cross-URL redirects are 3xx entries;
 *  - /cdn-cgi/ links skipped;
 *  - every sitemap URL is fetched (so true orphans still get a status);
 *  - the inbound-link map is built ONLY after the crawl completes;
 *  - only reachable (200 HTML, not robots-blocked, not redirecting) sources
 *    credit inbound links; self-links never count.
 *
 * It knows nothing about HTTP serving — the job store drives it.
 */

import "server-only";
import type {
  CrawlOptions,
  CrawlProgress,
  CrawlResult,
  CrawledPage,
  RobotsInfo,
} from "@/types";
import { normalizeSeed, normalizeUrl, sameSite } from "@/lib/crawl/normalize";
import { allowAllRobots, parseRobots, type RobotsRules } from "@/lib/crawl/robots";
import { parseSitemapXml } from "@/lib/crawl/sitemap";
import { fetchCrawl, fetchText } from "./fetch";
import { extractPageData } from "./extract";

const CONCURRENCY = 5;
const MAX_SITEMAP_FETCHES = 50;

export interface CrawlHooks {
  onProgress?: (progress: Partial<CrawlProgress>) => void;
  shouldStop?: () => boolean;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Run `fn` over `items` with a bounded worker pool. */
async function runPool<T>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await fn(items[index]);
    }
  });
  await Promise.all(workers);
}

function blankPage(
  url: string,
  depth: number,
  inSitemap: boolean,
  overrides: Partial<CrawledPage> = {},
): CrawledPage {
  return {
    url,
    requestedUrl: url,
    status: 0,
    isHtml: false,
    contentType: "",
    depth,
    redirectTo: null,
    robotsBlocked: false,
    inSitemap,
    title: null,
    description: null,
    h1: null,
    h1Count: 0,
    wordCount: 0,
    contentHash: null,
    noindex: false,
    canonical: null,
    outlinks: [],
    error: null,
    ...overrides,
  };
}

async function discoverSitemapUrls(
  origin: string,
  base: string,
  robotsSitemaps: string[],
): Promise<string[]> {
  const queue = [...new Set([...robotsSitemaps, `${origin}/sitemap.xml`])]
    .map((sm) => normalizeUrl(sm) ?? sm);
  const seen = new Set<string>();
  const discovery = new Set<string>();
  let fetches = 0;

  while (queue.length > 0 && fetches < MAX_SITEMAP_FETCHES) {
    const sm = queue.shift();
    if (!sm || seen.has(sm)) continue;
    seen.add(sm);
    fetches += 1;

    const res = await fetchText(sm);
    if (res.text === null) continue;
    const parsed = parseSitemapXml(res.text);
    for (const child of parsed.sitemaps) {
      const c = normalizeUrl(child);
      if (c && !seen.has(c)) queue.push(c);
    }
    for (const url of parsed.urls) {
      const n = normalizeUrl(url);
      if (n && sameSite(n, base)) discovery.add(n);
    }
  }
  return [...discovery];
}

export async function crawlSite(
  options: CrawlOptions,
  hooks: CrawlHooks = {},
): Promise<CrawlResult> {
  const seed = normalizeSeed(options.url);
  if (!seed) throw new Error("Enter a valid site URL, e.g. https://example.com.");
  const base: string = seed;
  const { origin, hostname: host } = new URL(base);

  // 1. robots.txt (with the §10.1 fix: real UA; unreadable = allow-all).
  hooks.onProgress?.({ phase: "robots" });
  let robots: RobotsRules = allowAllRobots();
  let robotsInfo: RobotsInfo;
  if (options.ignoreRobots) {
    robotsInfo = { fetched: false, status: 0, assumedAllowAll: true, note: "robots.txt ignored by request." };
  } else {
    const res = await fetchText(`${origin}/robots.txt`);
    if (res.text !== null) {
      robots = parseRobots(res.text);
      robotsInfo = { fetched: true, status: res.status, assumedAllowAll: false, note: null };
    } else {
      robotsInfo = {
        fetched: false,
        status: res.status,
        assumedAllowAll: true,
        note: `robots.txt was unreadable (HTTP ${res.status || "error"}); assuming allow-all rather than blocking the crawl.`,
      };
    }
  }

  // 2. sitemap discovery.
  hooks.onProgress?.({ phase: "sitemap" });
  const discoveryUrls = await discoverSitemapUrls(origin, base, robots.sitemaps);
  const discoverySet = new Set(discoveryUrls);

  // 3. crawl.
  const pages = new Map<string, CrawledPage>();
  const visited = new Set<string>();
  let maxPagesHit = false;
  let depthLimitHit = false;

  const isAllowed = (url: string): boolean => {
    if (options.ignoreRobots) return true;
    const u = new URL(url);
    return robots.isAllowed(u.pathname + u.search);
  };

  /** Fetch + record one URL. Returns same-site targets to consider next. */
  async function processUrl(url: string, depth: number): Promise<string[]> {
    if (visited.has(url)) return [];
    if (pages.size >= options.maxPages) {
      maxPagesHit = true;
      return [];
    }
    visited.add(url);
    const inSitemap = discoverySet.has(url);

    if (!isAllowed(url)) {
      pages.set(url, blankPage(url, depth, inSitemap, { robotsBlocked: true }));
      return [];
    }

    if (options.delayMs > 0) await sleep(options.delayMs);
    hooks.onProgress?.({ phase: "crawling", fetched: pages.size + 1, currentUrl: url });

    const res = await fetchCrawl(url);
    const page = blankPage(url, depth, inSitemap, {
      requestedUrl: res.requestedUrl,
      status: res.status,
      isHtml: res.isHtml,
      contentType: res.contentType,
      redirectTo: res.redirectTo,
      error: res.error,
    });
    if (res.isHtml && res.body) {
      Object.assign(page, extractPageData(res.body, url, base));
    }
    pages.set(url, page);

    const targets: string[] = [];
    if (res.redirectTo && sameSite(res.redirectTo, base)) targets.push(res.redirectTo);
    targets.push(...page.outlinks);
    return targets;
  }

  // 3a. BFS from the homepage — establishes true click depth.
  hooks.onProgress?.({ phase: "crawling", max: options.maxPages, fetched: 0 });
  let frontier: Array<{ url: string; depth: number }> = [{ url: base, depth: 0 }];

  while (frontier.length > 0) {
    if (hooks.shouldStop?.()) break;
    const nextDepth = new Map<string, number>();

    await runPool(frontier, CONCURRENCY, async ({ url, depth }) => {
      if (hooks.shouldStop?.()) return;
      const targets = await processUrl(url, depth);
      for (const target of targets) {
        if (!visited.has(target) && !nextDepth.has(target)) {
          nextDepth.set(target, depth + 1);
        }
      }
    });

    if (pages.size >= options.maxPages) {
      maxPagesHit = true;
      break;
    }

    frontier = [];
    for (const [url, depth] of nextDepth) {
      if (visited.has(url)) continue;
      if (options.maxDepth !== null && depth > options.maxDepth) {
        depthLimitHit = true;
        continue;
      }
      frontier.push({ url, depth });
    }
  }

  // 3b. Fetch every sitemap URL not reached by a link (depth -1 = "sitemap only").
  // Their outlinks still feed the inbound map; they are not expanded further.
  if (!hooks.shouldStop?.()) {
    const remaining = discoveryUrls.filter((url) => !visited.has(url));
    await runPool(remaining, CONCURRENCY, async (url) => {
      if (hooks.shouldStop?.() || pages.size >= options.maxPages) {
        if (pages.size >= options.maxPages) maxPagesHit = true;
        return;
      }
      await processUrl(url, -1);
    });
  }

  // 4. Build the inbound-link map — only after the full crawl (§9.1).
  hooks.onProgress?.({ phase: "linking" });
  const inbound: Record<string, string[]> = {};
  for (const page of pages.values()) {
    const reachable =
      page.status === 200 && page.isHtml && !page.robotsBlocked && !page.redirectTo;
    if (!reachable) continue;
    for (const target of page.outlinks) {
      if (target === page.url) continue; // never credit self-links
      (inbound[target] ??= []).push(page.url);
    }
  }
  for (const target of Object.keys(inbound)) {
    inbound[target] = [...new Set(inbound[target])];
  }

  hooks.onProgress?.({ phase: "done", fetched: pages.size });

  return {
    baseUrl: base,
    host,
    pages: [...pages.values()],
    inbound,
    sitemapUrls: discoveryUrls,
    discoveryUrls,
    robots: robotsInfo,
    limits: {
      maxPages: options.maxPages,
      maxPagesHit,
      maxDepth: options.maxDepth,
      depthLimitHit,
    },
  };
}
