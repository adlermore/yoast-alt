import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { AnalyzerWorkbench } from "@/components/analyzers";

export const metadata: Metadata = {
  title: "Analyze URL",
  description: "Fetch a live page and run the full analyzer suite over its HTML.",
};

export default function AnalyzeUrlPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="Analyze URL"
          helpKey="analyze-url"
          description="Fetch a live page over HTTP and run every analyzer, including response-level technical checks (status, headers, robots.txt, sitemap)."
        />
        <AnalyzerWorkbench
          mode="url"
          view="full"
          showKeyword
          inputTitle="Fetch a URL"
          contentLabel="Page URL"
          placeholder="https://example.com/page"
          emptyTitle="No analysis yet"
          emptyHint="Enter a public URL on the left to fetch and analyze the live page."
        />
      </div>
    </PageContainer>
  );
}
