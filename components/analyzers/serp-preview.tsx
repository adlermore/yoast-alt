import { Globe } from "lucide-react";
import { prettyUrl } from "@/lib/format";

export interface SerpPreviewProps {
  title: string | null;
  description: string | null;
  url: string | null;
}

/** Approximation of a Google search result to visualize the page's snippet. */
export function SerpPreview({ title, description, url }: SerpPreviewProps) {
  const breadcrumb = url ? prettyUrl(url) : "example.com › page";

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-muted">
          <Globe className="size-3.5 text-muted-foreground" aria-hidden />
        </span>
        <p className="truncate text-xs text-muted-foreground">{breadcrumb}</p>
      </div>
      <p className="mt-2 line-clamp-1 text-lg leading-tight text-[#1a0dab] dark:text-[#8ab4f8]">
        {title ?? "Untitled page"}
      </p>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {description ??
          "No meta description was found — search engines may generate one from the page content."}
      </p>
    </div>
  );
}
