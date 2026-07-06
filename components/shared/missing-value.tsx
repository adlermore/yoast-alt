import type { ReactNode } from "react";

/** Consistent placeholder for absent/empty document fields. */
export function MissingValue({
  children = "Not set",
}: {
  children?: ReactNode;
}) {
  return <span className="italic text-muted-foreground">{children}</span>;
}
