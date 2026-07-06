import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReportSummary } from "@/types";
import { formatDate, prettyUrl } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/scores/score-ring";
import { DeleteReportButton } from "./delete-report-button";

const SOURCE_LABEL: Record<ReportSummary["source"], string> = {
  html: "HTML",
  url: "URL",
  text: "Text",
};

/** Rich summary card for the Reports library. */
export function ReportCard({ report }: { report: ReportSummary }) {
  const title = report.source === "url" ? prettyUrl(report.target) : report.target;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-4">
        <ScoreRing score={report.overall} size={64} strokeWidth={7} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{SOURCE_LABEL[report.source]}</Badge>
            {report.focusKeyword ? (
              <Badge variant="secondary" className="font-normal">
                “{report.focusKeyword}”
              </Badge>
            ) : null}
          </div>
          <p className="truncate text-sm font-medium" title={report.target}>
            {title}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(report.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={`/reports/${report.id}`}>
            Open
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
        <DeleteReportButton id={report.id} label="" />
      </div>
    </Card>
  );
}
