import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { CrawlRunner } from "@/components/surik/crawl-runner";

export const metadata: Metadata = {
  title: "Orphan Pages",
  description: "Find pages with zero inbound internal links.",
};

export default function OrphanPagesPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="Orphan Page Detector"
          helpKey="surik-orphans"
          description="Seeds the crawl with every sitemap URL, then flags pages that have zero inbound internal links (real <a href> anchors from other 200-OK pages). Guarded against the usual false positives — robots/WAF quirks, redirects, normalization, and crawl-limit artifacts."
        />
        <CrawlRunner tool="orphans" defaultMaxPages={300} />
      </div>
    </PageContainer>
  );
}
