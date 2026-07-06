"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders an arbitrary remote preview image with a graceful broken-image
 * fallback. Uses a native `<img>` on purpose — these are unknown external hosts,
 * so `next/image`'s domain allowlist and optimizer do not apply.
 */
export function PreviewImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
      >
        <ImageOff className="size-6" aria-hidden />
        <span className="sr-only">No preview image</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote host; next/image allowlist not applicable
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
