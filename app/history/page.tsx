import type { Metadata } from "next";
import Link from "next/link";
import { History } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/scores/score-ring";
import { listReports } from "@/services/reports";
import { formatDate, prettyUrl } from "@/lib/format";

export const metadata: Metadata = {
  title: "History",
  description: "Reopen previous analyses.",
};

export const dynamic = "force-dynamic";

const SOURCE_LABEL = { html: "HTML", url: "URL", text: "Text" } as const;

export default async function HistoryPage() {
  const reports = await listReports();

  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="History"
          helpKey="history"
          description="Every saved analysis in chronological order. Stored as JSON files — no database."
        />

        {reports.length === 0 ? (
          <EmptyState
            icon={History}
            title="Nothing here yet"
            description="Saved analyses will appear here, newest first."
            className="min-h-[360px]"
          />
        ) : (
          <Card className="divide-y p-0">
            {reports.map((report) => {
              const title =
                report.source === "url" ? prettyUrl(report.target) : report.target;
              return (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                >
                  <ScoreRing score={report.overall} size={44} strokeWidth={5} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {report.focusKeyword ? (
                      <Badge variant="secondary" className="hidden font-normal sm:inline-flex">
                        “{report.focusKeyword}”
                      </Badge>
                    ) : null}
                    <Badge variant="outline">{SOURCE_LABEL[report.source]}</Badge>
                  </div>
                </Link>
              );
            })}
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
