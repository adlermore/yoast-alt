import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";

/** Baseline document meta: viewport, charset, language, favicon. */
export function checkPageMeta(doc: ParsedDocument): Check[] {
  const { meta } = doc;

  return [
    createCheck({
      id: "viewport",
      title: "Responsive viewport",
      status: meta.viewport ? "pass" : "error",
      detail: meta.viewport
        ? "A responsive viewport meta tag is present."
        : "No viewport meta tag was found.",
      weight: 2,
      recommendation: meta.viewport
        ? undefined
        : {
            problem: "The page has no viewport meta tag.",
            reason:
              "Without it, mobile browsers render the page at desktop width, hurting mobile usability.",
            howToFix:
              'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to <head>.',
            priority: "high",
            impact: "High — mobile-first indexing makes this essential.",
          },
    }),
    createCheck({
      id: "charset",
      title: "Character encoding",
      status: meta.charset ? "pass" : "warning",
      detail: meta.charset
        ? `Charset declared as ${meta.charset}.`
        : "No character encoding was declared.",
      weight: 1,
      recommendation: meta.charset
        ? undefined
        : {
            problem: "No character encoding is declared.",
            reason:
              "A missing charset can cause garbled characters and inconsistent rendering.",
            howToFix: 'Add <meta charset="utf-8"> as the first element in <head>.',
            priority: "medium",
            impact: "Medium — affects rendering correctness.",
          },
    }),
    createCheck({
      id: "language",
      title: "Language attribute",
      status: meta.language ? "pass" : "warning",
      detail: meta.language
        ? `Document language is “${meta.language}”.`
        : "The <html> element has no lang attribute.",
      weight: 1,
      recommendation: meta.language
        ? undefined
        : {
            problem: "The <html> element has no lang attribute.",
            reason:
              "The lang attribute aids screen readers, translation, and regional targeting.",
            howToFix: 'Set the language on the root element, e.g. <html lang="en">.',
            priority: "low",
            impact: "Low–Medium — accessibility and internationalization.",
          },
    }),
    createCheck({
      id: "favicon",
      title: "Favicon",
      status: meta.favicon ? "pass" : "info",
      detail: meta.favicon
        ? "A favicon link is declared."
        : "No favicon link was found.",
      weight: 1,
    }),
  ];
}
