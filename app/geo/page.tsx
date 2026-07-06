import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { AnalyzerWorkbench } from "@/components/analyzers";

export const metadata: Metadata = {
  title: "GEO / AI Search",
  description:
    "AI crawler access, llms.txt, and passage-level citability for AI Overviews, ChatGPT, and Perplexity.",
};

export default function GeoPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="GEO / AI Search"
          helpKey="geo"
          description="Enter a URL to check whether AI platforms can crawl the site (robots.txt, llms.txt) and how citable the content is — question-led sections, quotable paragraphs, and structured facts."
        />
        <AnalyzerWorkbench
          mode="url"
          view="geo"
          inputTitle="Fetch a URL"
          contentLabel="Page URL"
          placeholder="https://example.com/page"
          emptyTitle="No analysis yet"
          emptyHint="Enter a public URL on the left to run GEO checks."
        />
      </div>
    </PageContainer>
  );
}
