"use server";

import type { PageSpeedReport, PsiStrategy, PsiStrategyInput } from "@/types";
import { isBlockedHost, normalizeSeed } from "@/lib/crawl/normalize";
import { hasPsiKey, runPsi } from "@/services/pagespeed/psi";

export type PageSpeedState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; report: PageSpeedReport };

export async function runPageSpeedAction(input: {
  url: string;
  strategy: PsiStrategyInput;
}): Promise<PageSpeedState> {
  const normalized = normalizeSeed(input.url);
  if (!normalized) {
    return { status: "error", message: "Enter a valid page URL, e.g. https://example.com/page." };
  }
  if (isBlockedHost(new URL(normalized).hostname)) {
    return { status: "error", message: "That host is not allowed. Enter a public page URL." };
  }
  if (!hasPsiKey()) {
    return {
      status: "error",
      message: "PageSpeed API key is not configured (set PAGESPEED_API_KEY).",
    };
  }

  const strategies: PsiStrategy[] =
    input.strategy === "both" ? ["mobile", "desktop"] : [input.strategy];

  // Run strategies concurrently — each Lighthouse run is independent.
  const settled = await Promise.all(strategies.map((s) => runPsi(normalized, s)));

  const ok = settled.filter((r): r is Extract<typeof r, { ok: true }> => r.ok);
  if (ok.length === 0) {
    const firstError = settled.find((r) => !r.ok);
    return {
      status: "error",
      message: firstError && !firstError.ok ? firstError.message : "PageSpeed analysis failed.",
    };
  }

  return {
    status: "success",
    report: {
      url: normalized,
      fetchedUrl: ok[0].fetchedUrl,
      strategies: ok.map((r) => r.result),
    },
  };
}
