/**
 * Ergonomic factory for {@link Check} objects.
 *
 * Keeps analyzer code declarative: analyzers describe *what* they assert and let
 * this helper fill in defaults (weight, optional recommendation/highlights).
 */

import type { Check, CheckStatus, Recommendation } from "@/types";

export interface CheckInit {
  id: string;
  title: string;
  status: CheckStatus;
  detail: string;
  weight?: number;
  recommendation?: Recommendation;
  highlights?: string[];
  highlightSentences?: number[];
}

export function createCheck(init: CheckInit): Check {
  const check: Check = {
    id: init.id,
    title: init.title,
    status: init.status,
    detail: init.detail,
    weight: init.weight ?? 1,
  };
  if (init.recommendation) check.recommendation = init.recommendation;
  if (init.highlights && init.highlights.length > 0) {
    check.highlights = init.highlights;
    if (init.highlightSentences && init.highlightSentences.length > 0) {
      check.highlightSentences = init.highlightSentences;
    }
  }
  return check;
}
