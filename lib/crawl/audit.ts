/**
 * Technical-audit report — pure, runs on a completed {@link CrawlResult}.
 *
 * Aggregates site-wide findings from crawl data (no extra network). Every
 * finding carries a calibration tag (CONFIRMED / POSSIBLE / CHECK) and a
 * severity, mirroring the Surik auditor so users don't mistake a best-practice
 * note for a real blocker.
 */

import type {
  AuditIssue,
  AuditPageRow,
  AuditReport,
  AuditSeverity,
  Calibration,
  CrawledPage,
  CrawlResult,
} from "@/types";
import { gradeFromScore } from "@/lib/scores";
import { sameSite } from "./normalize";

interface IssueSpec {
  id: string;
  title: string;
  severity: AuditSeverity;
  calibration: Calibration;
  detail: string;
  items: string[];
}

/** Group pages by a key, returning only groups with more than one member. */
function duplicates<T>(items: T[], key: (item: T) => string | null): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    if (!k) continue;
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(item);
  }
  return new Map([...groups].filter(([, group]) => group.length > 1));
}

const SEVERITY_PENALTY: Record<AuditSeverity, number> = {
  critical: 16,
  warning: 6,
  notice: 1.5,
};

export function buildAuditReport(result: CrawlResult): AuditReport {
  const pages = result.pages;
  const inlinkCount = (url: string): number => result.inbound[url]?.length ?? 0;

  // "Real" content pages: 200 HTML, not blocked, not redirecting.
  const contentPages = pages.filter(
    (p) => p.status === 200 && p.isHtml && !p.robotsBlocked && !p.redirectTo,
  );
  const isIndexable = (p: CrawledPage): boolean =>
    p.status === 200 && p.isHtml && !p.robotsBlocked && !p.redirectTo && !p.noindex;
  const indexablePages = contentPages.filter(isIndexable);

  const specs: IssueSpec[] = [];

  // --- Crawling / indexing ---
  const server5xx = pages.filter((p) => p.status >= 500);
  specs.push({
    id: "http-5xx",
    title: "Server errors (5xx)",
    severity: "critical",
    calibration: "CONFIRMED",
    detail: "Pages returning 5xx can't be crawled or indexed.",
    items: server5xx.map((p) => `${p.url} → HTTP ${p.status}`),
  });

  const brokenLinks: string[] = [];
  for (const p of pages) {
    if (p.status >= 400 && p.status < 600) {
      for (const source of result.inbound[p.url] ?? []) {
        brokenLinks.push(`${p.url} → HTTP ${p.status} (linked from ${source})`);
      }
    }
  }
  specs.push({
    id: "broken-links",
    title: "Broken internal links",
    severity: "critical",
    calibration: "CONFIRMED",
    detail: "Internal links pointing to pages that return 4xx/5xx.",
    items: brokenLinks,
  });

  const client4xx = pages.filter((p) => p.status >= 400 && p.status < 500);
  specs.push({
    id: "http-4xx",
    title: "Not-found / client errors (4xx)",
    severity: "warning",
    calibration: "CONFIRMED",
    detail: "URLs returning 4xx.",
    items: client4xx.map((p) => `${p.url} → HTTP ${p.status}`),
  });

  const noindex = contentPages.filter((p) => p.noindex);
  specs.push({
    id: "noindex",
    title: "Noindex pages",
    severity: "warning",
    calibration: "CONFIRMED",
    detail: "Pages with a robots noindex directive are excluded from search.",
    items: noindex.map((p) => p.url),
  });

  const redirects = pages.filter((p) => p.redirectTo);
  specs.push({
    id: "redirects",
    title: "Redirecting URLs",
    severity: "notice",
    calibration: "POSSIBLE",
    detail: "URLs that redirect — update internal links to point straight at the destination.",
    items: redirects.map((p) => `${p.url} → ${p.redirectTo}`),
  });

  // --- Canonicals ---
  const crossHostCanonical = contentPages.filter(
    (p) => p.canonical && !sameSite(p.canonical, result.baseUrl),
  );
  specs.push({
    id: "canonical-cross-host",
    title: "Cross-host canonical",
    severity: "warning",
    calibration: "POSSIBLE",
    detail: "Canonical points to a different host — can deindex the page if unintended.",
    items: crossHostCanonical.map((p) => `${p.url} → ${p.canonical}`),
  });
  const missingCanonical = contentPages.filter((p) => !p.canonical);
  specs.push({
    id: "canonical-missing",
    title: "Missing canonical",
    severity: "notice",
    calibration: "POSSIBLE",
    detail: "No canonical URL declared.",
    items: missingCanonical.map((p) => p.url),
  });

  // --- On-page ---
  const missingTitle = contentPages.filter((p) => !p.title);
  specs.push({
    id: "title-missing",
    title: "Missing title",
    severity: "warning",
    calibration: "POSSIBLE",
    detail: "Pages without a <title>.",
    items: missingTitle.map((p) => p.url),
  });
  const dupTitles = duplicates(contentPages, (p) => p.title);
  specs.push({
    id: "title-duplicate",
    title: "Duplicate titles",
    severity: "warning",
    calibration: "POSSIBLE",
    detail: "The same <title> is used on multiple pages.",
    items: [...dupTitles].map(([title, group]) => `“${title}” — ${group.length} pages`),
  });

  const missingDesc = contentPages.filter((p) => !p.description);
  specs.push({
    id: "description-missing",
    title: "Missing meta description",
    severity: "notice",
    calibration: "POSSIBLE",
    detail: "Pages without a meta description.",
    items: missingDesc.map((p) => p.url),
  });
  const dupDesc = duplicates(
    contentPages.filter((p) => p.description),
    (p) => p.description,
  );
  specs.push({
    id: "description-duplicate",
    title: "Duplicate meta descriptions",
    severity: "notice",
    calibration: "POSSIBLE",
    detail: "The same meta description is reused across pages.",
    items: [...dupDesc].map(([, group]) => `${group.length} pages share a description`),
  });

  const missingH1 = contentPages.filter((p) => p.h1Count === 0);
  specs.push({
    id: "h1-missing",
    title: "Missing H1",
    severity: "warning",
    calibration: "CHECK",
    detail: "Pages with no H1 heading.",
    items: missingH1.map((p) => p.url),
  });
  const multiH1 = contentPages.filter((p) => p.h1Count > 1);
  specs.push({
    id: "h1-multiple",
    title: "Multiple H1s",
    severity: "notice",
    calibration: "CHECK",
    detail: "Multiple H1 headings — verify the document outline.",
    items: multiH1.map((p) => `${p.url} (${p.h1Count} H1s)`),
  });

  const thin = contentPages.filter((p) => p.wordCount > 0 && p.wordCount < 100);
  specs.push({
    id: "thin-content",
    title: "Thin content",
    severity: "notice",
    calibration: "CHECK",
    detail: "Under 100 words of visible text — verify before acting.",
    items: thin.map((p) => `${p.url} (${p.wordCount} words)`),
  });

  const dupContent = duplicates(
    contentPages.filter((p) => p.contentHash),
    (p) => p.contentHash,
  );
  specs.push({
    id: "duplicate-content",
    title: "Duplicate content",
    severity: "warning",
    calibration: "CHECK",
    detail: "Pages with identical visible text (≥50 words).",
    items: [...dupContent].map(([, group]) => group.map((p) => p.url).join("  ≡  ")),
  });

  // --- Structure ---
  const orphanCandidates = contentPages.filter(
    (p) => p.url !== result.baseUrl && inlinkCount(p.url) === 0,
  );
  specs.push({
    id: "orphan-pages",
    title: "Orphan pages",
    severity: "warning",
    calibration: "POSSIBLE",
    detail: "Reachable 200 pages with zero inbound internal links.",
    items: orphanCandidates.map((p) => p.url),
  });

  const deepPages = contentPages.filter((p) => p.depth >= 4);
  specs.push({
    id: "deep-pages",
    title: "Deep pages (≥4 clicks)",
    severity: "notice",
    calibration: "CHECK",
    detail: "Pages four or more clicks from the homepage get less link equity.",
    items: deepPages.map((p) => `${p.url} (depth ${p.depth})`),
  });

  // Assemble non-empty issues, most severe first.
  const severityRank: Record<AuditSeverity, number> = { critical: 0, warning: 1, notice: 2 };
  const issues: AuditIssue[] = specs
    .filter((spec) => spec.items.length > 0)
    .map((spec) => ({ ...spec, count: spec.items.length, items: spec.items.slice(0, 2000) }))
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  // Transparent health score: start at 100, subtract a severity-weighted,
  // affected-fraction-scaled penalty per issue type.
  const denominator = Math.max(5, contentPages.length);
  let score = 100;
  for (const spec of specs) {
    if (spec.items.length === 0) continue;
    const fraction = Math.min(1, spec.items.length / denominator);
    score -= SEVERITY_PENALTY[spec.severity] * (0.35 + 0.65 * fraction);
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  const rows: AuditPageRow[] = pages
    .map((p) => ({
      url: p.url,
      status: p.status,
      depth: p.depth,
      title: p.title,
      wordCount: p.wordCount,
      inlinks: inlinkCount(p.url),
      outlinks: p.outlinks.length,
      indexable: isIndexable(p),
      redirectTo: p.redirectTo,
    }))
    .sort((a, b) => a.depth - b.depth || a.url.localeCompare(b.url));

  const depthCounts = new Map<number, number>();
  for (const p of pages) {
    if (p.depth < 0) continue;
    depthCounts.set(p.depth, (depthCounts.get(p.depth) ?? 0) + 1);
  }
  const depthDistribution = [...depthCounts]
    .sort((a, b) => a[0] - b[0])
    .map(([depth, count]) => ({ depth, count }));

  return {
    kind: "audit",
    baseUrl: result.baseUrl,
    score,
    grade: gradeFromScore(score),
    crawledPages: contentPages.length,
    indexablePages: indexablePages.length,
    issues,
    pages: rows,
    depthDistribution,
    robotsNote: result.robots.note,
    limits: result.limits,
  };
}
