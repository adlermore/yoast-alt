import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { PageSpeedRunner } from "@/components/pagespeed/pagespeed-runner";

export const metadata: Metadata = {
  title: "PageSpeed",
  description: "Core Web Vitals and performance via Google PageSpeed Insights.",
};

export default function PageSpeedPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="PageSpeed"
          helpKey="pagespeed"
          description="Measure Core Web Vitals and performance with Google PageSpeed Insights (Lighthouse + Chrome UX Report). Field data is the real-user ranking signal; lab data is diagnostic — the two are shown separately."
        />
        <PageSpeedRunner />
      </div>
    </PageContainer>
  );
}
