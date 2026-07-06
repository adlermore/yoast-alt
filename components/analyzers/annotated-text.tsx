"use client";

import { Fragment, useEffect, useRef } from "react";
import type { TextAnnotations } from "@/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTextFocus } from "./text-focus";

const LONG_STYLE = "rounded bg-warning/25 [box-decoration-break:clone]";
const ACTIVE_STYLE =
  "rounded bg-warning/40 ring-2 ring-warning/60 [box-decoration-break:clone]";

/**
 * Renders the analyzed text with problem ranges highlighted inline (long
 * sentences in orange). When rendered inside a TextFocusProvider, clicking a
 * finding elsewhere scrolls to and highlights the matching sentence here.
 */
export function AnnotatedText({ annotations }: { annotations: TextAnnotations }) {
  const { segments, counts, truncated, longSentenceLimit } = annotations;
  const longCount = counts["long-sentence"];
  const focus = useTextFocus();
  const activeIndex = focus?.activeIndex ?? null;
  const containerRef = useRef<HTMLParagraphElement>(null);

  // Scroll the focused sentence into view whenever it changes (or is re-clicked).
  useEffect(() => {
    if (activeIndex === null) return;
    const node = containerRef.current?.querySelector<HTMLElement>(
      `[data-sentence="${activeIndex}"]`,
    );
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex, focus?.nonce]);

  return (
    <Card className="space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <h3 className="text-sm font-semibold">Text review</h3>
        <span className="inline-flex items-center gap-1.5 text-xs">
          <span className={cn("px-1", LONG_STYLE)}>Aa</span>
          <span>Long sentence</span>
          <span className="tabular-nums text-muted-foreground">{longCount}</span>
        </span>
      </div>

      {longCount === 0 ? (
        <p className="text-xs text-success">
          No overly long sentences flagged — the text reads clearly.
        </p>
      ) : null}

      <p ref={containerRef} className="text-[0.95rem] leading-8 text-pretty">
        {segments.map((segment, index) => {
          const long = segment.issues.includes("long-sentence");
          const active = index === activeIndex;
          const gap = index < segments.length - 1 ? " " : "";
          return (
            <Fragment key={index}>
              <span
                data-sentence={index}
                title={
                  long
                    ? `Long sentence — ${segment.words} words (aim under ${longSentenceLimit})`
                    : undefined
                }
                className={cn(
                  "scroll-mt-24 transition-colors",
                  long && !active && LONG_STYLE,
                  active && ACTIVE_STYLE,
                )}
              >
                {segment.text}
              </span>
              {gap}
            </Fragment>
          );
        })}
      </p>

      {truncated ? (
        <p className="text-xs text-muted-foreground">
          Only the first part of a very long text is shown here.
        </p>
      ) : null}
    </Card>
  );
}
