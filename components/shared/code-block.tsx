import { cn } from "@/lib/utils";

export interface CodeBlockProps {
  code: string;
  className?: string;
}

export function CodeBlock({ code, className }: CodeBlockProps) {
  return (
    <pre
      className={cn(
        "max-h-80 overflow-auto rounded-md border bg-muted/40 p-3 text-xs leading-relaxed",
        className,
      )}
    >
      <code className="font-mono">{code}</code>
    </pre>
  );
}
