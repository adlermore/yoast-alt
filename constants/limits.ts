/**
 * Input guardrails. Parsing is done in-memory with Cheerio/parse5, which builds
 * a DOM tree many times larger than the source string — so an unbounded paste
 * can exhaust RAM and hang the machine. These caps keep a single analysis well
 * within a safe memory envelope.
 */

/** Largest HTML paste we will parse. ~2 MB is huge for a single page. */
export const MAX_HTML_CHARS = 2_000_000;

/** User-facing message when the paste exceeds {@link MAX_HTML_CHARS}. */
export const HTML_TOO_LARGE_MESSAGE =
  "That HTML is too large to analyze (~2 MB limit). Trim it to the page or section you want to inspect.";
