import type { Check, CheckStatus } from "@/types";
import { CheckItem } from "./check-item";

/** Sort order: most severe first, informational last. */
const STATUS_ORDER: Record<CheckStatus, number> = {
  error: 0,
  warning: 1,
  pass: 2,
  info: 3,
};

export function CheckList({ checks }: { checks: Check[] }) {
  const sorted = [...checks].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );

  return (
    <div className="divide-y rounded-lg border">
      {sorted.map((check, index) => (
        <CheckItem key={`${check.id}-${index}`} check={check} />
      ))}
    </div>
  );
}
