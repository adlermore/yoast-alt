/**
 * XLSX export of a technical audit — exceljs (the JS analog of the spec's
 * openpyxl). Four sheets: Summary, Issues (colour-coded by severity), Issue
 * items (every affected URL), and Pages.
 */

import "server-only";
import ExcelJS from "exceljs";
import type { AuditReport, AuditSeverity } from "@/types";

function solid(argb: string): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

const SEVERITY_FILL: Record<AuditSeverity, string> = {
  critical: "FFF6D6D9",
  warning: "FFFCE8C9",
  notice: "FFEDEDF0",
};

function scoreFill(score: number): string {
  if (score >= 75) return "FFD8EAD9";
  if (score >= 50) return "FFFCE8C9";
  return "FFF6D6D9";
}

export async function auditToXlsx(report: AuditReport, generatedAt: string): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Searchlight — Surik Tools";

  // --- Summary ---
  const summary = wb.addWorksheet("Summary");
  summary.columns = [{ width: 22 }, { width: 64 }];
  const heading = summary.addRow(["Technical SEO Audit"]);
  heading.font = { bold: true, size: 14 };
  summary.addRow([]);
  const rows: [string, string | number][] = [
    ["Site", report.baseUrl],
    ["Generated", generatedAt],
    ["Health score", `${report.score}/100 (${report.grade})`],
    ["Crawled pages", report.crawledPages],
    ["Indexable pages", report.indexablePages],
    ["Issue types", report.issues.length],
  ];
  if (report.limits.maxPagesHit || report.limits.depthLimitHit) {
    rows.push(["Crawl limit hit", report.limits.maxPagesHit ? "max pages" : "max depth"]);
  }
  if (report.robotsNote) rows.push(["Robots note", report.robotsNote]);
  for (const [label, value] of rows) {
    const row = summary.addRow([label, value]);
    row.getCell(1).font = { bold: true };
    if (label === "Health score") row.getCell(2).fill = solid(scoreFill(report.score));
  }

  // --- Issues ---
  const issues = wb.addWorksheet("Issues");
  issues.columns = [
    { header: "Severity", width: 12 },
    { header: "Calibration", width: 12 },
    { header: "Issue", width: 34 },
    { header: "Count", width: 8 },
    { header: "Detail", width: 72 },
  ];
  issues.getRow(1).font = { bold: true };
  for (const issue of report.issues) {
    const row = issues.addRow([
      issue.severity,
      issue.calibration,
      issue.title,
      issue.count,
      issue.detail,
    ]);
    row.getCell(1).fill = solid(SEVERITY_FILL[issue.severity]);
  }

  // --- Issue items (every affected URL) ---
  const items = wb.addWorksheet("Issue items");
  items.columns = [
    { header: "Issue", width: 34 },
    { header: "Item", width: 110 },
  ];
  items.getRow(1).font = { bold: true };
  for (const issue of report.issues) {
    for (const item of issue.items) items.addRow([issue.title, item]);
  }

  // --- Pages ---
  const pages = wb.addWorksheet("Pages");
  pages.columns = [
    { header: "URL", width: 70 },
    { header: "Status", width: 9 },
    { header: "Depth", width: 8 },
    { header: "Inlinks", width: 9 },
    { header: "Outlinks", width: 9 },
    { header: "Words", width: 8 },
    { header: "Indexable", width: 10 },
    { header: "Redirect to", width: 60 },
  ];
  pages.getRow(1).font = { bold: true };
  for (const p of report.pages) {
    pages.addRow([
      p.url,
      p.status || "",
      p.depth < 0 ? "sitemap" : p.depth,
      p.inlinks,
      p.outlinks,
      p.wordCount || "",
      p.indexable ? "yes" : "no",
      p.redirectTo ?? "",
    ]);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
}
