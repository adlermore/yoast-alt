/**
 * Contracts for the crawl-based "Surik Tools" (Technical Auditor + Orphan Page
 * Detector). One crawl produces a {@link CrawlResult}; each tool derives its
 * own report from it.
 */

import type { ScoreGrade } from "./analysis";

export type CrawlTool = "orphans" | "audit";

export interface CrawlOptions {
  url: string;
  /** Safety cap on total pages fetched. */
  maxPages: number;
  /** Max click-depth for discovered links (null = unlimited). Seeds always fetched. */
  maxDepth: number | null;
  /** Politeness pause between requests, milliseconds. */
  delayMs: number;
  /** Skip robots.txt enforcement (only for sites we own). */
  ignoreRobots: boolean;
  /** Run per-page SEO analysis (the auditor needs it; the orphan detector does not). */
  analyze: boolean;
}

/** A single page reached during the crawl. */
export interface CrawledPage {
  /** Normalized final URL (after any redirects). */
  url: string;
  /** Normalized requested URL (differs from {@link url} on a cross-URL redirect). */
  requestedUrl: string;
  status: number;
  isHtml: boolean;
  contentType: string;
  /** Click depth from the homepage. 0 = home; -1 = sitemap-only (never reached by a link). */
  depth: number;
  /** Normalized destination when this URL cross-redirects; null otherwise. */
  redirectTo: string | null;
  robotsBlocked: boolean;
  inSitemap: boolean;
  title: string | null;
  description: string | null;
  h1: string | null;
  h1Count: number;
  wordCount: number;
  /** Content fingerprint of visible text (null when <50 words). */
  contentHash: string | null;
  noindex: boolean;
  canonical: string | null;
  /** Normalized same-site `<a href>` targets, deduped, self excluded. */
  outlinks: string[];
  error: string | null;
}

export interface RobotsInfo {
  fetched: boolean;
  status: number;
  /** True when robots.txt was unreadable and we defaulted to allow-all (see §10.1). */
  assumedAllowAll: boolean;
  note: string | null;
}

export interface CrawlLimits {
  maxPages: number;
  maxPagesHit: boolean;
  maxDepth: number | null;
  depthLimitHit: boolean;
}

export interface CrawlResult {
  baseUrl: string;
  host: string;
  pages: CrawledPage[];
  /** target URL -> source pages linking to it (built post-crawl, reachable sources only). */
  inbound: Record<string, string[]>;
  sitemapUrls: string[];
  discoveryUrls: string[];
  robots: RobotsInfo;
  limits: CrawlLimits;
}

export type CrawlPhase =
  | "starting"
  | "robots"
  | "sitemap"
  | "crawling"
  | "linking"
  | "analyzing"
  | "done";

export interface CrawlProgress {
  phase: CrawlPhase;
  fetched: number;
  queued: number;
  max: number;
  currentUrl: string | null;
}

export type CrawlJobStatus = "queued" | "running" | "done" | "cancelled" | "error";

export interface CrawlJob {
  id: string;
  tool: CrawlTool;
  options: CrawlOptions;
  status: CrawlJobStatus;
  progress: CrawlProgress;
  createdAt: string;
  result: OrphanReport | AuditReport | null;
  error: string | null;
}

/* ---------------------------------- Orphan detector ---------------------------------- */

export type OrphanClass = "orphan" | "js_dependent" | "never_crawled" | "linked";

export interface OrphanRow {
  url: string;
  httpStatus: number | null;
  inSitemap: boolean;
  inUrlList: boolean;
  crawled: boolean;
  inboundCount: number;
  rawInboundCount: number;
  jsOnlyInbound: boolean;
  classification: OrphanClass;
  note: string;
  /** Up to 25 linking pages. */
  sourcePages: string[];
}

export interface OrphanSummary {
  discoveryUrls: number;
  pagesFetched: number;
  pages200: number;
  orphans: number;
  jsDependent: number;
  neverCrawled: number;
  robotsBlocked: number;
  depthLimitHit: boolean;
  maxPagesHit: boolean;
}

export interface OrphanReport {
  kind: "orphans";
  baseUrl: string;
  summary: OrphanSummary;
  rows: OrphanRow[];
  robotsNote: string | null;
}

/* ---------------------------------- Technical auditor ---------------------------------- */

export type Calibration = "CONFIRMED" | "POSSIBLE" | "CHECK";
export type AuditSeverity = "critical" | "warning" | "notice";

export interface AuditIssue {
  id: string;
  title: string;
  severity: AuditSeverity;
  calibration: Calibration;
  detail: string;
  /** Affected findings, e.g. "https://a -> HTTP 404 (on https://page)". */
  items: string[];
  count: number;
}

export interface AuditPageRow {
  url: string;
  status: number;
  depth: number;
  title: string | null;
  wordCount: number;
  inlinks: number;
  outlinks: number;
  indexable: boolean;
  redirectTo: string | null;
}

export interface AuditReport {
  kind: "audit";
  baseUrl: string;
  score: number;
  grade: ScoreGrade;
  crawledPages: number;
  indexablePages: number;
  issues: AuditIssue[];
  pages: AuditPageRow[];
  depthDistribution: { depth: number; count: number }[];
  robotsNote: string | null;
  limits: CrawlLimits;
}
