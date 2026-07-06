import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { splitSentences, truncate } from "@/lib/html";
import { READABILITY_THRESHOLDS } from "@/constants/thresholds";
import { hasTransition, isPassiveSentence } from "../detect";

/** Passive voice: flag when too large a share of sentences read as passive. */
export function checkPassiveVoice(doc: ParsedDocument): Check[] {
  if (doc.content.wordCount < READABILITY_THRESHOLDS.minWords) return [];
  const sentences = splitSentences(doc.content.text);
  if (sentences.length === 0) return [];

  const passive = sentences
    .map((sentence, index) => ({ sentence, index }))
    .filter((entry) => isPassiveSentence(entry.sentence));
  const ratio = passive.length / sentences.length;
  const pct = Math.round(ratio * 100);
  const detail = `${pct}% of sentences (${passive.length}/${sentences.length}) appear to use passive voice.`;

  if (ratio <= READABILITY_THRESHOLDS.passiveVoiceRatio) {
    return [
      createCheck({ id: "passive-voice", title: "Passive voice", status: "pass", detail, weight: 1 }),
    ];
  }

  const sample = passive.slice(0, 5);

  return [
    createCheck({
      id: "passive-voice",
      title: "Passive voice",
      status: "warning",
      detail,
      weight: 1,
      highlights: sample.map((entry) => truncate(entry.sentence, 120)),
      highlightSentences: sample.map((entry) => entry.index),
      recommendation: {
        problem: `Passive voice appears in ~${pct}% of sentences (aim for under ${Math.round(READABILITY_THRESHOLDS.passiveVoiceRatio * 100)}%).`,
        reason:
          "Passive constructions are wordier and less direct, weakening clarity and momentum.",
        howToFix:
          "Rewrite passive sentences in the active voice: put the actor before the verb.",
        priority: "low",
        impact: "Low–Medium — affects clarity and tone.",
      },
    }),
  ];
}

/** Transition words: reward connective tissue between ideas. */
export function checkTransitionWords(doc: ParsedDocument): Check[] {
  if (doc.content.wordCount < READABILITY_THRESHOLDS.minWords) return [];
  const sentences = splitSentences(doc.content.text);
  if (sentences.length === 0) return [];

  const withTransition = sentences.filter(hasTransition).length;
  const ratio = withTransition / sentences.length;
  const pct = Math.round(ratio * 100);
  const target = Math.round(READABILITY_THRESHOLDS.transitionWordRatio * 100);
  const detail = `${pct}% of sentences (${withTransition}/${sentences.length}) contain a transition word or phrase.`;

  if (ratio >= READABILITY_THRESHOLDS.transitionWordRatio) {
    return [
      createCheck({ id: "transition-words", title: "Transition words", status: "pass", detail, weight: 1 }),
    ];
  }

  return [
    createCheck({
      id: "transition-words",
      title: "Transition words",
      status: "warning",
      detail,
      weight: 1,
      recommendation: {
        problem: `Only ~${pct}% of sentences use transitions (aim for at least ${target}%).`,
        reason:
          "Transition words signal how ideas relate, making text flow and easier to follow.",
        howToFix:
          "Add connectives such as “however”, “for example”, “as a result”, and “in addition” where they fit.",
        priority: "low",
        impact: "Low — affects flow and readability scoring.",
      },
    }),
  ];
}
