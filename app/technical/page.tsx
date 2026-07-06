import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { AnalyzerWorkbench } from "@/components/analyzers";

export const metadata: Metadata = {
  title: "Technical SEO",
  description: "Mixed content, URL structure, HTTP status, headers, robots.txt, and sitemap.",
};

export default function TechnicalPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="Technical SEO"
          description="Enter a URL to run response-level checks (status, headers, robots.txt, sitemap) alongside mixed-content and URL-structure analysis. JavaScript is not executed."
        />
        <AnalyzerWorkbench
          mode="url"
          view="technical"
          inputTitle="Fetch a URL"
          contentLabel="Page URL"
          placeholder="https://example.com/page"
          emptyTitle="No analysis yet"
          emptyHint="Enter a public URL on the left to run technical checks."
        />
      </div>
    </PageContainer>
  );
}
