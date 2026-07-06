"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { FileText, Loader2, Sparkles, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import type { CleanOptions } from "@/types";
import { cleanHtmlAction, type CleanHtmlState } from "@/app/actions/clean-html";
import {
  DEFAULT_CLEAN_OPTIONS,
  OPTION_GROUPS,
  PRESETS,
} from "@/lib/html-cleaner/presets";
import { formatBytes } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CodeBlock, CopyButton, EmptyState } from "@/components/shared";
import { cn } from "@/lib/utils";

const SAMPLE = `<!--[if gte mso 9]><xml><o:OfficeDocumentSettings/></xml><![endif]-->
<p class="MsoNormal" style="margin:0cm;font-family:Calibri;color:#1F497D">
  <span style="mso-fareast-language:EN-US">Hello there <o:p></o:p></span>
</p>
<div style="mso-element:para" id="wrap" data-track="42" onclick="go()">
  <b style="mso-bidi-font-weight:normal">Bold intro</b> with some <i>italics</i>.
</div>
<p>&nbsp;</p>
<p class="x" id="y" data-id="1">Please <span class="z" style="color:red">clean</span> this up.</p>
<script>analytics('load');</script>`;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

export function HtmlCleaner() {
  const [html, setHtml] = useState("");
  const [options, setOptions] = useState<CleanOptions>(DEFAULT_CLEAN_OPTIONS);
  const [state, setState] = useState<CleanHtmlState>({ status: "idle" });
  const [cleaned, setCleaned] = useState(false);
  const [pending, startTransition] = useTransition();

  const inputBytes = useMemo(
    () => (html ? new TextEncoder().encode(html).length : 0),
    [html],
  );

  const run = (source: string, opts: CleanOptions) => {
    if (!source.trim()) return;
    startTransition(async () => {
      const result = await cleanHtmlAction({ html: source, options: opts });
      setState(result);
      setCleaned(true);
      if (result.status === "error") toast.error(result.message);
    });
  };

  // Re-clean when options change, once the user has cleaned at least once.
  useEffect(() => {
    if (cleaned && html.trim()) run(html, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const toggle = (key: keyof CleanOptions) =>
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));

  const result = state.status === "success" ? state.result : null;
  const savedPct =
    result && result.stats.beforeBytes > 0
      ? Math.max(0, Math.round((1 - result.stats.afterBytes / result.stats.beforeBytes) * 100))
      : 0;

  return (
    <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
      {/* Left: input + options */}
      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <SectionLabel>Messy HTML</SectionLabel>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatBytes(inputBytes)}
            </span>
          </div>
          <Textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="Paste HTML from a CMS, Word, or Google Docs…"
            spellCheck={false}
            className="min-h-[280px] resize-y font-mono text-xs"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => run(html, options)}
              disabled={pending || !html.trim()}
              className="gap-2"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
              Clean HTML
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => {
                setHtml(SAMPLE);
                run(SAMPLE, options);
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
                setHtml("");
                setState({ status: "idle" });
                setCleaned(false);
              }}
            >
              <Trash2 className="size-4" />
              Clear
            </Button>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <SectionLabel>Cleaning options</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={() => setOptions(preset.options)}
              >
                <Sparkles className="size-3.5" />
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {OPTION_GROUPS.map((group) => (
              <div key={group.label} className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{group.label}</p>
                {group.items.map((item) => (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={options[item.key]}
                      onChange={() => toggle(item.key)}
                      className="size-4 accent-primary"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right: output */}
      <div className="space-y-4">
        {result ? (
          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>Cleaned HTML</SectionLabel>
              <CopyButton value={result.html} label="Copy" />
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border px-2 py-1">
                {formatBytes(result.stats.beforeBytes)} → {formatBytes(result.stats.afterBytes)}
              </span>
              <span className="rounded-md border border-success/30 bg-success/10 px-2 py-1 font-medium text-success">
                {savedPct}% smaller
              </span>
              <span className="rounded-md border px-2 py-1 text-muted-foreground">
                {result.stats.attributesRemoved} attrs
              </span>
              <span className="rounded-md border px-2 py-1 text-muted-foreground">
                {result.stats.elementsRemoved} elements
              </span>
              {result.stats.commentsRemoved > 0 ? (
                <span className="rounded-md border px-2 py-1 text-muted-foreground">
                  {result.stats.commentsRemoved} comments
                </span>
              ) : null}
              {result.stats.spansUnwrapped > 0 ? (
                <span className="rounded-md border px-2 py-1 text-muted-foreground">
                  {result.stats.spansUnwrapped} spans
                </span>
              ) : null}
            </div>

            <CodeBlock code={result.html} className={cn("max-h-[520px]")} />
          </Card>
        ) : (
          <EmptyState
            icon={Wand2}
            title="No output yet"
            description="Paste HTML and click “Clean HTML”, or load the sample, to strip out the cruft."
            className="min-h-[360px]"
          />
        )}
      </div>
    </div>
  );
}
