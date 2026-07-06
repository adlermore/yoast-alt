/**
 * Markdown export of a technical audit — plain string, no dependencies.
 * Lists every affected URL per issue (made for handing to developers).
 */

import type { AuditReport, AuditSeverity } from "@/types";

const SEVERITY_ORDER: AuditSeverity[] = ["critical", "warning", "notice"];

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function auditToMarkdown(report: AuditReport, generatedAt: string): string {
  const lines: string[] = [];
  const host = hostOf(report.baseUrl);

  lines.push(`# Technical SEO Audit — ${host}`, "");
  lines.push(`- **Site:** ${report.baseUrl}`);
  lines.push(`- **Generated:** ${generatedAt}`);
  lines.push(`- **Health score:** ${report.score}/100 (${report.grade})`);
  lines.push(`- **Crawled pages:** ${report.crawledPages}`);
  lines.push(`- **Indexable pages:** ${report.indexablePages}`);
  lines.push(`- **Issue types found:** ${report.issues.length}`);
  if (report.limits.maxPagesHit || report.limits.depthLimitHit) {
    lines.push(
      `- ⚠️ **Crawl limit hit** (${report.limits.maxPagesHit ? "max pages" : "max depth"}) — some pages were not crawled; structural findings may be incomplete.`,
    );
  }
  if (report.robotsNote) lines.push(`- _${report.robotsNote}_`);
  lines.push("");

  for (const severity of SEVERITY_ORDER) {
    const group = report.issues.filter((i) => i.severity === severity);
    if (group.length === 0) continue;
    lines.push(`## ${severity[0].toUpperCase()}${severity.slice(1)}`, "");
    for (const issue of group) {
      lines.push(`### ${issue.title} — ${issue.count} (${issue.calibration})`);
      lines.push("", issue.detail, "");
      for (const item of issue.items) lines.push(`- ${item}`);
      if (issue.count > issue.items.length) {
        lines.push(`- …and ${issue.count - issue.items.length} more`);
      }
      lines.push("");
    }
  }

  lines.push("## All pages", "");
  lines.push("| URL | Status | Depth | In | Out | Words | Indexable |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const p of report.pages) {
    const url = p.redirectTo ? `${p.url} → ${p.redirectTo}` : p.url;
    const depth = p.depth < 0 ? "sitemap" : String(p.depth);
    lines.push(
      `| ${url} | ${p.status || "—"} | ${depth} | ${p.inlinks} | ${p.outlinks} | ${p.wordCount || "—"} | ${p.indexable ? "yes" : "no"} |`,
    );
  }
  lines.push("");

  return lines.join("\n");
}
