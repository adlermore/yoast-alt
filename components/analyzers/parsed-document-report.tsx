import type { AnalysisOutcome, ParsedDocument, TextAnnotations } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreHeader } from "@/components/scores/score-header";
import { CheckList } from "./check-list";
import { AnnotatedText } from "./annotated-text";
import {
  ContentHeadingsSection,
  MediaLinksSection,
  MetaSocialSection,
  OverviewSection,
  SchemaSection,
} from "./sections";

const STRUCTURE_TABS = [
  { value: "overview", label: "Overview" },
  { value: "meta", label: "Meta & Social" },
  { value: "content", label: "Content" },
  { value: "media", label: "Media & Links" },
  { value: "schema", label: "Schema" },
] as const;

const TAB_TRIGGER_CLASS =
  "rounded-md border data-[state=active]:border-border data-[state=inactive]:border-transparent";

export interface ParsedDocumentReportProps {
  document: ParsedDocument;
  /** When provided, adds the score header and a prioritized SEO checks tab. */
  analysis?: AnalysisOutcome;
  /** When provided, adds a "Text" tab with inline problem highlighting. */
  annotations?: TextAnnotations | null;
}

/**
 * Presentational, side-effect-free report. Renders scored analysis (when
 * available) alongside the raw extracted document structure.
 */
export function ParsedDocumentReport({
  document,
  analysis,
  annotations,
}: ParsedDocumentReportProps) {
  const seoResult = analysis?.results.find((result) => result.category === "seo");
  const hasText = Boolean(annotations && annotations.segments.length > 0);

  return (
    <div className="space-y-6">
      {analysis ? <ScoreHeader analysis={analysis} /> : null}

      <Tabs
        defaultValue={seoResult ? "seo" : "overview"}
        className="w-full gap-6"
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {seoResult ? (
            <TabsTrigger value="seo" className={TAB_TRIGGER_CLASS}>
              SEO checks
            </TabsTrigger>
          ) : null}
          {hasText ? (
            <TabsTrigger value="text" className={TAB_TRIGGER_CLASS}>
              Text
            </TabsTrigger>
          ) : null}
          {STRUCTURE_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={TAB_TRIGGER_CLASS}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {seoResult ? (
          <TabsContent value="seo">
            <CheckList checks={seoResult.checks} />
          </TabsContent>
        ) : null}
        {hasText && annotations ? (
          <TabsContent value="text">
            <AnnotatedText annotations={annotations} />
          </TabsContent>
        ) : null}
        <TabsContent value="overview">
          <OverviewSection document={document} />
        </TabsContent>
        <TabsContent value="meta">
          <MetaSocialSection document={document} />
        </TabsContent>
        <TabsContent value="content">
          <ContentHeadingsSection document={document} />
        </TabsContent>
        <TabsContent value="media">
          <MediaLinksSection document={document} />
        </TabsContent>
        <TabsContent value="schema">
          <SchemaSection document={document} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
