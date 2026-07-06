import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { AnalyzerWorkbench } from "@/components/analyzers";

export const metadata: Metadata = {
  title: "Schema",
  description: "Detect and validate Schema.org structured data and required properties.",
};

export default function SchemaPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="Schema"
          helpKey="schema"
          description="Paste HTML to detect Schema.org structured data, verify it parses, and check recommended types and required properties for rich-result eligibility."
        />
        <AnalyzerWorkbench
          mode="html"
          view="schema"
          inputTitle="Paste HTML"
          contentLabel="HTML source"
          placeholder={"<!doctype html>\n<html>…</html>"}
          emptyTitle="No analysis yet"
          emptyHint="Paste HTML on the left to inspect its structured data."
        />
      </div>
    </PageContainer>
  );
}
