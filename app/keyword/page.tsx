import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { AnalyzerWorkbench } from "@/components/analyzers";

export const metadata: Metadata = {
  title: "Keyword Analysis",
  description: "Track a focus keyword across title, headings, content, URL, and more.",
};

export default function KeywordPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="Keyword Analysis"
          helpKey="keyword"
          description="Paste HTML and a focus keyword to see how well the page targets it — placement across title, description, H1, intro, subheadings, URL, and image alt, plus body density."
        />
        <AnalyzerWorkbench
          mode="html"
          view="keyword"
          showKeyword
          keywordRequired
          inputTitle="Paste HTML"
          contentLabel="HTML source"
          placeholder={"<!doctype html>\n<html>…</html>"}
          emptyTitle="No analysis yet"
          emptyHint="Paste HTML and a focus keyword to see keyword targeting."
        />
      </div>
    </PageContainer>
  );
}
