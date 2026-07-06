/**
 * PDF export of a technical audit — pdf-lib (pure JS, valid downloadable PDF).
 * A client-facing summary: score, headline stats, and the issue list. The full
 * URL-level data lives in the Markdown / XLSX exports.
 */

import "server-only";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import type { AuditReport, AuditSeverity } from "@/types";

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 48;

const COLORS = {
  text: rgb(0.11, 0.11, 0.13),
  muted: rgb(0.42, 0.42, 0.46),
  critical: rgb(0.78, 0.11, 0.13),
  warning: rgb(0.72, 0.45, 0.05),
  notice: rgb(0.45, 0.45, 0.5),
};

function severityColor(severity: AuditSeverity) {
  return severity === "critical"
    ? COLORS.critical
    : severity === "warning"
      ? COLORS.warning
      : COLORS.notice;
}

/** Replace glyphs the base Helvetica (WinAnsi) can't encode. */
function sanitize(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/→/g, "->")
    .replace(/≡/g, "==")
    .replace(/…/g, "...")
    .replace(/[–—]/g, "-")
    .replace(/•/g, "*")
    .replace(/[^\x00-\xFF]/g, "?");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = sanitize(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function auditToPdf(report: AuditReport, generatedAt: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const contentWidth = A4[0] - MARGIN * 2;

  let page: PDFPage = doc.addPage(A4);
  let y = A4[1] - MARGIN;

  const newPage = () => {
    page = doc.addPage(A4);
    y = A4[1] - MARGIN;
  };

  const write = (
    text: string,
    opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; indent?: number } = {},
  ) => {
    const size = opts.size ?? 10;
    const f = opts.font ?? font;
    const color = opts.color ?? COLORS.text;
    const indent = opts.indent ?? 0;
    for (const line of wrap(text, f, size, contentWidth - indent)) {
      if (y - (size + 4) < MARGIN) newPage();
      page.drawText(line, { x: MARGIN + indent, y: y - size, size, font: f, color });
      y -= size + 4;
    }
  };

  const gap = (h: number) => {
    if (y - h < MARGIN) newPage();
    else y -= h;
  };

  let host = report.baseUrl;
  try {
    host = new URL(report.baseUrl).hostname;
  } catch {
    /* keep baseUrl */
  }

  write("Technical SEO Audit", { size: 20, font: bold });
  write(host, { size: 11, color: COLORS.muted });
  write(`Generated ${generatedAt}`, { size: 9, color: COLORS.muted });
  gap(10);

  const scoreColor =
    report.score >= 75 ? rgb(0.2, 0.55, 0.28) : report.score >= 50 ? COLORS.warning : COLORS.critical;
  write(`Health score: ${report.score}/100 (${report.grade})`, { size: 14, font: bold, color: scoreColor });
  write(
    `Crawled ${report.crawledPages} pages  -  ${report.indexablePages} indexable  -  ${report.issues.length} issue types`,
    { size: 10, color: COLORS.muted },
  );
  if (report.limits.maxPagesHit || report.limits.depthLimitHit) {
    write(
      `! Crawl limit hit (${report.limits.maxPagesHit ? "max pages" : "max depth"}) - findings may be incomplete.`,
      { size: 9.5, color: COLORS.warning },
    );
  }
  gap(14);

  write("Issues", { size: 14, font: bold });
  gap(6);
  if (report.issues.length === 0) {
    write("No issues detected across the crawled pages.", { size: 10, color: COLORS.muted });
  }
  for (const issue of report.issues) {
    write(`[${issue.severity.toUpperCase()}] ${issue.title} - ${issue.count} (${issue.calibration})`, {
      size: 10.5,
      font: bold,
      color: severityColor(issue.severity),
    });
    write(issue.detail, { size: 9.5, color: COLORS.muted, indent: 12 });
    gap(6);
  }

  return doc.save();
}
