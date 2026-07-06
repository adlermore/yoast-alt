"use server";

import type { CleanOptions, CleanResult } from "@/types";
import { cleanHtml } from "@/lib/html-cleaner/clean";
import { HTML_TOO_LARGE_MESSAGE, MAX_HTML_CHARS } from "@/constants/limits";

export type CleanHtmlState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; result: CleanResult };

export async function cleanHtmlAction(input: {
  html: string;
  options: CleanOptions;
}): Promise<CleanHtmlState> {
  const html = input.html?.trim() ?? "";
  if (!html) return { status: "error", message: "Paste some HTML to clean." };
  if (html.length > MAX_HTML_CHARS) {
    return { status: "error", message: HTML_TOO_LARGE_MESSAGE };
  }
  try {
    return { status: "success", result: cleanHtml(input.html, input.options) };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not clean the HTML.",
    };
  }
}
