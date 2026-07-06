import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-10", className)}
    >
      {children}
    </div>
  );
}
