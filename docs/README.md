# Searchlight — SEO Team Guide

Searchlight is our in-house SEO workbench: a Yoast-style page analyzer plus a
site crawler, with no database — every report is a JSON file on disk. This
guide is written for the SEO team, not developers: it explains what each tool
does, how to read the results, and when to reach for which tool.

## The tools

| Tool | Where | What it answers |
| --- | --- | --- |
| Analyze URL / HTML / Text | **Analyze** section | "How well is this one page optimized?" — full check suite with scores |
| Content Editor | Insights → Content | Write/paste copy and re-check it as you edit |
| HTML Cleaner | Insights → HTML Cleaner | Strip junk markup from copy before publishing |
| PageSpeed | Insights → PageSpeed | Real-world Core Web Vitals (CrUX field data) + Lighthouse lab data via Google PSI |
| Technical SEO | Insights → Technical SEO | Response-level checks: status, headers, robots.txt, sitemap, mixed content |
| GEO / AI Search | Insights → GEO / AI Search | Can AI platforms (ChatGPT, Perplexity, AI Overviews) crawl and cite this site? |
| Keyword | Insights → Keyword | Focus-keyword targeting: density and placement |
| Readability | Insights → Readability | Sentence length, passive voice, transitions, structure |
| Schema | Insights → Schema | Structured-data detection and validation |
| Site Auditor | Surik Tools → Site Auditor | Site-wide crawl (up to ~150–500 pages): broken links, duplicates, redirects, canonicals |
| Orphan Pages | Surik Tools → Orphan Pages | Pages with no internal links pointing at them |
| Reports / History | Library | Saved analyses you can reopen and compare over time |

Full check-by-check reference: **[checks-reference.md](checks-reference.md)**.
Crawler and audit rules: **[site-audit.md](site-audit.md)**.

## How to read results

### Statuses

Every finding is one of four statuses:

- 🟢 **Pass** — the element meets our standard. Nothing to do.
- 🟡 **Warning** — suboptimal, worth fixing when you touch the page. Half credit in the score.
- 🔴 **Error** — actively hurting the page. Fix these first. Zero credit in the score.
- ⚪ **Info** — context or a judgment call (e.g. blocking AI training bots). Never affects the score.

### Scores and grades

Each analyzer scores 0–100 as a **weighted average** of its checks
(pass = 100, warning = 50, error = 0; heavier checks like "title exists"
count 2–3× more than minor ones). The overall score is the plain average of
all analyzer scores.

| Score | Grade |
| --- | --- |
| 90–100 | Excellent |
| 75–89 | Good |
| 50–74 | Needs work |
| 25–49 | Poor |
| 0–24 | Critical |

A "Good" page with one red error is usually a better use of your time than a
"Needs work" page with ten yellow warnings — errors are the things Google
actually punishes or truncates.

### Recommendations

Every warning/error expands into four fields: **Problem** (what's wrong),
**Why** (why Google/users care), **How to fix** (the concrete edit), and
**Impact** (how much it matters). Work top-down: the list is sorted
errors → warnings → passes.

## Pixel widths, not character counts

Titles and descriptions are measured in **pixels**, the way Google actually
truncates them — ~580px for titles, ~920px for descriptions on desktop.
Character counts are shown for reference, but a 60-character title of wide
letters ("W", "M") can truncate while 65 narrow characters fit fine. The SERP
preview under **Meta & Social** shows a live width meter for both:
green = fits, amber = under-using the space, red = will be cut off.

## GEO / AI Search — what it is

GEO (Generative Engine Optimization) is visibility in AI answers: Google AI
Overviews, ChatGPT Search, Perplexity, Copilot. The analyzer checks two things:

1. **Access** — does robots.txt block AI crawlers? Blocking *answer* bots
   (OAI-SearchBot, PerplexityBot, ChatGPT-User) removes us from AI citations
   entirely and is flagged red. Blocking *training* bots (GPTBot, ClaudeBot,
   Google-Extended) is a policy choice and is flagged as info only. It also
   checks for an `/llms.txt` file — an emerging convention: a short Markdown
   index of the site addressed to AI assistants.
2. **Citability** — can an LLM lift a self-contained answer from the page?
   Question-form headings, paragraphs short enough to quote (~40–100 words),
   facts in lists/tables instead of prose, and date-stamped content.

Access checks need a URL analysis (they read robots.txt); citability checks
also work on pasted HTML or text.

## Typical workflows

**New page before publishing** → Analyze HTML (or Content Editor), fix all
errors, aim for 90+ on SEO, check the SERP preview meters.

**Page not performing** → Analyze URL with the focus keyword set; check
Keyword and GEO tabs; then PageSpeed for Core Web Vitals.

**Monthly site health** → Site Auditor on the domain; work the issue list
top-down (critical → warning → notice); re-run Orphan Pages after larger
content pushes.

**After a redesign/migration** → Site Auditor immediately: look at redirect
chains, canonical conflicts, and 4xx spikes — the classic migration wounds.

## Limits to keep in mind

- The fetcher does **not execute JavaScript** — what you analyze is the
  server-rendered HTML. For JS-heavy pages, results may differ from what
  Google renders.
- The crawler respects robots.txt and caps pages/depth (configurable on the
  audit form).
- Settings → Analyzers lets you toggle Readability, Technical, Schema, and
  GEO on/off; SEO always runs, Keyword runs whenever a focus keyword is set.
