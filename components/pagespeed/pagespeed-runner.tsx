"use client";

import { useState, useTransition } from "react";
import { Gauge, Loader2, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import type {
  FieldMetric,
  LabMetric,
  MetricRating,
  PsiStrategyInput,
  StrategyResult,
} from "@/types";
import { runPageSpeedAction, type PageSpeedState } from "@/app/actions/pagespeed";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared";
import { cn } from "@/lib/utils";

const RATING_TEXT: Record<MetricRating, string> = {
  good: "text-success",
  "needs-improvement": "text-warning",
  poor: "text-danger",
  none: "text-muted-foreground",
};
const RATING_BORDER: Record<MetricRating, string> = {
  good: "border-t-success",
  "needs-improvement": "border-t-warning",
  poor: "border-t-danger",
  none: "border-t-border",
};
const RATING_LABEL: Record<MetricRating, string> = {
  good: "Good",
  "needs-improvement": "Needs improvement",
  poor: "Poor",
  none: "No data",
};

function psiColor(score: number): string {
  if (score >= 90) return "#0cce6b";
  if (score >= 50) return "#ffa400";
  return "#ff4e42";
}

function ScoreGauge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <div className="flex size-28 items-center justify-center rounded-full border-4 border-border text-muted-foreground">
        <span className="text-sm">n/a</span>
      </div>
    );
  }
  const color = psiColor(score);
  return (
    <div
      className="flex size-28 flex-col items-center justify-center rounded-full border-4"
      style={{ borderColor: color }}
    >
      <span className="text-4xl font-semibold tabular-nums" style={{ color }}>
        {score}
      </span>
      <span className="text-[10px] text-muted-foreground">Performance</span>
    </div>
  );
}

function MetricTile({
  id,
  label,
  displayValue,
  rating,
}: {
  id: string;
  label: string;
  displayValue: string;
  rating: MetricRating;
}) {
  return (
    <Card className={cn("space-y-1 border-t-2 p-4", RATING_BORDER[rating])}>
      <p className="text-xs font-medium text-muted-foreground" title={label}>
        {id}
      </p>
      <p className={cn("text-2xl font-semibold tabular-nums", RATING_TEXT[rating])}>
        {displayValue}
      </p>
      <p className="text-[11px] text-muted-foreground">{RATING_LABEL[rating]}</p>
    </Card>
  );
}

function StrategyView({ result }: { result: StrategyResult }) {
  return (
    <div className="space-y-6">
      <Card className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:gap-8">
        <ScoreGauge score={result.performanceScore} />
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Lighthouse performance score</p>
          <p className="text-sm text-muted-foreground">
            0–49 <span className="text-danger">poor</span> · 50–89{" "}
            <span className="text-warning">needs work</span> · 90–100{" "}
            <span className="text-success">good</span>
          </p>
        </div>
      </Card>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Field data — Core Web Vitals</h3>
          <p className="text-xs text-muted-foreground">
            {result.fieldAvailable
              ? `Real-user data from the Chrome UX Report (${result.fieldSource === "origin" ? "origin-level" : "this URL"}). This is the actual ranking signal.`
              : "No field data — not enough real-user data in CrUX for this URL. See lab data below."}
          </p>
        </div>
        {result.fieldAvailable ? (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {result.field.map((m: FieldMetric) => (
              <MetricTile key={m.id} {...m} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Lab data — Lighthouse</h3>
          <p className="text-xs text-muted-foreground">
            Diagnostic metrics from a single simulated load. Use for debugging, not as the
            ranking signal.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {result.lab.map((m: LabMetric) => (
            <MetricTile key={m.id} {...m} />
          ))}
        </div>
      </section>

      {result.opportunities.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Top opportunities</h3>
          <div className="divide-y rounded-lg border">
            {result.opportunities.map((op) => (
              <div key={op.id} className="flex items-start gap-4 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{op.title}</p>
                  {op.displayValue ? (
                    <p className="text-xs text-muted-foreground">{op.displayValue}</p>
                  ) : null}
                </div>
                {op.savingsMs > 0 ? (
                  <span className="shrink-0 rounded-md bg-warning/10 px-2 py-1 text-xs font-medium text-warning tabular-nums">
                    ~{op.savingsMs >= 1000 ? `${(op.savingsMs / 1000).toFixed(1)} s` : `${op.savingsMs} ms`}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

const STRATEGIES: { value: PsiStrategyInput; label: string; icon: typeof Smartphone }[] = [
  { value: "mobile", label: "Mobile", icon: Smartphone },
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "both", label: "Both", icon: Gauge },
];

export function PageSpeedRunner() {
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<PsiStrategyInput>("mobile");
  const [state, setState] = useState<PageSpeedState>({ status: "idle" });
  const [pending, startTransition] = useTransition();

  const run = (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim() || pending) return;
    startTransition(async () => {
      const result = await runPageSpeedAction({ url, strategy });
      setState(result);
      if (result.status === "error") toast.error(result.message);
      else toast.success("PageSpeed analysis complete.");
    });
  };

  const report = state.status === "success" ? state.report : null;

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <form onSubmit={run} className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="psi-url">Page URL</Label>
              <Input
                id="psi-url"
                type="url"
                inputMode="url"
                placeholder="https://example.com/page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label>Device</Label>
              <div className="flex rounded-md border p-0.5">
                {STRATEGIES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStrategy(value)}
                    disabled={pending}
                    className={cn(
                      "flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors",
                      strategy === value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={pending || !url.trim()} className="gap-2">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Gauge className="size-4" />}
              Analyze
            </Button>
          </div>
          {pending ? (
            <p className="text-xs text-muted-foreground">
              Running Lighthouse via PageSpeed Insights — this can take up to a minute.
            </p>
          ) : null}
        </form>
      </Card>

      {report ? (
        <div className="space-y-2">
          <p className="truncate text-sm text-muted-foreground" title={report.fetchedUrl}>
            {report.fetchedUrl}
          </p>
          {report.strategies.length > 1 ? (
            <Tabs defaultValue={report.strategies[0].strategy} className="gap-6">
              <TabsList>
                {report.strategies.map((s) => (
                  <TabsTrigger key={s.strategy} value={s.strategy} className="capitalize gap-2">
                    {s.strategy === "mobile" ? (
                      <Smartphone className="size-4" />
                    ) : (
                      <Monitor className="size-4" />
                    )}
                    {s.strategy}
                  </TabsTrigger>
                ))}
              </TabsList>
              {report.strategies.map((s) => (
                <TabsContent key={s.strategy} value={s.strategy}>
                  <StrategyView result={s} />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <StrategyView result={report.strategies[0]} />
          )}
        </div>
      ) : state.status !== "error" ? (
        <EmptyState
          icon={Gauge}
          title="No analysis yet"
          description="Enter a public page URL and run PageSpeed Insights to see Core Web Vitals and performance fixes."
          className="min-h-[360px]"
        />
      ) : null}
    </div>
  );
}
