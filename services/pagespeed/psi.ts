/**
 * PageSpeed Insights client. The API key lives only here (server-side, from
 * PAGESPEED_API_KEY) and is never returned to the client.
 */

import "server-only";
import type { PsiStrategy, StrategyResult } from "@/types";
import { parsePsi, type PsiJson } from "@/lib/pagespeed/parse";

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const TIMEOUT_MS = 60_000;

export type PsiResult =
  | { ok: true; result: StrategyResult; fetchedUrl: string }
  | { ok: false; message: string };

export function hasPsiKey(): boolean {
  return Boolean(process.env.PAGESPEED_API_KEY);
}

export async function runPsi(url: string, strategy: PsiStrategy): Promise<PsiResult> {
  const params = new URLSearchParams({ url, strategy, category: "performance" });
  const key = process.env.PAGESPEED_API_KEY;
  if (key) params.set("key", key);

  let json: PsiJson;
  try {
    const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    json = (await res.json()) as PsiJson;
    if (json.error?.message) {
      return { ok: false, message: json.error.message };
    }
    if (!res.ok) {
      return { ok: false, message: `PageSpeed Insights returned HTTP ${res.status}.` };
    }
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "TimeoutError"
        ? "the request timed out"
        : "the request failed";
    return { ok: false, message: `Could not reach PageSpeed Insights — ${reason}.` };
  }

  const fetchedUrl = json.lighthouseResult?.finalUrl ?? url;
  return { ok: true, result: parsePsi(json, strategy), fetchedUrl };
}
