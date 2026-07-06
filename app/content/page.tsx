import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { ContentEditor } from "@/components/content/content-editor";

export const metadata: Metadata = {
  title: "Content Editor",
  description: "Score content against your own readability standards in real time.",
};

export default function ContentEditorPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="Content Editor"
          description="Write or paste content and check it live against your own standards — total length, sentence length, passive voice, and reading ease — with a scorecard, marked-up text, and a fix list."
        />
        <ContentEditor />
      </div>
    </PageContainer>
  );
}
