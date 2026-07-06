import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { truncate } from "@/lib/html";

/** Summary-level image accessibility: alt-text coverage. */
export function checkImages(doc: ParsedDocument): Check[] {
  // Tracking pixels are excluded; a missing alt is an absent attribute
  // (alt="" is a valid decorative declaration).
  const contentImages = doc.images.filter((image) => !image.isTrackingPixel);
  const missing = contentImages.filter((image) => image.alt === null);

  if (contentImages.length === 0) {
    return [
      createCheck({
        id: "image-alt",
        title: "Image alt text",
        status: "info",
        detail: "No content images were found.",
        weight: 1,
      }),
    ];
  }

  return [
    createCheck({
      id: "image-alt",
      title: "Image alt text",
      status: missing.length === 0 ? "pass" : "warning",
      detail:
        missing.length === 0
          ? `All ${contentImages.length} content images have an alt attribute.`
          : `${missing.length} of ${contentImages.length} images are missing an alt attribute.`,
      weight: 2,
      highlights:
        missing.length > 0
          ? missing.slice(0, 10).map((image) => truncate(image.src ?? "(no src)", 80))
          : undefined,
      recommendation:
        missing.length === 0
          ? undefined
          : {
              problem: "Some images have no alt attribute.",
              reason:
                "Alt text describes images to screen readers and search engines, and aids image search.",
              howToFix:
                'Add descriptive alt text to meaningful images; use alt="" only for decorative ones.',
              priority: "medium",
              impact: "Medium — affects accessibility and image SEO.",
            },
    }),
  ];
}
