# Checks Reference

Every check the page analyzers can raise, with exact thresholds and what to do
about each. See [README.md](README.md) for how statuses, weights, and scores
work in general.

**Weight** = how much a check moves the analyzer's score (most checks are 1;
core elements are 2–3). **Info** checks never affect the score.

---

## SEO analyzer

Runs on every analysis.

### Title & description

| Check | Pass | Flag | How to fix |
| --- | --- | --- | --- |
| Title tag *(w3)* | `<title>` present | **Error** if missing | Add a unique, descriptive title of 30–60 characters. |
| Title width *(w2)* | 285–580 px rendered width | **Error** &gt;580px (truncated), **Warning** &lt;285px (wasted space) | Trim until it fits ~580px (~60 chars), primary topic first; or expand toward 30–60 chars. |
| Meta description *(w3)* | present | **Error** if missing | Add a 120–160 character description. |
| Description width *(w1)* | 680–920 px | **Warning** &gt;920px or &lt;680px | Shorten toward ≤160 chars or expand toward 120–160 chars, leading with the key info. |

Widths are measured the way Google truncates — rendered pixels (20px Arial for
titles, 14px for descriptions), not characters. Character counts are shown in
each check's detail for reference.

### Content & headings

| Check | Pass | Flag | How to fix |
| --- | --- | --- | --- |
| Content length *(w2)* | ≥600 words | **Error** &lt;300, **Warning** 300–599 | Cover the topic properly; 600+ words for pages that should rank. |
| H1 heading *(w2)* | exactly one H1 exists | **Error** if none | Add one H1 describing the primary subject. |
| Single H1 *(w1)* | — | **Warning** if multiple H1s | Keep one H1; demote the rest to H2–H6. |
| Heading hierarchy *(w1)* | no skipped levels | **Warning** on skips (H2→H4) | Step down one level at a time. |
| Empty headings *(w1)* | — | **Warning** if any heading has no text | Fill or remove empty heading elements. |

### Indexability & links

| Check | Pass | Flag | How to fix |
| --- | --- | --- | --- |
| Indexability *(w3)* | no `noindex` in robots meta | **Error** if noindexed | Remove `noindex` (unless the page really must stay out of search). |
| Robots nofollow *(w1)* | — | **Warning** if robots meta has `nofollow` | Remove unless intentionally withholding all links. |
| Canonical URL *(w2)* | `<link rel="canonical">` present | **Warning** if missing | Add a canonical pointing at the preferred absolute URL. |
| HTTPS *(w2)* | page served over HTTPS | **Error** if not | Serve over HTTPS, redirect all HTTP. |
| Internal links *(w1)* | at least one | **Warning** if none | Add contextual links to related pages. |
| Empty link anchors *(w1)* | — | **Warning** if links have no text/label | Add anchor text, or `aria-label` for icon links. |

### Page meta, social, images, schema summary

| Check | Pass | Flag | How to fix |
| --- | --- | --- | --- |
| Responsive viewport *(w2)* | viewport meta present | **Error** if missing | `<meta name="viewport" content="width=device-width, initial-scale=1">` |
| Character encoding *(w1)* | charset declared | **Warning** if missing | `<meta charset="utf-8">` first in `<head>`. |
| Language attribute *(w1)* | `<html lang>` set | **Warning** if missing | Set `lang` to the page language. |
| Favicon *(w1)* | present | Info if missing | Add one when convenient. |
| Open Graph tags *(w1)* | og:title + og:description + og:image | **Warning** if any missing | Add the three core OG tags (controls how shares look). |
| Twitter card *(w1)* | present | Info if absent (OG is the fallback) | Optional. |
| Image alt text *(w2)* | every content image has `alt` | **Warning** if any missing (tracking pixels excluded) | Descriptive alt for meaningful images; `alt=""` for decorative. |
| Structured data *(w1)* | ≥1 block found | **Warning** if none | Add relevant JSON-LD (see Schema analyzer). |
| Structured data validity *(w2)* | all blocks parse | **Error** if any is broken | Fix the JSON; validate with Google's Rich Results Test. |

---

## Keyword analyzer

Runs only when a focus keyword is set. Without one it shows a single info note
and does not affect the score.

### Placement — pass when the keyword appears there, warning when not

| Location | Weight | Priority |
| --- | --- | --- |
| Title | 3 | high — the strongest placement signal, keep it near the start |
| Meta description | 2 | medium |
| H1 | 2 | medium |
| Introduction (first 100 words) | 2 | medium |
| Subheadings (any H2–H6) | 1 | low |
| URL slug | 1 | low — hyphen-separated |
| Image alt (any) | 1 | low |

### Density *(w3)* — occurrences relative to total words

| Density | Verdict |
| --- | --- |
| 0 (keyword absent from body) | **Error** — use the keyword naturally in the text |
| &lt; 0.5% | **Warning** — a few more natural mentions |
| 0.5–2.5% | **Pass** |
| 2.5–3% | **Warning** — swap some exact matches for synonyms |
| ≥ 3% | **Error** — keyword stuffing; cut repetitions |

Multi-word keywords are weighted by word count, so density is comparable
across short and long keyphrases.

---

## Readability analyzer

All checks skip texts under 50 words (too short to judge).

| Check | Pass | Flag | How to fix |
| --- | --- | --- | --- |
| Reading ease *(w2)* | Flesch ≥ 60 (8th–9th grade) | **Warning** 30–59, **Error** &lt;30 | Shorter sentences, simpler words, break ideas into steps. |
| Sentence length *(w2)* | ≤25% of sentences over 20 words | **Warning** above that | Split long sentences; the flagged ones are highlighted inline in the Text tab. |
| Paragraph length *(w1)* | average ≤150 words | **Warning** above | Break paragraphs into single-idea blocks. |
| Subheading distribution *(w1)* | a subheading roughly every ≤300 words (checked only on 300+ word texts) | **Warning** if sparse or none | Add descriptive H2/H3s every ~300 words. |
| Passive voice *(w1)* | ≤10% of sentences | **Warning** above | Rewrite in active voice; sample sentences are listed in the check. |
| Transition words *(w1)* | ≥30% of sentences contain one | **Warning** below | Add connectives: "however", "for example", "as a result". |

The **Content Editor** (Insights → Content) applies the same standards as an
interactive scorecard while you write: min 300 words, ≤20 words/sentence
(≤25% long tolerated), ≤10% passive, Flesch ≥ 60 — all four adjustable.

---

## Technical analyzer

Document-level checks run on any input; HTTP-level checks need a URL analysis.

| Check | Pass | Flag | How to fix |
| --- | --- | --- | --- |
| Mixed content *(w2)* | no `http://` resources on an HTTPS page | **Error** if any | Update resource URLs to https. |
| URL structure *(w1)* | ≤100 chars, lowercase, no underscores, ≤2 query params | **Warning** on any issue | Lowercase hyphenated words, short paths. |
| Main content landmark *(w1)* | `<main>` present | Info if absent | Wrap primary content in a single `<main>`. |
| Iframe usage *(w1)* | — | Info when iframes exist | Crawlers index iframe content poorly — just be aware. |
| HTTP status *(w3)* | 2xx | **Error** ≥400, **Warning** 3xx | Fix the error / link the final URL directly. |
| X-Robots-Tag *(w3 if noindex)* | — | **Error** if header carries `noindex` | Remove it from the server response. |
| Compression *(w1)* | gzip/brotli/zstd enabled | **Warning** if not | Enable at the server or CDN. |
| Cache-Control *(w1)* | header present | Info if absent | Set sensible caching. |
| HSTS *(w1)* | header present on HTTPS | Info if absent | Optional hardening. |
| robots.txt *(w1)* | reachable | **Warning** if not | Publish one; reference the sitemap in it. |
| XML sitemap *(w1)* | reachable | **Warning** if not | Publish and reference from robots.txt. |

---

## Schema analyzer

| Check | Pass | Flag | How to fix |
| --- | --- | --- | --- |
| Structured data present *(w2)* | ≥1 block | **Warning** if none | Add JSON-LD for the page type. |
| Validity *(w2)* | all blocks parse | **Error** if any is broken JSON | Fix syntax; validate externally. |
| Recommended types *(w1)* | Organization + WebSite + BreadcrumbList all present | Info listing what's missing | Add site-wide basics when practical. |
| Required properties *(w2)* | each detected type has its required props | **Warning** if missing | Add the missing properties (see below). |

Required properties by type: **Article/BlogPosting/NewsArticle** headline,
author, datePublished · **Product** name, image, offers · **Offer** price,
priceCurrency · **Organization** name, url · **LocalBusiness** name, address,
telephone · **WebSite** name, url · **WebPage** name · **BreadcrumbList**
itemListElement · **FAQPage** mainEntity · **Recipe** name, image,
recipeIngredient · **Event** name, startDate, location · **VideoObject** name,
thumbnailUrl, uploadDate · **Person** name.

---

## GEO / AI Search analyzer

Visibility in AI answers (AI Overviews, ChatGPT, Perplexity). Access checks
need a URL analysis; citability checks work on any input.

| Check | Pass | Flag | How to fix |
| --- | --- | --- | --- |
| AI search crawler access *(w3)* | robots.txt allows the answer-driving bots (OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Claude-User) — or there is no robots.txt | **Error** if any is blocked from the root | Remove the root `Disallow` for those user-agents. Blocked answer bots = invisible to AI search. |
| AI training crawler access | training bots (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Meta-ExternalAgent, Bytespider) allowed | Info if blocked — this is a legitimate policy choice, never penalized | Decide deliberately: blocking training bots protects content but models learn less about the brand. |
| llms.txt *(w1)* | `/llms.txt` exists at the origin | **Warning** if missing | Publish a short Markdown index: site name, one-paragraph summary, links to key pages. |
| Question-form headings *(w1)* | ≥1 H2/H3 phrased as a question (ends with "?" or starts with how/what/why/…) | **Warning** if none | Rephrase key subheadings as the questions users ask; open each section with a direct answer. |
| Quotable paragraph size *(w2)* | average ≤110 words per paragraph | **Warning** above | Split paragraphs to one point each (~40–100 words), key fact first — AI engines cite at passage level. |
| Structured facts *(w1)* | any list or table (checked on 300+ word content) | **Warning** if pure prose | Turn steps, specs, comparisons, and prices into lists/tables. |
| Date-stamped content | `datePublished`/`dateModified` in structured data | Info if absent | Add dates to the schema — AI engines favor verifiably fresh sources. |

---

## Reading a check in the UI

Click any warning/error to expand it: **Problem** → **Why** (the reasoning to
relay to clients/writers) → **How to fix** (the concrete edit) → **Impact**.
Checks are sorted errors first, so working top to bottom is always the right
order.
