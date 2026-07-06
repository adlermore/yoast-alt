import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { AnalyzerWorkbench } from "@/components/analyzers";

export const metadata: Metadata = {
  title: "Readability",
  description: "Reading ease, sentence and paragraph length, passive voice, and transitions.",
};

export default function ReadabilityPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="Readability"
          helpKey="readability"
          description="Paste HTML to assess how easy the visible text is to read — Flesch reading ease, sentence and paragraph length, subheading distribution, passive voice, and transition words."
        />
        <AnalyzerWorkbench
          mode="html"
          view="readability"
          inputTitle="Paste HTML"
          contentLabel="HTML source"
          placeholder={"<!doctype html>\n<html>…</html>"}
          emptyTitle="No analysis yet"
          emptyHint="Paste HTML on the left to assess its readability."
        />
      </div>
    </PageContainer>
  );
}
