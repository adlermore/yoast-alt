import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { HtmlCleaner } from "@/components/cleaner/html-cleaner";

export const metadata: Metadata = {
  title: "HTML Cleaner",
  description: "Strip inline styles, classes, comments, and Word/Docs cruft from HTML.",
};

export default function HtmlCleanerPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="HTML Cleaner"
          helpKey="html-cleaner"
          description="Paste HTML from a CMS, Word, or Google Docs and strip the cruft — inline styles, classes, comments, empty tags, spans, and namespaced Word markup — into clean, publish-ready HTML."
        />
        <HtmlCleaner />
      </div>
    </PageContainer>
  );
}
