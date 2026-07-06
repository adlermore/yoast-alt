import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout";
import { EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ReportCard } from "@/components/reports/report-card";
import { listReports } from "@/services/reports";

export const metadata: Metadata = {
  title: "Reports",
  description: "Browse saved analysis reports.",
};

// Reports are read from the filesystem, so this page must render dynamically.
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await listReports();

  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="Reports"
          helpKey="reports"
          description="Saved analyses, stored as JSON files on disk — no database. Open one to revisit its full report, or delete it."
        />

        {reports.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No saved reports yet"
            description="Run an analysis and choose “Save to Reports” to keep it here."
            className="min-h-[360px]"
          >
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/analyze/url">Analyze a URL</Link>
            </Button>
          </EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
