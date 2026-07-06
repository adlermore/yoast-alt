/**
 * Orphan classification — pure, runs on a completed {@link CrawlResult}.
 *
 * Enforces the spec's guards: inbound (not outbound) links only; any anchor from
 * any reachable page disqualifies an orphan; self-links never count; inbound is
 * unioned across a discovery URL and its redirect target; the homepage is never
 * an orphan; and limit-hit warnings are surfaced (they can manufacture false
 * orphans). Only discovery-source URLs are classified.
 */

import type {
  CrawledPage,
  CrawlResult,
  OrphanClass,
  OrphanReport,
  OrphanRow,
} from "@/types";

const CLASS_ORDER: Record<OrphanClass, number> = {
  orphan: 0,
  never_crawled: 1,
  js_dependent: 2,
  linked: 3,
};

export function buildOrphanReport(result: CrawlResult): OrphanReport {
  const byUrl = new Map<string, CrawledPage>(result.pages.map((p) => [p.url, p]));
  const discoverySet = new Set(result.discoveryUrls);

  const rows: OrphanRow[] = [];
  let orphans = 0;
  let neverCrawled = 0;
  let robotsBlocked = 0;

  for (const url of result.discoveryUrls) {
    const page = byUrl.get(url);

    // Candidate forms: the URL itself and its redirect target (§9.8 redirect union).
    const forms = new Set<string>([url]);
    if (page?.redirectTo) forms.add(page.redirectTo);

    let crawledOk = false;
    let status: number | null = null;
    for (const form of forms) {
      const p = byUrl.get(form);
      if (!p) continue;
      if (status === null) status = p.status;
      if (p.status === 200 && p.isHtml && !p.robotsBlocked) crawledOk = true;
    }

    // Inbound union across forms, deduped by source, self excluded.
    const sources = new Set<string>();
    for (const form of forms) {
      for (const source of result.inbound[form] ?? []) sources.add(source);
    }
    sources.delete(url);
    const inboundCount = sources.size;

    const blocked = page?.robotsBlocked ?? false;
    if (blocked) robotsBlocked += 1;

    let classification: OrphanClass;
    let note = "";
    if (url === result.baseUrl) {
      classification = "linked"; // the homepage is a crawl root, never an orphan
    } else if (!crawledOk) {
      classification = "never_crawled";
      note = blocked
        ? "Blocked by robots.txt"
        : status !== null && status > 0
          ? `HTTP ${status}`
          : "Not reached / unreachable";
      neverCrawled += 1;
    } else if (inboundCount === 0) {
      classification = "orphan";
      note = "200 OK, zero inbound internal links";
      orphans += 1;
    } else {
      classification = "linked";
    }

    rows.push({
      url,
      httpStatus: status,
      inSitemap: discoverySet.has(url),
      inUrlList: false,
      crawled: crawledOk,
      inboundCount,
      rawInboundCount: inboundCount, // raw mode only (no JS rendering)
      jsOnlyInbound: false,
      classification,
      note,
      sourcePages: [...sources].slice(0, 25),
    });
  }

  rows.sort((a, b) => {
    const order = CLASS_ORDER[a.classification] - CLASS_ORDER[b.classification];
    return order !== 0 ? order : a.url.localeCompare(b.url);
  });

  const fetched = result.pages.filter((p) => p.status > 0 || p.robotsBlocked).length;
  const pages200 = result.pages.filter((p) => p.status === 200 && p.isHtml).length;

  return {
    kind: "orphans",
    baseUrl: result.baseUrl,
    summary: {
      discoveryUrls: result.discoveryUrls.length,
      pagesFetched: fetched,
      pages200,
      orphans,
      jsDependent: 0,
      neverCrawled,
      robotsBlocked,
      depthLimitHit: result.limits.depthLimitHit,
      maxPagesHit: result.limits.maxPagesHit,
    },
    rows,
    robotsNote: result.robots.note,
  };
}

/**
 * Self-check drill-down (§12): every crawled page that links to `target`.
 * Powers the "why is this an orphan?" action.
 */
export function inboundLinksTo(
  result: CrawlResult,
  target: string,
): { source: string; inRaw: boolean }[] {
  const sources = result.inbound[target] ?? [];
  return sources.map((source) => ({ source, inRaw: true }));
}
