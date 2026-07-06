import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** A compact yes/no chip used to visualize presence of structural elements. */
export function PresenceBadge({
  present,
  label,
}: {
  present: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
        present
          ? "border-success/30 bg-success/10 text-success"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      {present ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      {label}
    </span>
  );
}
