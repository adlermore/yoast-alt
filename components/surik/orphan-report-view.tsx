import { AlertTriangle, ChevronDown, Info } from "lucide-react";
import type { OrphanReport, OrphanRow } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "danger" | "warning";
}) {
  return (
    <Card className="p-4">
      <p
        className={cn(
          "text-2xl font-semibold tabular-nums",
          tone === "danger" && "text-danger",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

function OrphanTable({ rows }: { rows: OrphanRow[] }) {
  return (
    <div className="divide-y rounded-lg border">
      {rows.map((row) => (
        <details key={row.url} className="group">
          <summary className="flex cursor-pointer list-none items-center gap-3 p-3 outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring">
            <span className="min-w-0 flex-1 truncate font-mono text-sm" title={row.url}>
              {row.url}
            </span>
            {row.httpStatus ? (
              <Badge variant="outline" className="shrink-0 tabular-nums">
                {row.httpStatus}
              </Badge>
            ) : null}
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-1 px-3 pb-3 pl-4 text-sm text-muted-foreground">
            <p>
              Inbound internal links: <span className="font-medium">{row.inboundCount}</span>
              {row.inSitemap ? " · in sitemap" : ""}
            </p>
            {row.classification === "orphan" ? (
              <p>No inbound internal links were found within the crawl scope — add links pointing to this page, or drop it from the sitemap if it&apos;s intentionally standalone.</p>
            ) : null}
            {row.note ? <p>{row.note}</p> : null}
          </div>
        </details>
      ))}
    </div>
  );
}

export function OrphanReportView({ report }: { report: OrphanReport }) {
  const { summary, rows, robotsNote } = report;
  const orphans = rows.filter((r) => r.classification === "orphan");
  const neverCrawled = rows.filter((r) => r.classification === "never_crawled");
  const limitHit = summary.maxPagesHit || summary.depthLimitHit;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Discovery URLs" value={summary.discoveryUrls} />
        <Stat label="Pages fetched" value={summary.pagesFetched} />
        <Stat label="200 OK HTML" value={summary.pages200} />
        <Stat label="Confirmed orphans" value={summary.orphans} tone="danger" />
        <Stat label="Never crawled" value={summary.neverCrawled} tone="warning" />
        <Stat label="Robots-blocked" value={summary.robotsBlocked} />
      </div>

      {limitHit ? (
        <Card className="flex items-start gap-3 border-warning/40 bg-warning/10 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
          <div className="text-sm">
            <p className="font-medium">Crawl limit reached — results may include false orphans.</p>
            <p className="text-muted-foreground">
              {summary.maxPagesHit ? "The max-pages cap was hit. " : ""}
              {summary.depthLimitHit ? "The depth limit was hit. " : ""}
              A page that links to a &quot;orphan&quot; may not have been crawled. Re-run with a higher limit to confirm.
            </p>
          </div>
        </Card>
      ) : null}

      {robotsNote ? (
        <Card className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{robotsNote}</p>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">
          Confirmed orphans{" "}
          <span className="text-muted-foreground">({orphans.length})</span>
        </h3>
        {orphans.length > 0 ? (
          <OrphanTable rows={orphans} />
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-success">
            No orphan pages found — every discovery URL has at least one inbound internal link.
          </p>
        )}
      </section>

      {neverCrawled.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            Sitemap URLs never crawled{" "}
            <span className="text-muted-foreground">({neverCrawled.length})</span>
          </h3>
          <OrphanTable rows={neverCrawled} />
        </section>
      ) : null}
    </div>
  );
}
