import type { ReactNode } from "react";
import { PageHelp } from "@/components/help";
import type { HelpKey } from "@/components/help";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** When set, renders a "How it works" popup with this page's documentation. */
  helpKey?: HelpKey;
  /** Optional actions rendered on the trailing edge (e.g. buttons). */
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  helpKey,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {helpKey || children ? (
        <div className="flex shrink-0 items-center gap-2">
          {helpKey ? <PageHelp helpKey={helpKey} /> : null}
          {children}
        </div>
      ) : null}
    </div>
  );
}
