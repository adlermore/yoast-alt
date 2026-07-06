/**
 * Minimal, dependency-free robots.txt parser + matcher.
 *
 * We evaluate the `*` user-agent group (the crawler presents as a generic
 * browser). Matching follows Google's longest-match rule: the most specific
 * (longest) matching Allow or Disallow pattern wins, with Allow winning ties.
 *
 * The §10.1 pitfall (a WAF answering robots.txt with 403 to the default library
 * UA, which naive parsers read as "disallow everything") is handled at the
 * fetch layer — this module only ever sees text or is given an allow-all.
 */

export interface RobotsRules {
  isAllowed(pathWithQuery: string): boolean;
  sitemaps: string[];
}

interface Pattern {
  raw: string;
  re: RegExp;
}

function toRegex(pattern: string): Pattern {
  let body = pattern;
  const anchored = body.endsWith("$");
  if (anchored) body = body.slice(0, -1);
  const escaped = body
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return { raw: pattern, re: new RegExp(`^${escaped}${anchored ? "$" : ""}`) };
}

function longestMatch(patterns: Pattern[], path: string): number {
  let best = -1;
  for (const { raw, re } of patterns) {
    if (re.test(path)) best = Math.max(best, raw.length);
  }
  return best;
}

/** A permissive matcher — used when robots.txt is unreadable or ignored. */
export function allowAllRobots(): RobotsRules {
  return { isAllowed: () => true, sitemaps: [] };
}

export function parseRobots(text: string): RobotsRules {
  const allow: Pattern[] = [];
  const disallow: Pattern[] = [];
  const sitemaps: string[] = [];

  // Track whether the current group of User-agent lines targets "*".
  let inStarGroup = false;
  let sawRuleSinceAgent = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === "sitemap") {
      if (value) sitemaps.push(value);
      continue;
    }

    if (field === "user-agent") {
      // A new agent line after a rule starts a fresh group.
      if (sawRuleSinceAgent) inStarGroup = false;
      sawRuleSinceAgent = false;
      if (value === "*") inStarGroup = true;
      continue;
    }

    if (field === "allow" || field === "disallow") {
      sawRuleSinceAgent = true;
      if (!inStarGroup) continue;
      if (field === "disallow") {
        if (value === "") continue; // empty Disallow = allow all
        disallow.push(toRegex(value));
      } else if (value) {
        allow.push(toRegex(value));
      }
    }
  }

  return {
    sitemaps,
    isAllowed(path: string): boolean {
      const d = longestMatch(disallow, path);
      if (d === -1) return true;
      const a = longestMatch(allow, path);
      return a >= d;
    },
  };
}
