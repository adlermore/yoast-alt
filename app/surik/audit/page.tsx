import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { CrawlRunner } from "@/components/surik/crawl-runner";

export const metadata: Metadata = {
  title: "Site Auditor",
  description: "Crawl-based technical SEO audit of a whole site.",
};

export default function SiteAuditorPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="Site Auditor"
          helpKey="surik-audit"
          description="Crawl a whole site like Googlebot (raw HTML, no JavaScript) and audit it against Google Search Central rules — broken links, redirects, canonicals, titles, duplicate content, orphans, crawl depth — with a calibrated health score."
        />
        <CrawlRunner tool="audit" defaultMaxPages={150} />
      </div>
    </PageContainer>
  );
}
