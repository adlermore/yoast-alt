/**
 * In-app documentation shown by the per-page "How it works" popup.
 *
 * One entry per page, keyed by a stable slug the page passes to
 * {@link PageHeader}. Content is plain data (no JSX) so it stays easy to
 * review and translate. `showLegend` appends the shared status/score legend
 * for pages that display scored checks.
 */

export interface HelpSection {
  heading: string;
  /** Paragraph shown under the heading. */
  body?: string;
  /** Bullet list shown under the body. */
  bullets?: string[];
}

export interface HelpEntry {
  title: string;
  intro: string;
  sections: HelpSection[];
  /** Append the shared pass/warning/error/info + score-grade legend. */
  showLegend?: boolean;
}

export const HELP_CONTENT = {
  "analyze-url": {
    title: "How Analyze URL works",
    intro:
      "Fetches a live page server-side and runs the full analyzer suite over it: SEO, Readability, Technical, Schema, GEO / AI — plus Keyword when you set a focus keyword.",
    showLegend: true,
    sections: [
      {
        heading: "What happens when you hit Analyze",
        bullets: [
          "The server downloads the page's HTML (following redirects) and records the HTTP response: status code, headers, final URL.",
          "It also probes the site origin for robots.txt, an XML sitemap, and /llms.txt — these feed the Technical and GEO checks.",
          "The HTML is parsed into a normalized document (meta tags, headings, images, links, structured data, visible text) and every enabled analyzer scores it.",
        ],
      },
      {
        heading: "Reading the report",
        bullets: [
          "The score header shows the overall score and a bar per analyzer.",
          "SEO checks tab: every check sorted errors-first — work top to bottom.",
          "Meta & Social tab: SERP preview with pixel-width meters (green = fits, red = will be truncated by Google) and social share previews.",
          "Text tab: your copy with overly long sentences highlighted inline.",
          "Save to Reports stores the analysis so you can reopen it from History.",
        ],
      },
      {
        heading: "Limits",
        bullets: [
          "JavaScript is NOT executed — you analyze the server-rendered HTML. JS-heavy pages may differ from what Google renders.",
          "Private/localhost URLs are blocked; only public http(s) pages can be fetched.",
        ],
      },
    ],
  },
  "analyze-html": {
    title: "How Analyze HTML works",
    intro:
      "Paste raw HTML source and get the same full report as Analyze URL — without fetching anything. Ideal for pages that are not live yet: staging templates, CMS previews, or work-in-progress markup.",
    showLegend: true,
    sections: [
      {
        heading: "What runs",
        bullets: [
          "All document-level checks: SEO, Readability, Schema, GEO citability, and the HTML-derivable Technical checks (mixed content, URL structure, <main> landmark).",
          "HTTP-level checks (status, headers, robots.txt, sitemap, AI crawler access) are skipped — there is no server response to inspect. Use Analyze URL for those.",
          "Add a focus keyword to include the Keyword analyzer.",
        ],
      },
      {
        heading: "Tips",
        bullets: [
          "Paste the complete document including <head> — that is where title, meta, canonical, and schema live.",
          "View-source from a browser works; \"Inspect element\" copies the JS-modified DOM, which may not match what crawlers first see.",
        ],
      },
    ],
  },
  "analyze-text": {
    title: "How Analyze Text works",
    intro:
      "Paste plain article copy (no HTML) to check its writing quality before it goes into the CMS. The text is wrapped in a minimal document, so structural checks are limited by design.",
    showLegend: true,
    sections: [
      {
        heading: "What runs",
        bullets: [
          "Readability is the star here: reading ease, sentence length, paragraph length, passive voice, transition words.",
          "Content-length and keyword checks (with a focus keyword) also apply.",
          "Checks about tags you didn't paste — meta description, canonical, images, schema — will report as missing; ignore those here and verify them on the real page.",
        ],
      },
      {
        heading: "Inline highlighting",
        body: "The Text view marks overly long sentences (over 20 words) in orange so you can fix them in place. Passive-voice offenders are listed inside the passive-voice check instead.",
      },
    ],
  },
  "content-editor": {
    title: "How the Content Editor works",
    intro:
      "A live writing scorecard: paste or write copy and it re-evaluates on every keystroke against four configurable standards. Everything runs in your browser — nothing is uploaded.",
    sections: [
      {
        heading: "The four standards (defaults)",
        bullets: [
          "Words per sentence: max 20 — met when at most 25% of sentences run long.",
          "Passive voice: max 10% of sentences.",
          "Total words: min 300.",
          "Reading ease: Flesch score of at least 60 (roughly 8th–9th grade).",
        ],
      },
      {
        heading: "Reading the scorecard",
        bullets: [
          "Each tile turns red when its standard is not met; the banner counts how many need work.",
          "The marked-up text shows long sentences with a light highlight and passive phrases with a stronger one.",
          "\"What to fix\" lists the concrete edits, worst first.",
        ],
      },
      {
        heading: "When to use it",
        body: "While writing or editing copy — it is the fast feedback loop. For the full SEO picture (meta tags, links, schema), run the finished page through Analyze URL or Analyze HTML.",
      },
    ],
  },
  "html-cleaner": {
    title: "How the HTML Cleaner works",
    intro:
      "Strips junk markup from HTML that came out of Word, Google Docs, or a CMS rich-text editor, so what you publish is clean semantic markup.",
    sections: [
      {
        heading: "Presets",
        bullets: [
          "Word / Docs paste: removes Office namespaces, o:p / w:* tags, Mso* classes, and inline styling cruft.",
          "Basic: inline styles, classes, ids, data-* and on* attributes, comments, empty elements.",
          "Safe: a conservative subset that keeps classes.",
          "Strip: everything — down to bare semantic tags.",
        ],
      },
      {
        heading: "How to use",
        bullets: [
          "Paste HTML, pick a preset, fine-tune individual options — the output re-cleans instantly as you toggle.",
          "It also normalizes <b>→<strong> and <i>→<em>, unwraps pointless <span>s, and can minify.",
          "The before → after byte counts show how much dead weight was removed.",
        ],
      },
    ],
  },
  pagespeed: {
    title: "How PageSpeed works",
    intro:
      "Runs Google PageSpeed Insights for a URL and shows two very different datasets side by side — do not mix them up when reporting to clients.",
    sections: [
      {
        heading: "Field data (CrUX) — what real users experienced",
        bullets: [
          "Collected from actual Chrome users over the trailing 28 days.",
          "This is what Google uses for ranking. Core Web Vitals pass/fail lives here.",
          "Metrics: LCP (loading), INP (responsiveness), CLS (visual stability) — plus FCP and TTFB.",
          "Small-traffic pages may have no field data at all; that's normal.",
        ],
      },
      {
        heading: "Lab data (Lighthouse) — a one-off simulated run",
        bullets: [
          "A synthetic test on emulated hardware; great for debugging, not a ranking factor.",
          "Use lab scores to find what to fix, field data to know whether users (and Google) are happy.",
        ],
      },
      {
        heading: "Thresholds (good / needs improvement / poor)",
        bullets: [
          "LCP: ≤2.5s / ≤4s / worse.",
          "INP: ≤200ms / ≤500ms / worse.",
          "CLS: ≤0.1 / ≤0.25 / worse.",
        ],
      },
    ],
  },
  technical: {
    title: "How Technical SEO works",
    intro:
      "Response-level and document-level plumbing checks for a URL: can crawlers fetch, index, and trust this page?",
    showLegend: true,
    sections: [
      {
        heading: "HTTP-level checks (from the server response)",
        bullets: [
          "Status code (2xx pass, 3xx warning, 4xx/5xx error).",
          "X-Robots-Tag header — a hidden noindex here is a classic invisible killer.",
          "Compression (gzip/brotli), Cache-Control, HSTS.",
          "robots.txt and XML sitemap reachability at the origin.",
        ],
      },
      {
        heading: "Document-level checks (from the HTML)",
        bullets: [
          "Mixed content: http:// resources on an https page.",
          "URL structure: length, uppercase, underscores, query-parameter count.",
          "Semantic <main> landmark and iframe usage.",
        ],
      },
      {
        heading: "Note",
        body: "JavaScript is not executed during the fetch. If the site is a JS framework with client-side rendering, verify critical tags server-side too.",
      },
    ],
  },
  geo: {
    title: "How GEO / AI Search works",
    intro:
      "GEO (Generative Engine Optimization) is visibility in AI answers — Google AI Overviews, ChatGPT Search, Perplexity, Copilot. This analyzer checks whether AI platforms can reach the site and whether the content is easy for them to quote.",
    showLegend: true,
    sections: [
      {
        heading: "Access checks (need a URL)",
        bullets: [
          "robots.txt is parsed per user-agent for 12 known AI crawlers.",
          "Blocking answer-driving bots (OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Claude-User) is an ERROR — the site becomes invisible to AI search and can never be cited.",
          "Blocking training bots (GPTBot, ClaudeBot, Google-Extended, CCBot, …) is reported as info only — it is a legitimate content-policy choice and never penalized.",
          "llms.txt: checks for a /llms.txt file — an emerging convention: a short Markdown index of the site addressed to AI assistants.",
        ],
      },
      {
        heading: "Citability checks (work on any input)",
        bullets: [
          "Question-form headings: at least one H2/H3 phrased as a question — AI answers are assembled from passages that directly answer one.",
          "Quotable paragraph size: average ≤110 words — LLMs cite at passage level; walls of text lose citations to tighter competitors.",
          "Structured facts: long content should carry at least one list or table — steps, specs, and prices in structured form get extracted most reliably.",
          "Date-stamped content: datePublished/dateModified in schema — AI engines favor verifiably fresh sources.",
        ],
      },
    ],
  },
  keyword: {
    title: "How the Keyword analyzer works",
    intro:
      "Checks how well a page targets one focus keyword: where it appears and how often. It only runs when you provide a keyword, so it never dilutes scores on pages without one.",
    showLegend: true,
    sections: [
      {
        heading: "Placement (weights in parentheses)",
        bullets: [
          "Title (3) — the strongest signal; keep the keyword near the start.",
          "Meta description (2), H1 (2), introduction / first 100 words (2).",
          "Subheadings (1), URL slug (1), image alt text (1).",
        ],
      },
      {
        heading: "Density",
        bullets: [
          "Pass: 0.5–2.5% of the text.",
          "0% = error (keyword never used in the body).",
          "Above 2.5% = warning; 3%+ = keyword stuffing, error.",
          "Multi-word keyphrases are weighted by word count so density stays comparable.",
        ],
      },
      {
        heading: "Good practice",
        body: "Write for the reader first, then check placement. Synonyms and related phrases count toward natural writing even though this analyzer tracks the exact keyphrase.",
      },
    ],
  },
  readability: {
    title: "How the Readability analyzer works",
    intro:
      "Measures how easy the copy is to read. Texts under 50 words are skipped — too short to judge.",
    showLegend: true,
    sections: [
      {
        heading: "The checks",
        bullets: [
          "Reading ease: Flesch score — pass at 60+ (8th–9th grade), warning 30–59, error below 30.",
          "Sentence length: at most 25% of sentences may exceed 20 words.",
          "Paragraph length: average must stay under 150 words.",
          "Subheading distribution: an H2/H3 roughly every 300 words on longer texts.",
          "Passive voice: at most 10% of sentences (offenders listed in the check).",
          "Transition words: at least 30% of sentences should carry one (however, for example, as a result…).",
        ],
      },
      {
        heading: "Inline highlighting",
        body: "The Text view renders your copy with long sentences highlighted in orange. Passive voice is deliberately not highlighted inline — it is scored as a check with sample sentences instead.",
      },
      {
        heading: "Caveat",
        body: "The heuristics are English-oriented; treat scores on other languages as directional, not absolute.",
      },
    ],
  },
  schema: {
    title: "How the Schema analyzer works",
    intro:
      "Detects structured data (JSON-LD, microdata, RDFa), validates that it parses, and checks that each detected type carries the properties Google requires for rich results.",
    showLegend: true,
    sections: [
      {
        heading: "The checks",
        bullets: [
          "Presence: at least one structured-data block on the page.",
          "Validity: every block must parse — one broken JSON-LD block is an error.",
          "Recommended site-wide types: Organization, WebSite, BreadcrumbList.",
          "Required properties per type — e.g. Article needs headline + author + datePublished; Product needs name + image + offers; LocalBusiness needs name + address + telephone.",
        ],
      },
      {
        heading: "Good practice",
        bullets: [
          "Prefer JSON-LD in a <script type=\"application/ld+json\"> tag — easiest to maintain and Google's recommended format.",
          "Only mark up content that is visible on the page; invisible markup risks a manual action.",
          "Cross-check winners with Google's Rich Results Test before shipping.",
        ],
      },
    ],
  },
  "surik-audit": {
    title: "How the Site Auditor works",
    intro:
      "Crawls the whole site breadth-first from the URL you enter (plus the XML sitemap) and reports site-wide problems a single-page analysis can't see.",
    sections: [
      {
        heading: "The crawl",
        bullets: [
          "Respects robots.txt; configurable max pages, depth, and delay.",
          "Per page it records status, redirect target, title, description, H1s, word count, a content fingerprint, noindex, canonical, and all internal links.",
          "JavaScript is not executed. Depth = clicks from the homepage; −1 means found only via the sitemap.",
        ],
      },
      {
        heading: "Severity and calibration",
        bullets: [
          "Critical / Warning / Notice = how bad. Fix criticals first.",
          "CONFIRMED = mechanically verified from crawl data — trust it.",
          "POSSIBLE = probably real but legitimate exceptions exist.",
          "CHECK = a signal worth a human look, not a verdict.",
        ],
      },
      {
        heading: "Rule families",
        bullets: [
          "Crawling: 5xx, broken internal links, 4xx, noindex, redirects, redirect chains and loops.",
          "Canonicals: cross-host, missing, canonical → broken page / redirect / noindex.",
          "On-page: missing/duplicate titles and descriptions, H1 problems, thin and duplicate content.",
          "Structure: orphan pages, pages 4+ clicks deep.",
        ],
      },
      {
        heading: "Health score",
        body: "Starts at 100; each non-empty issue type subtracts a penalty (critical −16, warning −6, notice −1.5) scaled by how much of the site it touches. Because the penalty is per issue type, one systemic template bug costs the same at 40 or 400 pages — fix the template, not each page. Results export as Markdown, XLSX, or PDF.",
      },
    ],
  },
  "surik-orphans": {
    title: "How the Orphan Page Detector works",
    intro:
      "Compares the URLs a site declares (sitemap or a pasted list) against the pages actually reachable by following internal links — and flags the gap.",
    sections: [
      {
        heading: "Classifications",
        bullets: [
          "Orphan: 200 OK but zero internal links point at it — users and crawlers can only find it via the sitemap. Link it from relevant pages or question its existence.",
          "JS-dependent: only referenced from markup that needs JavaScript; crawlers that don't render JS won't find it — treat as at-risk.",
          "Never crawled: the crawl never reached it (blocked, erroring, or over the page/depth budget) — no verdict; raise limits and re-run.",
          "Linked: fine.",
        ],
      },
      {
        heading: "When to run it",
        body: "After every large content push or migration — orphans are the classic \"published and forgot\" failure. If the summary says the page or depth limit was hit, raise the limits before acting on \"never crawled\" rows.",
      },
    ],
  },
  reports: {
    title: "How Reports work",
    intro:
      "Every analysis you save from a workbench lands here as a full, reopenable report — scores, every check, the parsed document, and the highlighted text.",
    sections: [
      {
        heading: "Details",
        bullets: [
          "Reports are stored as JSON files on this machine (data/ folder) — there is no database and nothing leaves the machine.",
          "Open a report to see the exact state of the page at analysis time — useful for before/after comparisons around a release.",
          "Deleting a report is permanent.",
        ],
      },
      {
        heading: "Workflow tip",
        body: "Save a report before you start optimizing and another after — the pair documents the improvement for the client or the team.",
      },
    ],
  },
  history: {
    title: "How History works",
    intro:
      "A compact timeline of every saved analysis — the fastest way to find and reopen past work.",
    sections: [
      {
        heading: "Details",
        bullets: [
          "Each row shows when the analysis ran, what was analyzed (URL or pasted input), the focus keyword, and the overall score.",
          "Click through to the full report.",
          "History lists the same saved reports as the Reports page — one library, two views.",
        ],
      },
    ],
  },
  settings: {
    title: "How Settings work",
    intro:
      "Controls which optional analyzers run on every analysis. Settings persist on this machine (data/settings.json).",
    sections: [
      {
        heading: "The toggles",
        bullets: [
          "Readability, Technical, Schema, and GEO / AI Search can each be switched off — for example, hide Readability when auditing pure landing pages.",
          "The SEO analyzer always runs — it is the core of the tool.",
          "The Keyword analyzer has no toggle: it runs automatically whenever a focus keyword is provided.",
        ],
      },
      {
        heading: "Effect on scores",
        body: "The overall score is the average of the analyzers that ran, so disabling one changes the overall number. Keep the same toggle set when comparing reports over time.",
      },
    ],
  },
} satisfies Record<string, HelpEntry>;

export type HelpKey = keyof typeof HELP_CONTENT;
