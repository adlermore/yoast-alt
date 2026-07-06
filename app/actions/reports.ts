"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import type {
  AnalysisOutcome,
  DocumentSource,
  ParsedDocument,
  Report,
  TextAnnotations,
} from "@/types";
import { deleteReport, saveReport } from "@/services/reports";

export interface SaveReportInput {
  source: DocumentSource;
  target: string;
  focusKeyword: string | null;
  document: ParsedDocument;
  analysis: AnalysisOutcome;
  annotations: TextAnnotations | null;
}

export type SaveReportResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

/** Persist an analysis as a reopenable report and refresh the library views. */
export async function saveReportAction(
  input: SaveReportInput,
): Promise<SaveReportResult> {
  try {
    const report: Report = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      input: {
        source: input.source,
        target: input.target,
        focusKeyword: input.focusKeyword,
      },
      scores: input.analysis.scores,
      results: input.analysis.results,
      document: input.document,
      annotations: input.annotations,
    };

    await saveReport(report);
    revalidatePath("/reports");
    revalidatePath("/history");
    return { ok: true, id: report.id };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save the report.",
    };
  }
}

export async function deleteReportAction(id: string): Promise<void> {
  await deleteReport(id);
  revalidatePath("/reports");
  revalidatePath("/history");
}
