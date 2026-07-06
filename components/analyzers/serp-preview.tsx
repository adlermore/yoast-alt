import { Globe } from "lucide-react";
import { prettyUrl } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SERP_PIXEL_LIMITS } from "@/constants/thresholds";
import {
  classifyPixelWidth,
  descriptionPixelWidth,
  titlePixelWidth,
  type PixelRange,
} from "@/lib/seo/pixel-width";

export interface SerpPreviewProps {
  title: string | null;
  description: string | null;
  url: string | null;
}

/** Pixel budget meter for one snippet element (Google truncates by width). */
function WidthMeter({
  label,
  width,
  range,
}: {
  label: string;
  width: number;
  range: PixelRange;
}) {
  const verdict = classifyPixelWidth(width, range);
  const percent = Math.min(100, Math.round((width / range.max) * 100));
  const barClass =
    verdict === "truncated"
      ? "bg-danger"
      : verdict === "short"
        ? "bg-warning"
        : "bg-success";

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span
          className={cn(
            "tabular-nums",
            verdict === "truncated" && "font-medium text-danger",
          )}
        >
          {width}px / {range.max}px
          {verdict === "truncated" ? " — truncated" : null}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", barClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/** Approximation of a Google search result to visualize the page's snippet. */
export function SerpPreview({ title, description, url }: SerpPreviewProps) {
  const breadcrumb = url ? prettyUrl(url) : "example.com › page";

  return (
    <div className="space-y-4">
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

      <div className="space-y-3">
        {title ? (
          <WidthMeter
            label="Title width"
            width={titlePixelWidth(title)}
            range={SERP_PIXEL_LIMITS.title}
          />
        ) : null}
        {description ? (
          <WidthMeter
            label="Description width"
            width={descriptionPixelWidth(description)}
            range={SERP_PIXEL_LIMITS.description}
          />
        ) : null}
      </div>
    </div>
  );
}
