import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ParsedDocumentReport } from "@/components/analyzers";
import { DeleteReportButton } from "@/components/reports/delete-report-button";
import { getReport } from "@/services/reports";
import { formatDate, prettyUrl } from "@/lib/format";

export const metadata: Metadata = { title: "Report" };

export const dynamic = "force-dynamic";

const SOURCE_LABEL = { html: "HTML", url: "URL", text: "Text" } as const;

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();

  const title =
    report.input.source === "url"
      ? prettyUrl(report.input.target)
      : report.input.target;

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="space-y-4">
          <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2">
            <Link href="/reports">
              <ArrowLeft className="size-4" />
              Back to Reports
            </Link>
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {SOURCE_LABEL[report.input.source]}
                </Badge>
                {report.input.focusKeyword ? (
                  <Badge variant="secondary" className="font-normal">
                    “{report.input.focusKeyword}”
                  </Badge>
                ) : null}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-balance">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Saved {formatDate(report.createdAt)}
              </p>
            </div>
            <DeleteReportButton id={report.id} redirectTo="/reports" />
          </div>
        </div>

        <ParsedDocumentReport
          document={report.document}
          analysis={{ results: report.results, scores: report.scores }}
          annotations={report.annotations}
        />
      </div>
    </PageContainer>
  );
}
