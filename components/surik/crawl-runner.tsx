"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Play, Square } from "lucide-react";
import { toast } from "sonner";
import type { CrawlJob, CrawlTool } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { OrphanReportView } from "./orphan-report-view";
import { AuditReportView } from "./audit-report-view";

const PHASE_LABEL: Record<string, string> = {
  starting: "Starting…",
  robots: "Reading robots.txt…",
  sitemap: "Discovering sitemap…",
  crawling: "Crawling pages…",
  linking: "Building link map…",
  analyzing: "Analyzing…",
  done: "Done",
};

export function CrawlRunner({
  tool,
  defaultMaxPages,
}: {
  tool: CrawlTool;
  defaultMaxPages: number;
}) {
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(defaultMaxPages);
  const [ignoreRobots, setIgnoreRobots] = useState(false);
  const [job, setJob] = useState<CrawlJob | null>(null);
  const [starting, setStarting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const running = job?.status === "queued" || job?.status === "running";

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  const poll = async (id: string) => {
    try {
      const res = await fetch(`/api/surik/crawl/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("job lost");
      const next: CrawlJob = await res.json();
      setJob(next);
      if (next.status === "queued" || next.status === "running") {
        pollRef.current = setTimeout(() => poll(id), 1000);
      } else if (next.status === "error") {
        toast.error(next.error ?? "Crawl failed.");
      } else if (next.status === "done") {
        toast.success("Crawl complete.");
      } else if (next.status === "cancelled") {
        toast.message("Crawl cancelled — partial results shown.");
      }
    } catch {
      pollRef.current = setTimeout(() => poll(id), 1500);
    }
  };

  const start = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim() || running) return;
    setStarting(true);
    try {
      const res = await fetch("/api/surik/crawl", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tool, url, maxPages, ignoreRobots }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not start the crawl.");
        return;
      }
      poll(data.jobId);
    } catch {
      toast.error("Could not reach the crawler.");
    } finally {
      setStarting(false);
    }
  };

  const cancel = async () => {
    if (!job) return;
    await fetch(`/api/surik/crawl/${job.id}`, { method: "DELETE" }).catch(() => undefined);
  };

  const progress = job?.progress;
  const pct =
    progress && progress.max > 0
      ? Math.min(100, Math.round((progress.fetched / progress.max) * 100))
      : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={start} className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="crawl-url">Site URL</Label>
                <Input
                  id="crawl-url"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={running}
                />
              </div>
              <div className="w-full space-y-2 lg:w-36">
                <Label htmlFor="crawl-max">Max pages</Label>
                <Input
                  id="crawl-max"
                  type="number"
                  min={1}
                  max={1000}
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  disabled={running}
                />
              </div>
              <div className="flex gap-2">
                {running ? (
                  <Button type="button" variant="destructive" onClick={cancel} className="gap-2">
                    <Square className="size-4" />
                    Cancel
                  </Button>
                ) : (
                  <Button type="submit" disabled={starting || !url.trim()} className="gap-2">
                    {starting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Play className="size-4" />
                    )}
                    Start crawl
                  </Button>
                )}
              </div>
            </div>

            <label className="flex w-fit items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={ignoreRobots}
                onChange={(e) => setIgnoreRobots(e.target.checked)}
                disabled={running}
                className="size-4 accent-primary"
              />
              Ignore robots.txt (only for sites you own)
            </label>
          </form>

          {job && running ? (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  {PHASE_LABEL[progress?.phase ?? "starting"] ?? "Working…"}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {progress?.fetched ?? 0} / {progress?.max ?? maxPages} pages
                </span>
              </div>
              <Progress value={pct} className="h-2" />
              {progress?.currentUrl ? (
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {progress.currentUrl}
                </p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {job?.result?.kind === "orphans" ? (
        <OrphanReportView report={job.result} />
      ) : null}
      {job?.result?.kind === "audit" ? <AuditReportView report={job.result} /> : null}
    </div>
  );
}
