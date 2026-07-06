import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { AnalyzerWorkbench } from "@/components/analyzers";

export const metadata: Metadata = {
  title: "Analyze HTML",
  description: "Parse raw HTML and inspect its SEO-relevant structure.",
};

export default function AnalyzeHtmlPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="Analyze HTML"
          description="Paste raw HTML markup to run the full analyzer suite and inspect its SEO-relevant structure. No crawling — parsing only."
        />
        <AnalyzerWorkbench
          mode="html"
          view="full"
          showKeyword
          inputTitle="Paste HTML"
          contentLabel="HTML source"
          placeholder={"<!doctype html>\n<html>…</html>"}
          emptyTitle="No analysis yet"
          emptyHint="Paste HTML on the left and run the analyzer to inspect its structure."
        />
      </div>
    </PageContainer>
  );
}
