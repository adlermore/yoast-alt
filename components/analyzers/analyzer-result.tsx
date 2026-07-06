import type { AnalyzerResult, CheckStatus } from "@/types";
import { gradeFromScore } from "@/lib/scores";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScoreRing } from "@/components/scores/score-ring";
import { CheckList } from "./check-list";
import { STATUS_META } from "./check-status";

const GRADE_LABEL: Record<ReturnType<typeof gradeFromScore>, string> = {
  excellent: "Excellent",
  good: "Good",
  ok: "Needs work",
  poor: "Poor",
  bad: "Critical",
};

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

/** Focused report for a single analyzer: score, summary, and its checks. */
export function AnalyzerResultView({ result }: { result: AnalyzerResult }) {
  const grade = gradeFromScore(result.score);
  const scored = result.summary.total > 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <ScoreRing score={result.score} />
          <div className="w-full flex-1 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{result.label} score</p>
              <p className="text-xl font-semibold tracking-tight">
                {scored ? GRADE_LABEL[grade] : "Not scored"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SummaryChip status="error" count={result.summary.errors} />
              <SummaryChip status="warning" count={result.summary.warnings} />
              <SummaryChip status="pass" count={result.summary.passed} />
            </div>
          </div>
        </div>
      </Card>

      {result.checks.length > 0 ? (
        <CheckList checks={result.checks} />
      ) : (
        <p className="text-sm text-muted-foreground">No checks were produced for this input.</p>
      )}
    </div>
  );
}
