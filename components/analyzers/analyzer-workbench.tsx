"use client";

import { useState, useTransition } from "react";
import { BookmarkCheck, BookmarkPlus, Loader2, Play, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  analyzeWorkbench,
  type WorkbenchMode,
  type WorkbenchState,
} from "@/app/actions/analyze";
import { saveReportAction } from "@/app/actions/reports";
import type { AnalyzerCategory, DocumentSource } from "@/types";
import { prettyUrl } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SOURCE_LABEL: Record<DocumentSource, string> = {
  html: "HTML",
  url: "URL",
  text: "Text",
};
import { EmptyState } from "@/components/shared";
import { FadeIn } from "@/components/shared/fade-in";
import { ParsedDocumentReport } from "./parsed-document-report";
import { AnalyzerResultView } from "./analyzer-result";
import { AnnotatedText } from "./annotated-text";
import { TextFocusProvider } from "./text-focus";

export interface AnalyzerWorkbenchProps {
  mode: WorkbenchMode;
  /**
   * "full" renders the complete tabbed report; a category renders one analyzer;
   * an array of categories stacks those analyzers (skipping any not produced).
   */
  view?: "full" | AnalyzerCategory | AnalyzerCategory[];
  showKeyword?: boolean;
  keywordRequired?: boolean;
  inputTitle: string;
  contentLabel: string;
  placeholder: string;
  emptyTitle: string;
  emptyHint: string;
}

function WorkbenchResults({
  state,
  view,
  keywordRequired,
}: {
  state: Extract<WorkbenchState, { status: "success" }>;
  view: "full" | AnalyzerCategory | AnalyzerCategory[];
  keywordRequired?: boolean;
}) {
  if (view === "full") {
    return (
      <ParsedDocumentReport
        document={state.document}
        analysis={state.analysis}
        annotations={state.annotations}
      />
    );
  }

  const categories = Array.isArray(view) ? view : [view];
  const results = categories
    .map((category) => state.analysis.results.find((entry) => entry.category === category))
    .filter((result) => result !== undefined);

  // Show the inline text review whenever a readability view is on screen.
  const showText =
    categories.includes("readability") &&
    state.annotations !== null &&
    state.annotations.segments.length > 0;

  if (results.length === 0 && !showText) {
    return (
      <EmptyState
        icon={Search}
        title="Nothing to show yet"
        description={
          keywordRequired
            ? "Enter a focus keyword and analyze to see keyword targeting."
            : "This analyzer produced no result for the given input."
        }
        className="min-h-[420px]"
      />
    );
  }

  const body = (
    <div className="space-y-8">
      {showText && state.annotations ? (
        <AnnotatedText annotations={state.annotations} />
      ) : null}
      {results.map((result) => (
        <AnalyzerResultView key={result.id} result={result} />
      ))}
    </div>
  );

  // Only link findings to the text when the text review is on screen.
  return showText ? <TextFocusProvider>{body}</TextFocusProvider> : body;
}

function SaveReportButton({
  state,
}: {
  state: Extract<WorkbenchState, { status: "success" }>;
}) {
  const [saving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);

  const save = () => {
    startSaving(async () => {
      const result = await saveReportAction({
        source: state.source,
        target: state.target,
        focusKeyword: state.focusKeyword,
        document: state.document,
        analysis: state.analysis,
        annotations: state.annotations,
      });
      if (result.ok) {
        setSaved(true);
        toast.success("Saved to Reports.");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={save}
      disabled={saving || saved}
      className="gap-2"
    >
      {saving ? (
        <Loader2 className="size-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="size-4 text-success" />
      ) : (
        <BookmarkPlus className="size-4" />
      )}
      {saved ? "Saved" : "Save to Reports"}
    </Button>
  );
}

/**
 * Reusable input + analysis surface. Every analyze/insights page renders one of
 * these, configured for its input mode and which analyzer(s) to display.
 */
export function AnalyzerWorkbench({
  mode,
  view = "full",
  showKeyword = false,
  keywordRequired = false,
  inputTitle,
  contentLabel,
  placeholder,
  emptyTitle,
  emptyHint,
}: AnalyzerWorkbenchProps) {
  const [state, setState] = useState<WorkbenchState>({ status: "idle" });
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isPending, startTransition] = useTransition();

  const isUrl = mode === "url";
  const canSubmit =
    content.trim().length > 0 &&
    (!keywordRequired || keyword.trim().length > 0) &&
    !isPending;

  const run = () => {
    if (!canSubmit) return;
    startTransition(async () => {
      const result = await analyzeWorkbench({
        mode,
        content,
        title: mode === "text" ? title : undefined,
        focusKeyword: showKeyword ? keyword : undefined,
      });
      setState(result);
      if (result.status === "error") toast.error(result.message);
      else if (result.status === "success") toast.success("Analysis complete.");
    });
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    run();
  };

  // Power-user convenience: run the analysis with ⌘/Ctrl + Enter from any field.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      run();
    }
  };

  const clear = () => {
    setContent("");
    setTitle("");
    setKeyword("");
    setState({ status: "idle" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(340px,440px)_1fr] lg:items-start">
      <div className="lg:sticky lg:top-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{inputTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "text" ? (
                <div className="space-y-2">
                  <Label htmlFor="wb-title">
                    Title <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="wb-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Article title"
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="wb-content">{contentLabel}</Label>
                {isUrl ? (
                  <Input
                    id="wb-content"
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    placeholder={placeholder}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    onKeyDown={onKeyDown}
                  />
                ) : (
                  <Textarea
                    id="wb-content"
                    spellCheck={false}
                    placeholder={placeholder}
                    className="min-h-[320px] resize-y font-mono text-xs"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    onKeyDown={onKeyDown}
                  />
                )}
              </div>

              {showKeyword ? (
                <div className="space-y-2">
                  <Label htmlFor="wb-keyword">
                    Focus keyword{" "}
                    {keywordRequired ? null : (
                      <span className="text-muted-foreground">(optional)</span>
                    )}
                  </Label>
                  <Input
                    id="wb-keyword"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="e.g. running shoes"
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={!canSubmit} className="gap-2">
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  {isPending ? "Analyzing…" : "Analyze"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clear}
                  disabled={isPending}
                  className="gap-2"
                >
                  <Trash2 className="size-4" />
                  Clear
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Press{" "}
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
                  ⌘/Ctrl
                </kbd>{" "}
                +{" "}
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
                  Enter
                </kbd>{" "}
                to analyze.
              </p>

              {isUrl ? (
                <p className="text-xs text-muted-foreground">
                  Fetches server-side HTML only — JavaScript-rendered content is not executed.
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="min-w-0">
        {state.status === "success" ? (
          <FadeIn key={`${state.document.parsedAt}${state.target}`}>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Badge variant="outline">{SOURCE_LABEL[state.source]}</Badge>
                  <span
                    className="min-w-0 truncate text-sm text-muted-foreground"
                    title={state.target}
                  >
                    {state.source === "url" ? prettyUrl(state.target) : state.target}
                  </span>
                  {state.focusKeyword ? (
                    <Badge variant="secondary" className="font-normal">
                      “{state.focusKeyword}”
                    </Badge>
                  ) : null}
                </div>
                <SaveReportButton state={state} />
              </div>
              <WorkbenchResults
                state={state}
                view={view}
                keywordRequired={keywordRequired}
              />
            </div>
          </FadeIn>
        ) : (
          <EmptyState
            icon={Search}
            title={emptyTitle}
            description={emptyHint}
            className="min-h-[420px]"
          />
        )}
      </div>
    </div>
  );
}
