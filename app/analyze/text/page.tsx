import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { AnalyzerWorkbench } from "@/components/analyzers";

export const metadata: Metadata = {
  title: "Analyze Text",
  description: "Assess the readability and keyword targeting of raw article text.",
};

export default function AnalyzeTextPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="Analyze Text"
          helpKey="analyze-text"
          description="Paste plain article text to assess readability and, optionally, focus-keyword targeting. No markup required."
        />
        <AnalyzerWorkbench
          mode="text"
          view={["readability", "keyword"]}
          showKeyword
          inputTitle="Paste text"
          contentLabel="Article text"
          placeholder="Paste your article or draft here…"
          emptyTitle="No analysis yet"
          emptyHint="Paste text on the left to assess its readability and keyword targeting."
        />
      </div>
    </PageContainer>
  );
}
