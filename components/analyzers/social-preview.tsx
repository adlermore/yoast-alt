import { MissingValue } from "@/components/shared";
import { PreviewImage } from "./preview-image";

export interface SocialPreviewProps {
  platform: string;
  domain: string;
  title: string | null;
  description: string | null;
  image: string | null;
}

/** A generic link-share card mimicking how OG/Twitter metadata renders. */
export function SocialPreview({
  platform,
  domain,
  title,
  description,
  image,
}: SocialPreviewProps) {
  return (
    <figure className="overflow-hidden rounded-lg border bg-card">
      <figcaption className="sr-only">{platform} share preview</figcaption>
      <PreviewImage
        src={image}
        alt={`${platform} share image`}
        className="aspect-[1.91/1] w-full"
      />
      <div className="space-y-1 border-t p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {domain}
        </p>
        <p className="line-clamp-1 text-sm font-semibold">
          {title ?? <MissingValue>No title</MissingValue>}
        </p>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {description ?? "No description provided."}
        </p>
      </div>
    </figure>
  );
}
