/**
 * In-memory crawl job store (the spec's local model — no database).
 *
 * A job runs the engine on a detached promise and streams progress into a
 * module-level map that poll requests read. Cancellation flips a stop flag the
 * engine checks between levels; partial results are kept. Survives across
 * requests within one running Node process (this is a local operator tool).
 */

import "server-only";
import { randomUUID } from "node:crypto";
import type { CrawlJob, CrawlOptions, CrawlTool } from "@/types";
import { crawlSite } from "./engine";
import { buildOrphanReport } from "@/lib/crawl/orphans";
import { buildAuditReport } from "@/lib/crawl/audit";

const jobs = new Map<string, CrawlJob>();
const stopFlags = new Map<string, boolean>();
const MAX_JOBS = 40;

function prune(): void {
  if (jobs.size <= MAX_JOBS) return;
  const finished = [...jobs.values()]
    .filter((job) => job.status !== "running" && job.status !== "queued")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  while (jobs.size > MAX_JOBS && finished.length > 0) {
    const oldest = finished.shift();
    if (oldest) {
      jobs.delete(oldest.id);
      stopFlags.delete(oldest.id);
    }
  }
}

async function runJob(job: CrawlJob): Promise<void> {
  job.status = "running";
  try {
    const result = await crawlSite(job.options, {
      onProgress: (progress) => {
        job.progress = { ...job.progress, ...progress };
      },
      shouldStop: () => stopFlags.get(job.id) === true,
    });

    // Build the tool-specific report even from partial data (cancelled runs).
    job.result =
      job.tool === "audit" ? buildAuditReport(result) : buildOrphanReport(result);
    job.status = stopFlags.get(job.id) ? "cancelled" : "done";
    job.progress = { ...job.progress, phase: "done", fetched: result.pages.length };
  } catch (error) {
    job.status = "error";
    job.error = error instanceof Error ? error.message : "Crawl failed.";
  }
}

export function startCrawlJob(tool: CrawlTool, options: CrawlOptions): CrawlJob {
  const id = randomUUID();
  const job: CrawlJob = {
    id,
    tool,
    options,
    status: "queued",
    progress: {
      phase: "starting",
      fetched: 0,
      queued: 0,
      max: options.maxPages,
      currentUrl: null,
    },
    createdAt: new Date().toISOString(),
    result: null,
    error: null,
  };
  jobs.set(id, job);
  stopFlags.set(id, false);
  prune();
  void runJob(job);
  return job;
}

export function getJob(id: string): CrawlJob | null {
  return jobs.get(id) ?? null;
}

export function cancelJob(id: string): void {
  if (jobs.has(id)) stopFlags.set(id, true);
}
