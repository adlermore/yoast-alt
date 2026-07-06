import type { CheerioAPI } from "cheerio";
import type { ImageNode } from "@/types";
import { getImageFormat, resolveUrl } from "@/lib/html";
import { cleanAttr } from "../dom";

/** A declared dimension of 1px (or 0) suggests a tracking pixel, not content. */
function isTiny(dimension: string | null): boolean {
  if (dimension === null) return false;
  const value = Number.parseInt(dimension, 10);
  return Number.isFinite(value) && value <= 1;
}

export function extractImages($: CheerioAPI, baseUrl?: string): ImageNode[] {
  const images: ImageNode[] = [];

  $("img").each((_, el) => {
    const $el = $(el);
    const src =
      cleanAttr($el.attr("src")) ??
      cleanAttr($el.attr("data-src")) ??
      cleanAttr($el.attr("data-lazy-src"));
    const altAttr = $el.attr("alt");
    const width = cleanAttr($el.attr("width"));
    const height = cleanAttr($el.attr("height"));
    const srcset =
      cleanAttr($el.attr("srcset")) ?? cleanAttr($el.attr("data-srcset"));
    const sizes = cleanAttr($el.attr("sizes"));
    const format = getImageFormat(src);

    images.push({
      src,
      resolvedSrc: src ? (resolveUrl(src, baseUrl) ?? src) : null,
      alt: altAttr !== undefined ? altAttr : null,
      hasAlt: altAttr !== undefined && altAttr.trim().length > 0,
      title: cleanAttr($el.attr("title")),
      width,
      height,
      loading: cleanAttr($el.attr("loading")),
      decoding: cleanAttr($el.attr("decoding")),
      srcset,
      sizes,
      format,
      isSvg: format === "svg",
      isTrackingPixel: isTiny(width) && isTiny(height),
      hasDimensions: width !== null && height !== null,
      isResponsive: srcset !== null,
    });
  });

  return images;
}
