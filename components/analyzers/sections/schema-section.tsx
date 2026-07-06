import { Braces, CircleCheck, CircleX } from "lucide-react";
import type { ParsedDocument, StructuredDataItem } from "@/types";
import { CodeBlock, CopyButton, EmptyState } from "@/components/shared";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function prettyPrint(item: StructuredDataItem): string {
  if (item.valid && item.data !== null) {
    try {
      return JSON.stringify(item.data, null, 2);
    } catch {
      return item.raw;
    }
  }
  return item.raw;
}

function SchemaCard({ item }: { item: StructuredDataItem }) {
  const code = prettyPrint(item);

  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="uppercase">
              {item.format}
            </Badge>
            {item.types.length > 0 ? (
              item.types.map((type) => (
                <Badge key={type} variant="secondary">
                  {type}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">Untyped</Badge>
            )}
          </div>
          {item.valid ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
              <CircleCheck className="size-3.5" /> Valid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-danger">
              <CircleX className="size-3.5" /> Invalid
            </span>
          )}
        </div>
        {item.error ? (
          <p className="text-xs text-danger">{item.error}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-end">
          <CopyButton value={code} label="Copy JSON" />
        </div>
        <CodeBlock code={code} />
      </CardContent>
    </Card>
  );
}

export function SchemaSection({ document }: { document: ParsedDocument }) {
  const items = document.structuredData;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Braces}
        title="No structured data found"
        description="No JSON-LD or microdata was detected on this page."
      />
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <SchemaCard key={`${item.format}-${index}`} item={item} />
      ))}
    </div>
  );
}
