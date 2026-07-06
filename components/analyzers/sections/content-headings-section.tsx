import type { ParsedDocument } from "@/types";
import { EmptyState } from "@/components/shared";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heading } from "lucide-react";
import { formatNumber } from "@/lib/format";

const STAT_KEYS = [
  { key: "wordCount", label: "Words" },
  { key: "characterCount", label: "Characters" },
  { key: "sentenceCount", label: "Sentences" },
  { key: "paragraphCount", label: "Paragraphs" },
  { key: "listCount", label: "Lists" },
  { key: "tableCount", label: "Tables" },
] as const;

export function ContentHeadingsSection({
  document,
}: {
  document: ParsedDocument;
}) {
  const { content, headings } = document;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {STAT_KEYS.map((stat) => (
            <div key={stat.key} className="space-y-1">
              <p className="text-2xl font-semibold tabular-nums">
                {formatNumber(content[stat.key])}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Heading outline</CardTitle>
        </CardHeader>
        <CardContent>
          {headings.length === 0 ? (
            <EmptyState
              icon={Heading}
              title="No headings found"
              description="This document has no h1–h6 elements."
            />
          ) : (
            <ol className="space-y-1">
              {headings.map((heading) => (
                <li
                  key={`${heading.order}-${heading.level}`}
                  className="flex items-start gap-2 text-sm"
                  style={{ paddingLeft: `${(heading.level - 1) * 1.25}rem` }}
                >
                  <Badge
                    variant={heading.level === 1 ? "default" : "secondary"}
                    className="mt-0.5 shrink-0 font-mono text-[10px]"
                  >
                    H{heading.level}
                  </Badge>
                  <span className="break-words">
                    {heading.text || (
                      <span className="italic text-muted-foreground">
                        (empty heading)
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
