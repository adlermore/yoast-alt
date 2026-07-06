import type { Analyzer, AnalyzerResult, Check, ParsedDocument } from "@/types";
import { buildAnalyzerResult } from "@/lib/scores";
import {
  checkParagraphLength,
  checkPassiveVoice,
  checkReadingEase,
  checkSentenceLength,
  checkSubheadingDistribution,
  checkTransitionWords,
} from "./checks";

/** Ordered list of check modules composing the readability analyzer. */
const CHECK_MODULES: ReadonlyArray<(doc: ParsedDocument) => Check[]> = [
  checkReadingEase,
  checkSentenceLength,
  checkParagraphLength,
  checkSubheadingDistribution,
  checkPassiveVoice,
  checkTransitionWords,
];

/**
 * Readability analyzer. Assesses how easy the visible text is to read —
 * reading ease, sentence/paragraph length, subheading distribution, passive
 * voice, and transition words. Purely heuristic and English-oriented.
 */
export const readabilityAnalyzer: Analyzer = {
  id: "readability",
  label: "Readability",
  category: "readability",
  analyze(doc: ParsedDocument): AnalyzerResult {
    const checks = CHECK_MODULES.flatMap((run) => run(doc));
    return buildAnalyzerResult({
      id: "readability",
      label: "Readability",
      category: "readability",
      checks,
    });
  },
};
