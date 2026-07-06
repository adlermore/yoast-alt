"use server";

import { parseHtml, parseText } from "@/lib/parser";
import { runAnalysis } from "@/modules/analyzer";
import { annotateText } from "@/lib/readability";
import { fetchPage } from "@/services/fetch/fetch-page";
import { getSettings } from "@/services/settings";
import { HTML_TOO_LARGE_MESSAGE, MAX_HTML_CHARS } from "@/constants/limits";
import type {
  AnalysisContext,
  AnalysisOutcome,
  DocumentSource,
  ParsedDocument,
  TextAnnotations,
} from "@/types";

export type WorkbenchMode = "html" | "text" | "url";

/** Largest plain-text article we will analyze (well within a safe envelope). */
const MAX_TEXT_CHARS = 100_000;

export interface WorkbenchInput {
  mode: WorkbenchMode;
  /** HTML source, article text, or a URL depending on {@link WorkbenchMode}. */
  content: string;
  /** Optional title, used only in text mode. */
  title?: string;
  focusKeyword?: string;
}

export type WorkbenchState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "success";
      source: DocumentSource;
      /** Final URL, or a short human label for pasted input. */
      target: string;
      focusKeyword: string | null;
      document: ParsedDocument;
      analysis: AnalysisOutcome;
      /** Sentence-level text problems for inline highlighting. */
      annotations: TextAnnotations | null;
    };

/**
 * Drop the two large strings the client never reads — the source HTML and the
 * full extracted body text — before serializing back over the wire. Both are
 * used only server-side (parsing/scoring); shipping them would bloat the RSC
 * payload. All stats are retained.
 */
function toClientDocument(document: ParsedDocument): ParsedDocument {
  return {
    ...document,
    content: { ...document.content, text: "" },
    html: { ...document.html, value: "" },
  };
}

/**
 * Unified analysis entry point for every workbench page. Parses the input into a
 * {@link ParsedDocument}, runs the analyzer suite, and returns a client-safe
 * result. Never throws to the client.
 */
export async function analyzeWorkbench(
  input: WorkbenchInput,
): Promise<WorkbenchState> {
  const focusKeyword = input.focusKeyword?.trim() || undefined;
  const parsedAt = new Date().toISOString();

  try {
    let document: ParsedDocument;
    let context: AnalysisContext = { focusKeyword };
    let target: string;

    if (input.mode === "html") {
      const html = input.content?.trim() ?? "";
      if (!html) return { status: "error", message: "Paste some HTML to analyze." };
      if (html.length > MAX_HTML_CHARS) {
        return { status: "error", message: HTML_TOO_LARGE_MESSAGE };
      }
      document = parseHtml(html, { source: "html", parsedAt });
      target = "Pasted HTML";
    } else if (input.mode === "text") {
      const text = input.content?.trim() ?? "";
      if (!text) return { status: "error", message: "Paste some text to analyze." };
      if (text.length > MAX_TEXT_CHARS) {
        return {
          status: "error",
          message: "That text is too long to analyze — trim it to the article you want to inspect.",
        };
      }
      document = parseText(text, { title: input.title, parsedAt });
      target = input.title?.trim() || "Pasted text";
    } else {
      const result = await fetchPage(input.content ?? "");
      if (!result.ok) return { status: "error", message: result.message };
      const { html, http } = result.page;
      document = parseHtml(html, {
        source: "url",
        url: http.finalUrl,
        baseUrl: http.finalUrl,
        parsedAt,
      });
      context = { focusKeyword, url: http.finalUrl, baseUrl: http.finalUrl, http };
      target = http.finalUrl;
    }

    const settings = await getSettings();
    const analysis = runAnalysis(document, context, settings.analyzers);
    const annotations = document.content.text.trim()
      ? annotateText(document.content.text)
      : null;

    return {
      status: "success",
      source: document.source,
      target,
      focusKeyword: focusKeyword ?? null,
      document: toClientDocument(document),
      analysis,
      annotations,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Analysis failed.",
    };
  }
}
