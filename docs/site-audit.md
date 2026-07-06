# Site Auditor & Orphan Pages (Surik Tools)

The Surik tools crawl a whole site and report site-wide problems a single-page
analysis can't see: broken links, duplicate titles, redirect chains, orphaned
pages. This document explains how the crawl works, every audit rule, and how
the health score is computed.

## How the crawl works

- Starts at the URL you enter, follows internal links breadth-first, and also
  reads the XML sitemap for URL discovery.
- **Respects robots.txt** (there is an "ignore robots" switch for auditing
  staging sites — never use it on sites we don't own).
- Configurable limits: max pages (default 150), max depth, delay between
  requests. Larger sites → raise max pages, expect a longer run.
- Per page it records: status code, redirect target, title, meta description,
  H1s, word count, a content fingerprint, noindex, canonical, and all internal
  links. JavaScript is **not** executed.
- Depth = clicks from the homepage. Depth −1 means the page was found only in
  the sitemap, never via a link.

## Reading an issue

Every issue row shows a **severity** and a **calibration** tag:

| Severity | Meaning |
| --- | --- |
| **Critical** | Blocks crawling/indexing or destroys signals. Fix now. |
| **Warning** | Real problem, plan the fix. |
| **Notice** | Best-practice gap or something to verify. |

| Calibration | Meaning |
| --- | --- |
| **CONFIRMED** | Mechanically verified from crawl data — trust it. |
| **POSSIBLE** | Probably a problem, but there are legitimate exceptions. |
| **CHECK** | A signal worth a human look, not a verdict. |

A `CONFIRMED critical` is actionable as-is; a `CHECK notice` is a prompt to
open the page and judge for yourself.

## The audit rules

### Crawling & indexing

| Rule | Severity / Calibration | What it means |
| --- | --- | --- |
| Server errors (5xx) | Critical / CONFIRMED | Pages returning 5xx can't be crawled or indexed. |
| Broken internal links | Critical / CONFIRMED | Internal links to 4xx/5xx targets, with the linking page named. |
| Not-found / client errors (4xx) | Warning / CONFIRMED | Crawled URLs answering 4xx. |
| Noindex pages | Warning / CONFIRMED | Pages carrying a noindex directive — verify each is intentional. |
| Redirecting URLs | Notice / POSSIBLE | Internal links passing through a redirect — link straight to the destination. |
| **Redirect loops** | Critical / CONFIRMED | Redirects that circle back on themselves (A → B → A). These URLs never resolve. |
| **Redirect chains** | Warning / CONFIRMED | Multi-hop redirects (A → B → C). Each hop wastes crawl budget and leaks link equity — point A straight at the final URL. |

### Canonicals

| Rule | Severity / Calibration | What it means |
| --- | --- | --- |
| Cross-host canonical | Warning / POSSIBLE | Canonical points at another domain — deindexes the page if unintended. |
| Missing canonical | Notice / POSSIBLE | No canonical declared. |
| **Canonical → broken page** | Critical / CONFIRMED | The canonical target returns 4xx/5xx. Google ignores the canonical; indexing becomes unpredictable. |
| **Canonical → redirect** | Warning / CONFIRMED | The canonical target itself redirects. Point the canonical at the final URL. |
| **Canonical → noindex page** | Warning / CONFIRMED | The canonical target is noindexed — contradictory signals that can drop both URLs. |

### On-page

| Rule | Severity / Calibration | What it means |
| --- | --- | --- |
| Missing title | Warning / POSSIBLE | Pages without a `<title>`. |
| Duplicate titles | Warning / POSSIBLE | The same title on multiple pages — Google may pick which one to rank. |
| Missing meta description | Notice / POSSIBLE | Google will generate the snippet itself. |
| Duplicate meta descriptions | Notice / POSSIBLE | Reused descriptions across pages. |
| Missing H1 | Warning / CHECK | No H1 heading found (some templates render it via JS — check). |
| Multiple H1s | Notice / CHECK | More than one H1 — verify the document outline. |
| Thin content | Notice / CHECK | Under 100 words of visible text — often fine (contact pages), sometimes not. |
| Duplicate content | Warning / CHECK | Identical visible text (≥50 words) on different URLs. |

### Structure

| Rule | Severity / Calibration | What it means |
| --- | --- | --- |
| Orphan pages | Warning / POSSIBLE | 200-OK pages with zero inbound internal links (reached via sitemap only). |
| Deep pages (≥4 clicks) | Notice / CHECK | Four+ clicks from the homepage — little link equity reaches them. |

## The health score

Transparent formula, no magic: start at 100, subtract a penalty per non-empty
issue type — **critical −16, warning −6, notice −1.5** — scaled by how much of
the site is affected (an issue touching 2 of 300 pages costs ~35% of its
penalty; one touching half the site costs nearly all of it). Grades use the
same bands as the page analyzer (90+ Excellent … <25 Critical).

Because the penalty is per issue *type*, one systemic problem (say, duplicate
descriptions from a template) costs the same whether it hits 40 or 400 pages
once saturated — fix the template, not each page.

## Orphan Pages tool

Compares sitemap URLs (or a pasted URL list) against pages actually reachable
by crawling internal links. Each URL is classified:

- **Orphan** — 200 OK but zero internal links point at it. Users and crawlers
  can only find it via the sitemap. Either link it from relevant pages or ask
  whether it should exist.
- **JS-dependent** — only "linked" from markup that requires JavaScript
  (crawlers that don't render JS won't find it; treat as at-risk).
- **Never crawled** — in the sitemap but the crawl never reached or fetched it
  (blocked, over the page/depth limit, or erroring) — no verdict possible.
- **Linked** — fine; internal links point at it.

The summary also reports whether the crawl hit its page or depth limit — if it
did, "never crawled" rows may just be out-of-budget, so raise the limits and
re-run before acting.

Orphans are the classic "we published it and forgot it" failure — run this
after every large content push or migration.

## Exports

Every audit can be exported as **Markdown** (for tickets), **XLSX** (for
client spreadsheets), or **PDF** (for reporting) via the export bar above the
results.
