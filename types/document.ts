/**
 * The normalized page model.
 *
 * Every input source (pasted HTML, a fetched URL, or raw article text) is
 * reduced to a single {@link ParsedDocument}. Analyzers only ever consume this
 * shape, so they remain agnostic to where the content originated. This is the
 * central contract of the application.
 */

export type DocumentSource = "html" | "url" | "text";

export type ImageFormat =
  | "jpg"
  | "png"
  | "webp"
  | "avif"
  | "gif"
  | "svg"
  | "ico"
  | "bmp"
  | "unknown";

/** `<head>` derived metadata. */
export interface DocumentMeta {
  title: string | null;
  titleLength: number;
  description: string | null;
  descriptionLength: number;
  canonical: string | null;
  robots: string | null;
  viewport: string | null;
  charset: string | null;
  /** The `lang` attribute on `<html>`. */
  language: string | null;
  favicon: string | null;
  author: string | null;
  keywords: string | null;
  themeColor: string | null;
}

export interface OpenGraphData {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string | null;
  type: string | null;
  siteName: string | null;
  locale: string | null;
  /** Every `og:*` property, verbatim. */
  raw: Record<string, string>;
}

export interface TwitterCardData {
  card: string | null;
  title: string | null;
  description: string | null;
  image: string | null;
  site: string | null;
  creator: string | null;
  /** Every `twitter:*` property, verbatim. */
  raw: Record<string, string>;
}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingNode {
  level: HeadingLevel;
  text: string;
  id: string | null;
  /** Zero-based position among all headings in document order. */
  order: number;
}

export interface ImageNode {
  src: string | null;
  /** Absolute URL when a base URL was available, otherwise the raw `src`. */
  resolvedSrc: string | null;
  alt: string | null;
  hasAlt: boolean;
  title: string | null;
  width: string | null;
  height: string | null;
  loading: string | null;
  decoding: string | null;
  srcset: string | null;
  sizes: string | null;
  format: ImageFormat;
  isSvg: boolean;
  /** 1x1 or otherwise negligible dimensions — likely a tracking pixel. */
  isTrackingPixel: boolean;
  /** Declares both intrinsic width and height (helps prevent layout shift). */
  hasDimensions: boolean;
  /** Uses `srcset`/`sizes` for responsive delivery. */
  isResponsive: boolean;
}

export interface LinkNode {
  href: string | null;
  resolvedHref: string | null;
  text: string;
  rel: string | null;
  target: string | null;
  isInternal: boolean;
  isExternal: boolean;
  /** Pure in-page fragment link (`#section`). */
  isAnchor: boolean;
  isMailto: boolean;
  isTel: boolean;
  /** No visible text, `aria-label`, `title`, or child image alt. */
  isEmptyAnchor: boolean;
  nofollow: boolean;
  sponsored: boolean;
  ugc: boolean;
}

export type StructuredDataFormat = "json-ld" | "microdata" | "rdfa";

export interface StructuredDataItem {
  /** Resolved `@type` value(s). Empty when absent or unparseable. */
  types: string[];
  format: StructuredDataFormat;
  /** Raw source of the block. */
  raw: string;
  /** Parsed value when {@link valid}, otherwise `null`. */
  data: unknown;
  valid: boolean;
  error: string | null;
}

export interface ContentStats {
  /** Full visible text extracted from `<body>`. */
  text: string;
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  sentenceCount: number;
  listCount: number;
  tableCount: number;
  readingTimeMinutes: number;
}

export interface DocumentStructure {
  hasHeader: boolean;
  hasFooter: boolean;
  hasNav: boolean;
  hasMain: boolean;
  hasAside: boolean;
  hasBreadcrumbs: boolean;
  scriptCount: number;
  noscriptCount: number;
  formCount: number;
  buttonCount: number;
  iframeCount: number;
}

export interface RawHtml {
  value: string;
  sizeBytes: number;
}

export interface ParsedDocument {
  /** Source URL when known (URL analysis), otherwise `null`. */
  url: string | null;
  source: DocumentSource;
  meta: DocumentMeta;
  openGraph: OpenGraphData;
  twitter: TwitterCardData;
  headings: HeadingNode[];
  images: ImageNode[];
  links: LinkNode[];
  structuredData: StructuredDataItem[];
  content: ContentStats;
  structure: DocumentStructure;
  html: RawHtml;
  /** ISO timestamp injected by the caller (keeps parsing deterministic). */
  parsedAt: string;
  /** Non-fatal issues encountered during parsing. */
  warnings: string[];
}
