import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DefinitionItem {
  term: string;
  value: ReactNode;
}

export function DefinitionList({
  items,
  className,
}: {
  items: DefinitionItem[];
  className?: string;
}) {
  return (
    <dl className={cn("divide-y", className)}>
      {items.map((item) => (
        <div
          key={item.term}
          className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[160px_1fr] sm:gap-4"
        >
          <dt className="text-sm font-medium text-muted-foreground">
            {item.term}
          </dt>
          <dd className="min-w-0 break-words text-sm">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
