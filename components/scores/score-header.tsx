import type { AnalysisOutcome, CheckStatus, ScoreSummary } from "@/types";
import { gradeFromScore } from "@/lib/scores";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { STATUS_META } from "@/components/analyzers/check-status";
import { cn } from "@/lib/utils";
import { ScoreRing } from "./score-ring";

const GRADE_LABEL: Record<ReturnType<typeof gradeFromScore>, string> = {
  excellent: "Excellent",
  good: "Good",
  ok: "Needs work",
  poor: "Poor",
  bad: "Critical",
};

function aggregateSummary(analysis: AnalysisOutcome): ScoreSummary {
  return analysis.results.reduce<ScoreSummary>(
    (acc, result) => ({
      passed: acc.passed + result.summary.passed,
      warnings: acc.warnings + result.summary.warnings,
      errors: acc.errors + result.summary.errors,
      total: acc.total + result.summary.total,
    }),
    { passed: 0, warnings: 0, errors: 0, total: 0 },
  );
}

function SummaryChip({
  status,
  count,
}: {
  status: Exclude<CheckStatus, "info">;
  count: number;
}) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm">
      <Icon className={cn("size-4", meta.className)} aria-hidden />
      <span className="font-medium tabular-nums">{count}</span>
      <span className="text-muted-foreground">{meta.label}</span>
    </span>
  );
}

export function ScoreHeader({ analysis }: { analysis: AnalysisOutcome }) {
  const summary = aggregateSummary(analysis);
  const grade = gradeFromScore(analysis.scores.overall);

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        <ScoreRing score={analysis.scores.overall} />

        <div className="w-full flex-1 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Overall score</p>
            <p className="text-xl font-semibold tracking-tight">
              {GRADE_LABEL[grade]}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <SummaryChip status="error" count={summary.errors} />
            <SummaryChip status="warning" count={summary.warnings} />
            <SummaryChip status="pass" count={summary.passed} />
          </div>

          <div className="space-y-2">
            {analysis.results.map((result) => (
              <div key={result.id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-muted-foreground">
                  {result.label}
                </span>
                <Progress value={result.score} className="h-2 flex-1" />
                <span className="w-9 shrink-0 text-right text-sm font-medium tabular-nums">
                  {result.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
