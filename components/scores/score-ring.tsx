import type { ScoreGrade } from "@/types";
import { gradeFromScore } from "@/lib/scores";
import { cn } from "@/lib/utils";

const GRADE_COLOR: Record<ScoreGrade, string> = {
  excellent: "text-success",
  good: "text-success",
  ok: "text-warning",
  poor: "text-danger",
  bad: "text-danger",
};

export interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/** Pure SVG donut showing a 0–100 score, colored by grade. */
export function ScoreRing({
  score,
  size = 128,
  strokeWidth = 10,
  className,
}: ScoreRingProps) {
  const grade = gradeFromScore(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);
  const center = size / 2;
  // Scale the label with the ring so it works at any size (44 → 128).
  const scoreFontSize = Math.round(size * 0.28);
  const showDenominator = size >= 96;

  return (
    <div
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score ${score} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-muted"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke="currentColor"
          className={cn(
            "fill-none transition-[stroke-dashoffset] duration-700 ease-out",
            GRADE_COLOR[grade],
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className="font-semibold tabular-nums"
          style={{ fontSize: scoreFontSize }}
        >
          {score}
        </span>
        {showDenominator ? (
          <span className="mt-0.5 text-xs text-muted-foreground">/ 100</span>
        ) : null}
      </div>
    </div>
  );
}
