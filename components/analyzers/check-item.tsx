"use client";

import { ChevronDown, CornerDownRight } from "lucide-react";
import type { Check, Priority } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_META } from "./check-status";
import { useTextFocus } from "./text-focus";

const PRIORITY_CLASS: Record<Priority, string> = {
  critical: "border-danger/30 bg-danger/10 text-danger",
  high: "border-danger/30 bg-danger/10 text-danger",
  medium: "border-warning/30 bg-warning/10 text-warning",
  low: "border-border bg-muted text-muted-foreground",
};

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant="outline" className={cn("shrink-0 capitalize", PRIORITY_CLASS[priority])}>
      {priority}
    </Badge>
  );
}

function RecommendationDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[110px_1fr] sm:gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

export function CheckItem({ check }: { check: Check }) {
  const meta = STATUS_META[check.status];
  const Icon = meta.icon;
  const focus = useTextFocus();
  const hasHighlights = (check.highlights?.length ?? 0) > 0;
  const expandable = Boolean(check.recommendation) || hasHighlights;
  // Highlights are clickable when we can locate each one in the text review.
  const locatable =
    Boolean(focus) &&
    check.highlightSentences?.length === check.highlights?.length;

  const header = (
    <>
      <Icon className={cn("mt-0.5 size-4 shrink-0", meta.className)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{check.title}</p>
        <p className="text-sm text-muted-foreground text-pretty">{check.detail}</p>
      </div>
      {check.recommendation ? (
        <PriorityBadge priority={check.recommendation.priority} />
      ) : null}
    </>
  );

  if (!expandable) {
    return <div className="flex items-start gap-3 p-3">{header}</div>;
  }

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-start gap-3 p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {header}
        <ChevronDown className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-3 px-3 pb-3 pl-10">
        {hasHighlights ? (
          <ul className="space-y-1 rounded-md border bg-muted/40 p-2.5 text-xs">
            {check.highlights?.map((highlight, index) => {
              const sentence = check.highlightSentences?.[index];
              if (locatable && focus && sentence !== undefined) {
                return (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => focus.focus(sentence)}
                      className="group/hl flex w-full items-start gap-1.5 rounded text-left font-mono text-muted-foreground transition-colors hover:text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      title="Show this sentence in the text review"
                    >
                      <CornerDownRight className="mt-0.5 size-3 shrink-0 opacity-50 group-hover/hl:opacity-100" />
                      <span className="break-words underline decoration-dotted decoration-muted-foreground/40 underline-offset-2 group-hover/hl:decoration-warning">
                        {highlight}
                      </span>
                    </button>
                  </li>
                );
              }
              return (
                <li key={index} className="break-words font-mono text-muted-foreground">
                  {highlight}
                </li>
              );
            })}
          </ul>
        ) : null}
        {check.recommendation ? (
          <div className="space-y-2 rounded-md border bg-card p-3">
            <RecommendationDetail label="Problem" value={check.recommendation.problem} />
            <RecommendationDetail label="Why" value={check.recommendation.reason} />
            <RecommendationDetail label="How to fix" value={check.recommendation.howToFix} />
            <RecommendationDetail label="Impact" value={check.recommendation.impact} />
          </div>
        ) : null}
      </div>
    </details>
  );
}
