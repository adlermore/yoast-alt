import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { GEO_THRESHOLDS } from "@/constants/thresholds";

/** Question-form detection for headings ("How …", "What …", or ends with "?"). */
const QUESTION_START =
  /^(how|what|why|when|where|which|who|can|should|does|do|is|are)\b/i;

function isQuestionHeading(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.endsWith("?") || QUESTION_START.test(trimmed);
}

/**
 * Passage-level citability heuristics — how easily an LLM can lift a
 * self-contained, quotable answer out of the page. Works in every input mode
 * since it only reads the parsed document.
 */
export function checkCitability(doc: ParsedDocument): Check[] {
  const checks: Check[] = [];
  const { wordCount, paragraphCount, listCount, tableCount } = doc.content;

  // --- Question-form headings ---
  const subheadings = doc.headings.filter((h) => h.level === 2 || h.level === 3);
  if (subheadings.length > 0) {
    const questions = subheadings.filter((h) => isQuestionHeading(h.text));
    if (questions.length > 0) {
      checks.push(
        createCheck({
          id: "geo-question-headings",
          title: "Question-form headings",
          status: "pass",
          detail: `${questions.length} of ${subheadings.length} H2/H3 headings are phrased as questions.`,
          weight: 1,
        }),
      );
    } else {
      checks.push(
        createCheck({
          id: "geo-question-headings",
          title: "Question-form headings",
          status: "warning",
          detail: `None of the ${subheadings.length} H2/H3 headings are phrased as questions.`,
          weight: 1,
          recommendation: {
            problem: "No subheading matches the question format users ask AI engines.",
            reason:
              "AI answers are assembled from passages that directly address a question; a heading like “How long does shipping take?” followed by a concise answer is the easiest passage to cite.",
            howToFix:
              "Rephrase the key H2/H3 headings as the questions your audience asks, and open each section with a direct one-or-two-sentence answer.",
            priority: "low",
            impact: "Medium — question-led sections are cited disproportionately often.",
          },
        }),
      );
    }
  }

  // --- Paragraph chunk size ---
  if (paragraphCount > 0 && wordCount >= 50) {
    const averageWords = Math.round(wordCount / paragraphCount);
    const limit = GEO_THRESHOLDS.paragraphWords;
    if (averageWords <= limit) {
      checks.push(
        createCheck({
          id: "geo-chunk-size",
          title: "Quotable paragraph size",
          status: "pass",
          detail: `Average paragraph length is ${averageWords} words (target ≤ ${limit}).`,
          weight: 2,
        }),
      );
    } else {
      checks.push(
        createCheck({
          id: "geo-chunk-size",
          title: "Quotable paragraph size",
          status: "warning",
          detail: `Average paragraph length is ${averageWords} words (target ≤ ${limit}).`,
          weight: 2,
          recommendation: {
            problem: "Paragraphs are too long to serve as self-contained passages.",
            reason:
              "AI engines quote at the passage level; a wall of text forces them to synthesize rather than cite, and competing pages with tighter paragraphs win the citation.",
            howToFix:
              "Split long paragraphs so each makes one point in roughly 40–100 words, front-loading the key fact.",
            priority: "medium",
            impact: "Medium — passage structure directly affects citability.",
          },
        }),
      );
    }
  }

  // --- Structured facts (lists / tables) ---
  if (wordCount >= GEO_THRESHOLDS.structuredFactsMinWords) {
    const structured = listCount + tableCount;
    if (structured > 0) {
      checks.push(
        createCheck({
          id: "geo-structured-facts",
          title: "Structured facts",
          status: "pass",
          detail: `Content includes ${listCount} list(s) and ${tableCount} table(s).`,
          weight: 1,
        }),
      );
    } else {
      checks.push(
        createCheck({
          id: "geo-structured-facts",
          title: "Structured facts",
          status: "warning",
          detail: "Long-form content with no lists or tables.",
          weight: 1,
          recommendation: {
            problem: "Facts are locked in prose with no list or table structure.",
            reason:
              "Steps, comparisons, specs, and prices presented as lists or tables are the easiest units for AI engines to extract and reproduce accurately.",
            howToFix:
              "Convert enumerable facts — steps, features, comparisons, pricing — into bulleted lists or small tables.",
            priority: "low",
            impact: "Low–Medium — structured facts are extracted more reliably.",
          },
        }),
      );
    }
  }

  // --- Date-stamped content ---
  const dated = doc.structuredData.some(
    (item) => item.raw.includes("datePublished") || item.raw.includes("dateModified"),
  );
  if (dated) {
    checks.push(
      createCheck({
        id: "geo-dated-content",
        title: "Date-stamped content",
        status: "pass",
        detail: "Structured data declares datePublished/dateModified.",
        weight: 1,
      }),
    );
  } else {
    checks.push(
      createCheck({
        id: "geo-dated-content",
        title: "Date-stamped content",
        status: "info",
        detail:
          "No datePublished/dateModified found in structured data — AI engines favor verifiably fresh sources.",
      }),
    );
  }

  return checks;
}
