import type { AnalysisContext, Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";

/** Presence of /llms.txt — a Markdown site map addressed to AI assistants. */
export function checkLlmsTxt(
  _doc: ParsedDocument,
  context: AnalysisContext,
): Check[] {
  const http = context.http;

  if (!http) {
    return [
      createCheck({
        id: "geo-llms-txt",
        title: "llms.txt",
        status: "info",
        detail:
          "llms.txt lives at the site origin — analyze the page by URL to run this check.",
      }),
    ];
  }

  if (http.llmsTxtFound) {
    return [
      createCheck({
        id: "geo-llms-txt",
        title: "llms.txt",
        status: "pass",
        detail: "An /llms.txt file was found at the site origin.",
        weight: 1,
      }),
    ];
  }

  return [
    createCheck({
      id: "geo-llms-txt",
      title: "llms.txt",
      status: "warning",
      detail: "No /llms.txt file was found at the site origin.",
      weight: 1,
      recommendation: {
        problem: "The site does not publish an llms.txt file.",
        reason:
          "llms.txt is an emerging convention: a concise Markdown index at /llms.txt that tells AI assistants what the site covers and which pages matter, improving how they navigate and cite it.",
        howToFix:
          "Publish /llms.txt at the site root: a short Markdown file with the site name, a one-paragraph summary, and a linked list of the most important pages.",
        priority: "low",
        impact: "Low–Medium — improves AI assistant navigation and citation odds.",
      },
    }),
  ];
}
