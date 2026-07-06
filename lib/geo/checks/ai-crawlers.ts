import type { AnalysisContext, Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";

/**
 * robots.txt access for AI crawlers. Blocking search/assistant bots removes
 * the site from AI answers and citations; blocking training bots is a policy
 * choice, so it is surfaced as information rather than penalized.
 */
export function checkAiCrawlers(
  _doc: ParsedDocument,
  context: AnalysisContext,
): Check[] {
  const http = context.http;

  if (!http) {
    return [
      createCheck({
        id: "geo-ai-crawlers",
        title: "AI crawler access",
        status: "info",
        detail:
          "Crawler access is read from robots.txt — analyze the page by URL to run this check.",
      }),
    ];
  }

  if (!http.robotsTxtFound || !http.aiBots) {
    return [
      createCheck({
        id: "geo-ai-search-access",
        title: "AI search crawler access",
        status: "pass",
        detail:
          "No readable robots.txt was found, so every AI crawler can access the site by default.",
        weight: 3,
      }),
    ];
  }

  const blocked = http.aiBots.filter((bot) => !bot.allowed);
  const blockedAnswerBots = blocked.filter((bot) => bot.role !== "training");
  const blockedTrainingBots = blocked.filter((bot) => bot.role === "training");
  const checks: Check[] = [];

  if (blockedAnswerBots.length > 0) {
    const list = blockedAnswerBots
      .map((bot) => `${bot.agent} (${bot.platform})`)
      .join(", ");
    checks.push(
      createCheck({
        id: "geo-ai-search-access",
        title: "AI search crawler access",
        status: "error",
        detail: `robots.txt blocks answer-driving crawlers: ${list}.`,
        weight: 3,
        recommendation: {
          problem:
            "Crawlers that power AI search results and live answers are blocked from the site root.",
          reason:
            "ChatGPT Search, Perplexity, and assistant browsing cite only pages their crawlers can fetch — a root disallow removes the site from AI answers entirely.",
          howToFix:
            "In robots.txt, remove the root Disallow for these user-agents (or add explicit Allow rules): " +
            blockedAnswerBots.map((bot) => bot.agent).join(", ") +
            ".",
          priority: "high",
          impact: "High — the site cannot be cited by AI search platforms.",
        },
      }),
    );
  } else {
    checks.push(
      createCheck({
        id: "geo-ai-search-access",
        title: "AI search crawler access",
        status: "pass",
        detail:
          "All answer-driving AI crawlers (ChatGPT Search, Perplexity, assistant browsing) are allowed.",
        weight: 3,
      }),
    );
  }

  if (blockedTrainingBots.length > 0) {
    const list = blockedTrainingBots.map((bot) => bot.agent).join(", ");
    checks.push(
      createCheck({
        id: "geo-ai-training-access",
        title: "AI training crawler access",
        status: "info",
        detail:
          `Training crawlers blocked: ${list}. This is a legitimate content-policy choice, ` +
          "but models trained without the site know less about the brand.",
      }),
    );
  } else {
    checks.push(
      createCheck({
        id: "geo-ai-training-access",
        title: "AI training crawler access",
        status: "pass",
        detail:
          "Model-training crawlers (GPTBot, ClaudeBot, Google-Extended, …) are allowed.",
        weight: 1,
      }),
    );
  }

  return checks;
}
