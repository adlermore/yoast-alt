/** Small, deterministic formatting helpers (fixed locale → hydration-safe). */

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}

/** Format an ISO timestamp for display (fixed en-US locale). */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return DATE_FORMAT.format(date);
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

/** Turn an absolute URL into a readable breadcrumb (`example.com › blog › post`). */
export function prettyUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return [parsed.hostname, ...segments].join(" › ");
  } catch {
    return url;
  }
}
