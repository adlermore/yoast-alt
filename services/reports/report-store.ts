/**
 * Report persistence. Reports are plain JSON files under `data/reports/` — no
 * database. The History list is derived by reading those files rather than
 * maintaining a separate index, which keeps the store simple and consistent.
 */

import "server-only";
import type { Report, ReportSummary } from "@/types";
import {
  dataPath,
  deleteFile,
  listFiles,
  readJsonFile,
  writeJsonFile,
} from "@/services/storage";

const REPORTS_DIR = "reports";

function reportFile(id: string): string {
  return dataPath(REPORTS_DIR, `${id}.json`);
}

function toSummary(report: Report): ReportSummary {
  return {
    id: report.id,
    createdAt: report.createdAt,
    source: report.input.source,
    target: report.input.target,
    focusKeyword: report.input.focusKeyword,
    overall: report.scores.overall,
  };
}

export async function saveReport(report: Report): Promise<void> {
  await writeJsonFile(reportFile(report.id), report);
}

export async function getReport(id: string): Promise<Report | null> {
  // Guard against path traversal from a route param.
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  return readJsonFile<Report | null>(reportFile(id), null);
}

export async function deleteReport(id: string): Promise<void> {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return;
  await deleteFile(reportFile(id));
}

/** All saved reports as lightweight summaries, newest first. */
export async function listReports(): Promise<ReportSummary[]> {
  const files = await listFiles(dataPath(REPORTS_DIR));
  const reports = await Promise.all(
    files.map((file) => readJsonFile<Report | null>(file, null)),
  );
  return reports
    .filter((report): report is Report => report !== null)
    .map(toSummary)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
