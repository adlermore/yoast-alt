/**
 * Known AI crawler registry + per-agent robots.txt evaluation.
 *
 * Unlike lib/crawl/robots.ts (which only evaluates the `*` group for our own
 * crawler), this module resolves the robots.txt group that applies to each AI
 * bot — an exact user-agent token match wins over the `*` group — and asks one
 * question per bot: may it fetch the site root? A root disallow is the
 * meaningful GEO signal (sites block AI bots wholesale, not per-path).
 */

import type { AiBotAccess, AiBotRole } from "@/types";

export interface AiBotSpec {
  agent: string;
  platform: string;
  role: AiBotRole;
}

/**
 * Crawlers that decide AI visibility. `search`/`assistant` bots feed citations
 * and live answers; `training` bots feed model knowledge — blocking those is a
 * legitimate policy choice, so the analyzer treats them differently.
 */
export const AI_BOTS: readonly AiBotSpec[] = [
  { agent: "OAI-SearchBot", platform: "ChatGPT Search (index & citations)", role: "search" },
  { agent: "ChatGPT-User", platform: "ChatGPT (user-requested browsing)", role: "assistant" },
  { agent: "PerplexityBot", platform: "Perplexity (search index)", role: "search" },
  { agent: "Perplexity-User", platform: "Perplexity (user-requested browsing)", role: "assistant" },
  { agent: "Claude-User", platform: "Claude (user-requested browsing)", role: "assistant" },
  { agent: "GPTBot", platform: "OpenAI (model training)", role: "training" },
  { agent: "ClaudeBot", platform: "Anthropic (model training)", role: "training" },
  { agent: "Google-Extended", platform: "Google Gemini (model training)", role: "training" },
  { agent: "Applebot-Extended", platform: "Apple Intelligence (model training)", role: "training" },
  { agent: "CCBot", platform: "Common Crawl (feeds many training sets)", role: "training" },
  { agent: "Meta-ExternalAgent", platform: "Meta AI (model training)", role: "training" },
  { agent: "Bytespider", platform: "ByteDance (model training)", role: "training" },
];

interface RuleGroup {
  allow: string[];
  disallow: string[];
}

/** Parse robots.txt into per-user-agent rule groups (tokens lower-cased). */
function parseGroups(text: string): Map<string, RuleGroup> {
  const groups = new Map<string, RuleGroup>();
  // Agents the current rules apply to; multiple consecutive User-agent lines
  // form one group per the REP.
  let currentAgents: string[] = [];
  let sawRuleSinceAgent = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === "user-agent") {
      if (sawRuleSinceAgent) currentAgents = [];
      sawRuleSinceAgent = false;
      const token = value.toLowerCase();
      if (token) {
        currentAgents.push(token);
        if (!groups.has(token)) groups.set(token, { allow: [], disallow: [] });
      }
      continue;
    }

    if (field === "allow" || field === "disallow") {
      sawRuleSinceAgent = true;
      for (const agent of currentAgents) {
        const group = groups.get(agent)!;
        if (field === "disallow") {
          if (value) group.disallow.push(value);
        } else if (value) {
          group.allow.push(value);
        }
      }
    }
  }

  return groups;
}

function patternMatches(pattern: string, path: string): boolean {
  let body = pattern;
  const anchored = body.endsWith("$");
  if (anchored) body = body.slice(0, -1);
  const escaped = body.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}${anchored ? "$" : ""}`).test(path);
}

function longestMatch(patterns: string[], path: string): number {
  let best = -1;
  for (const pattern of patterns) {
    if (patternMatches(pattern, path)) best = Math.max(best, pattern.length);
  }
  return best;
}

/** Whether `group` allows fetching `path` under Google's longest-match rule. */
function groupAllows(group: RuleGroup, path: string): boolean {
  const disallowed = longestMatch(group.disallow, path);
  if (disallowed === -1) return true;
  return longestMatch(group.allow, path) >= disallowed;
}

/**
 * Evaluate root access for every known AI bot against a robots.txt body.
 * A bot's own user-agent group takes precedence; otherwise the `*` group
 * applies; with neither, access is allowed.
 */
export function evaluateAiBotAccess(robotsTxt: string): AiBotAccess[] {
  const groups = parseGroups(robotsTxt);
  const star = groups.get("*");

  return AI_BOTS.map(({ agent, platform, role }) => {
    const group = groups.get(agent.toLowerCase()) ?? star;
    const allowed = group ? groupAllows(group, "/") : true;
    return { agent, platform, role, allowed };
  });
}
