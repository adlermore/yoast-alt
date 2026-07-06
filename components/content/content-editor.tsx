"use client";

import { Fragment, useMemo, useState } from "react";
import { FileText, Play, Trash2 } from "lucide-react";
import { countWords } from "@/lib/html";
import {
  DEFAULT_STANDARDS,
  evaluateContent,
  type ContentStandards,
  type StandardsResult,
} from "@/lib/readability";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const SAMPLE = `Search rankings are increasingly influenced by how easily your content can be read by a wide audience, and this is something that should never be overlooked by writers who want their pages to be discovered.

When a sentence is stretched out with clause after clause, sub-point after sub-point, and qualifier after qualifier, the reader is forced to hold too many ideas in their head at once, and the meaning is often lost before the full stop is finally reached. Short sentences help. They are easy to scan. Mistakes are made when every idea is packed into one line.

The report was written by the team, the results were reviewed by the manager, and the changes were approved before the launch was scheduled. Your draft should be checked against clear standards so that problems are caught early and your readers are kept happy.`;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function StandardField({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  detail,
  met,
  badge,
}: Omit<StandardsResult["metrics"][number], "key">) {
  return (
    <Card className={cn("space-y-2 border-t-2 p-4", met ? "border-t-success" : "border-t-danger")}>
      <SectionLabel>{label}</SectionLabel>
      <p className="text-3xl font-semibold tabular-nums">
        {value}
        {unit ? <span className="ml-1 text-base font-normal text-muted-foreground">{unit}</span> : null}
      </p>
      <p className="text-xs text-muted-foreground">{detail}</p>
      <span
        className={cn(
          "inline-block rounded px-2 py-0.5 text-xs font-medium",
          met ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
        )}
      >
        {badge}
      </span>
    </Card>
  );
}

const FIX_BADGE_CLASS: Record<string, string> = {
  LONG: "bg-warning/15 text-warning",
  PASSIVE: "bg-warning/15 text-warning",
  LENGTH: "bg-danger/10 text-danger",
  READING: "bg-danger/10 text-danger",
};

export function ContentEditor() {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const [standards, setStandards] = useState<ContentStandards>(DEFAULT_STANDARDS);

  const wordCount = useMemo(() => countWords(text), [text]);
  const result = useMemo<StandardsResult | null>(
    () => (checked && text.trim() ? evaluateContent(text, standards) : null),
    [checked, text, standards],
  );

  const setStandard = (key: keyof ContentStandards) => (n: number) =>
    setStandards((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }));

  return (
    <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
      {/* Left: content + standards */}
      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <SectionLabel>Your content</SectionLabel>
            <span className="text-xs text-muted-foreground tabular-nums">{wordCount} words</span>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or write your content here…"
            className="min-h-[300px] resize-y"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setChecked(true)} disabled={!text.trim()} className="gap-2">
              <Play className="size-4" />
              Check content
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => {
                setText(SAMPLE);
                setChecked(true);
              }}
            >
              <FileText className="size-4" />
              Load sample
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={() => {
                setText("");
                setChecked(false);
              }}
            >
              <Trash2 className="size-4" />
              Clear
            </Button>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <SectionLabel>Your standards</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <StandardField
              id="std-sentence"
              label="Max words / sentence"
              value={standards.maxWordsPerSentence}
              onChange={setStandard("maxWordsPerSentence")}
              hint="Sentences over this get flagged as hard to read. SEO tools suggest 20."
            />
            <StandardField
              id="std-passive"
              label="Max passive voice %"
              value={standards.maxPassivePct}
              onChange={setStandard("maxPassivePct")}
              hint="Share of sentences that may use passive voice. Aim for ≤ 10%."
            />
            <StandardField
              id="std-words"
              label="Min total words"
              value={standards.minTotalWords}
              onChange={setStandard("minTotalWords")}
              hint="Minimum length for the whole piece. Blogs often target 300+."
            />
            <StandardField
              id="std-reading"
              label="Min reading ease"
              value={standards.minReadingEase}
              onChange={setStandard("minReadingEase")}
              hint="Flesch score (higher = easier). 60+ reads as plain English."
            />
          </div>
        </Card>
      </div>

      {/* Right: results */}
      <div className="space-y-6">
        {result ? (
          <>
            <Card
              className={cn(
                "flex items-center gap-3 p-4",
                result.standardsNotMet > 0
                  ? "border-danger/30 bg-danger/5"
                  : "border-success/30 bg-success/5",
              )}
            >
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full",
                  result.standardsNotMet > 0 ? "bg-danger" : "bg-success",
                )}
              />
              <div>
                <p className="text-sm font-semibold">
                  {result.standardsNotMet > 0
                    ? `${result.standardsNotMet} standard${result.standardsNotMet > 1 ? "s" : ""} not met`
                    : "All standards met"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.standardsNotMet > 0
                    ? "Fix the red items below to make it Google- and reader-friendly."
                    : "This content is Google- and reader-friendly."}
                </p>
              </div>
            </Card>

            <div className="space-y-3">
              <SectionLabel>Scorecard</SectionLabel>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.metrics.map(({ key, ...metric }) => (
                  <MetricCard key={key} {...metric} />
                ))}
              </div>
            </div>

            <Card className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <SectionLabel>Marked-up text</SectionLabel>
                <span className="text-xs text-muted-foreground">
                  {result.longCount} long · {result.passiveSentenceCount} passive
                </span>
              </div>
              <div className="space-y-3 text-sm leading-7">
                {result.paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex}>
                    {paragraph.sentences.map((sentence, sIndex) => (
                      <Fragment key={sIndex}>
                        <span className={cn(sentence.long && "rounded bg-warning/10 [box-decoration-break:clone]")}>
                          {sentence.parts.map((part, partIndex) =>
                            part.passive ? (
                              <mark
                                key={partIndex}
                                className="rounded bg-warning/30 text-inherit [box-decoration-break:clone]"
                              >
                                {part.text}
                              </mark>
                            ) : (
                              <Fragment key={partIndex}>{part.text}</Fragment>
                            ),
                          )}
                        </span>{" "}
                      </Fragment>
                    ))}
                  </p>
                ))}
              </div>
            </Card>

            {result.fixes.length > 0 ? (
              <Card className="space-y-3 p-5">
                <SectionLabel>What to fix</SectionLabel>
                <ul className="divide-y">
                  {result.fixes.map((fix, index) => (
                    <li key={index} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <span
                        className={cn(
                          "mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold",
                          FIX_BADGE_CLASS[fix.badge] ?? "bg-muted text-muted-foreground",
                        )}
                      >
                        {fix.badge}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{fix.heading}</p>
                        <p className="text-sm text-muted-foreground text-pretty">{fix.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </>
        ) : (
          <Card className="flex min-h-[420px] flex-col items-center justify-center gap-2 border-dashed p-10 text-center">
            <p className="text-sm font-medium">No results yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Paste your content and click “Check content”, or load the sample, to score it
              against your standards.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
