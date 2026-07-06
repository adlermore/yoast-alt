/**
 * URL helpers for link/image classification. All functions are total: they
 * never throw, returning `null`/sensible fallbacks on malformed input.
 */

import type { ImageFormat } from "@/types";

/** Resolve a possibly-relative href against a base URL. Returns `null` if unresolvable. */
export function resolveUrl(href: string, baseUrl?: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  try {
    return baseUrl ? new URL(trimmed, baseUrl).href : new URL(trimmed).href;
  } catch {
    return null;
  }
}

export function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

export type LinkKind =
  | "internal"
  | "external"
  | "anchor"
  | "mailto"
  | "tel"
  | "other";

/**
 * Classify a link's destination. Without a base URL, absolute http(s) links are
 * treated as external and relative links as internal (best-effort heuristic).
 */
export function classifyLink(href: string, baseUrl?: string): LinkKind {
  const trimmed = href.trim();
  if (!trimmed) return "other";
  if (trimmed.startsWith("#")) return "anchor";
  if (trimmed.startsWith("mailto:")) return "mailto";
  if (trimmed.startsWith("tel:")) return "tel";

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("blob:")
  ) {
    return "other";
  }

  const isAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
  if (!isAbsolute) return "internal";

  if (!baseUrl) return "external";
  const baseHost = getHostname(baseUrl);
  const targetHost = getHostname(trimmed);
  if (!baseHost || !targetHost) return "external";
  return baseHost === targetHost ? "internal" : "external";
}

const EXTENSION_TO_FORMAT: Record<string, ImageFormat> = {
  jpg: "jpg",
  jpeg: "jpg",
  jfif: "jpg",
  png: "png",
  webp: "webp",
  avif: "avif",
  gif: "gif",
  svg: "svg",
  ico: "ico",
  bmp: "bmp",
};

/** Derive an image format from a `src`, tolerating query strings and data URIs. */
export function getImageFormat(src: string | null): ImageFormat {
  if (!src) return "unknown";
  const trimmed = src.trim().toLowerCase();

  if (trimmed.startsWith("data:image/")) {
    const mime = trimmed.slice("data:image/".length).split(/[;,]/)[0];
    if (mime === "jpeg") return "jpg";
    if (mime === "svg+xml") return "svg";
    return (EXTENSION_TO_FORMAT[mime] ?? "unknown") as ImageFormat;
  }

  const withoutQuery = trimmed.split(/[?#]/)[0];
  const lastDot = withoutQuery.lastIndexOf(".");
  if (lastDot === -1) return "unknown";
  const ext = withoutQuery.slice(lastDot + 1);
  return EXTENSION_TO_FORMAT[ext] ?? "unknown";
}
