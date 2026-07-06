import { NextResponse } from "next/server";
import type { CrawlOptions, CrawlTool } from "@/types";
import { normalizeSeed, isBlockedHost } from "@/lib/crawl/normalize";
import { startCrawlJob } from "@/services/crawl/job-store";

const clamp = (value: number, min: number, max: number, fallback: number): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.url !== "string") {
    return NextResponse.json({ error: "A site URL is required." }, { status: 400 });
  }

  const normalized = normalizeSeed(body.url);
  if (!normalized) {
    return NextResponse.json(
      { error: "Enter a valid site URL, e.g. https://example.com." },
      { status: 400 },
    );
  }
  if (isBlockedHost(new URL(normalized).hostname)) {
    return NextResponse.json(
      { error: "That host is not allowed. Enter a public website URL." },
      { status: 400 },
    );
  }

  const tool: CrawlTool = body.tool === "audit" ? "audit" : "orphans";
  const options: CrawlOptions = {
    url: normalized,
    maxPages: clamp(body.maxPages, 1, 1000, 150),
    maxDepth: body.maxDepth === null || body.maxDepth === undefined
      ? null
      : clamp(body.maxDepth, 0, 20, 10),
    delayMs: clamp(body.delayMs, 0, 5000, 150),
    ignoreRobots: Boolean(body.ignoreRobots),
    analyze: tool === "audit",
  };

  const job = startCrawlJob(tool, options);
  return NextResponse.json({ jobId: job.id }, { status: 202 });
}
