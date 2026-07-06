import { Construction } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout";
import { EmptyState } from "./empty-state";

/** Honest stub for routes whose feature is scheduled for a later increment. */
export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader title={title} description={description} />
        <EmptyState
          icon={Construction}
          title="Planned for a later increment"
          description="This feature is on the roadmap and will be delivered in a future step."
          className="min-h-[360px]"
        />
      </div>
    </PageContainer>
  );
}
