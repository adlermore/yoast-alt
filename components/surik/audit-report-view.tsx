import { AlertTriangle, ChevronDown, Info } from "lucide-react";
import type {
  AuditIssue,
  AuditReport,
  AuditSeverity,
  Calibration,
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/scores/score-ring";
import { cn } from "@/lib/utils";

const GRADE_LABEL: Record<AuditReport["grade"], string> = {
  excellent: "Excellent",
  good: "Good",
  ok: "Needs work",
  poor: "Poor",
  bad: "Critical",
};

const SEVERITY_CLASS: Record<AuditSeverity, string> = {
  critical: "border-danger/30 bg-danger/10 text-danger",
  warning: "border-warning/30 bg-warning/10 text-warning",
  notice: "border-border bg-muted text-muted-foreground",
};

const CALIBRATION_CLASS: Record<Calibration, string> = {
  CONFIRMED: "border-danger/30 text-danger",
  POSSIBLE: "border-warning/30 text-warning",
  CHECK: "border-border text-muted-foreground",
};

const PAGES_SHOWN = 300;

function IssueRow({ issue }: { issue: AuditIssue }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-3 outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring">
        <span
          className={cn(
            "shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
            SEVERITY_CLASS[issue.severity],
          )}
        >
          {issue.severity}
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-sm font-medium">{issue.title}</span>
          <span className="block truncate text-xs text-muted-foreground">{issue.detail}</span>
        </span>
        <Badge variant="outline" className={cn("shrink-0", CALIBRATION_CLASS[issue.calibration])}>
          {issue.calibration}
        </Badge>
        <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums">
          {issue.count}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <ul className="max-h-72 overflow-auto border-t bg-muted/30 p-3 text-xs">
        {issue.items.map((item, index) => (
          <li key={index} className="break-words py-0.5 font-mono text-muted-foreground">
            {item}
          </li>
        ))}
        {issue.count > issue.items.length ? (
          <li className="py-0.5 italic">
            …and {issue.count - issue.items.length} more
          </li>
        ) : null}
      </ul>
    </details>
  );
}

export function AuditReportView({ report }: { report: AuditReport }) {
  const limitHit = report.limits.maxPagesHit || report.limits.depthLimitHit;
  const shownPages = report.pages.slice(0, PAGES_SHOWN);
  const maxDepthCount = Math.max(1, ...report.depthDistribution.map((d) => d.count));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <ScoreRing score={report.score} />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Site health</p>
              <p className="text-xl font-semibold tracking-tight">{GRADE_LABEL[report.grade]}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline">{report.crawledPages} crawled pages</Badge>
              <Badge variant="outline">{report.indexablePages} indexable</Badge>
              <Badge variant="outline">{report.issues.length} issue types</Badge>
            </div>
          </div>
        </div>
      </Card>

      {limitHit ? (
        <Card className="flex items-start gap-3 border-warning/40 bg-warning/10 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
          <p className="text-sm text-muted-foreground">
            Crawl limit reached ({report.limits.maxPagesHit ? "max pages" : "max depth"}). Some
            pages were not crawled, so structural findings (orphans, depth) may be incomplete.
          </p>
        </Card>
      ) : null}

      {report.robotsNote ? (
        <Card className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{report.robotsNote}</p>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">
          Issues <span className="text-muted-foreground">({report.issues.length})</span>
        </h3>
        {report.issues.length > 0 ? (
          <div className="divide-y rounded-lg border">
            {report.issues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-success">
            No issues detected across the crawled pages.
          </p>
        )}
      </section>

      {report.depthDistribution.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Crawl depth</h3>
          <Card className="space-y-2 p-4">
            {report.depthDistribution.map((d) => (
              <div key={d.depth} className="flex items-center gap-3 text-sm">
                <span className="w-16 shrink-0 text-muted-foreground">
                  {d.depth === 0 ? "Home" : `${d.depth} click${d.depth > 1 ? "s" : ""}`}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded bg-muted">
                  <div
                    className="h-full rounded bg-primary"
                    style={{ width: `${Math.round((d.count / maxDepthCount) * 100)}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right tabular-nums">{d.count}</span>
              </div>
            ))}
          </Card>
        </section>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">
          All pages <span className="text-muted-foreground">({report.pages.length})</span>
        </h3>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-2 font-medium">URL</th>
                <th className="p-2 font-medium">Status</th>
                <th className="p-2 font-medium">Depth</th>
                <th className="p-2 font-medium">In</th>
                <th className="p-2 font-medium">Out</th>
                <th className="p-2 font-medium">Words</th>
                <th className="p-2 font-medium">Indexable</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {shownPages.map((page) => (
                <tr key={page.url} className="hover:bg-muted/30">
                  <td className="max-w-[420px] truncate p-2 font-mono text-xs" title={page.url}>
                    {page.redirectTo ? `${page.url} → ${page.redirectTo}` : page.url}
                  </td>
                  <td className="p-2 tabular-nums">{page.status || "—"}</td>
                  <td className="p-2 tabular-nums">{page.depth < 0 ? "sitemap" : page.depth}</td>
                  <td className="p-2 tabular-nums">{page.inlinks}</td>
                  <td className="p-2 tabular-nums">{page.outlinks}</td>
                  <td className="p-2 tabular-nums">{page.wordCount || "—"}</td>
                  <td className="p-2">
                    <span
                      className={cn(
                        "inline-block size-2 rounded-full",
                        page.indexable ? "bg-success" : "bg-muted-foreground/40",
                      )}
                      aria-label={page.indexable ? "Indexable" : "Not indexable"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {report.pages.length > PAGES_SHOWN ? (
          <p className="text-xs text-muted-foreground">
            Showing the first {PAGES_SHOWN} of {report.pages.length} pages.
          </p>
        ) : null}
      </section>
    </div>
  );
}
