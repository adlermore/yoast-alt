import type { Check, ParsedDocument } from "@/types";
import { createCheck } from "@/lib/scores";
import { containsKeyword, leadingText } from "../match";

/** A concise pass/warn placement check with a shared recommendation shape. */
function placement(
  id: string,
  title: string,
  found: boolean,
  where: string,
  weight: number,
  fix: string,
  priority: "high" | "medium" | "low",
): Check {
  if (found) {
    return createCheck({
      id,
      title,
      status: "pass",
      detail: `The focus keyword appears in the ${where}.`,
      weight,
    });
  }
  return createCheck({
    id,
    title,
    status: "warning",
    detail: `The focus keyword is missing from the ${where}.`,
    weight,
    recommendation: {
      problem: `The focus keyword does not appear in the ${where}.`,
      reason:
        "Placing the focus keyword where search engines weight it most reinforces topical relevance.",
      howToFix: fix,
      priority,
      impact: "Medium — supports relevance for the target query.",
    },
  });
}

/** Where the focus keyword appears across the page's key on-page locations. */
export function checkKeywordPlacement(doc: ParsedDocument, keyword: string): Check[] {
  const checks: Check[] = [];

  checks.push(
    placement(
      "keyword-in-title",
      "Keyword in title",
      containsKeyword(doc.meta.title, keyword),
      "SEO title",
      3,
      "Work the focus keyword naturally into the <title>, ideally near the start.",
      "high",
    ),
  );

  checks.push(
    placement(
      "keyword-in-description",
      "Keyword in meta description",
      containsKeyword(doc.meta.description, keyword),
      "meta description",
      2,
      "Include the focus keyword once in the meta description to reinforce relevance in the snippet.",
      "medium",
    ),
  );

  const h1Text = doc.headings
    .filter((heading) => heading.level === 1)
    .map((heading) => heading.text)
    .join(" ");
  checks.push(
    placement(
      "keyword-in-h1",
      "Keyword in H1",
      containsKeyword(h1Text, keyword),
      "H1 heading",
      2,
      "Include the focus keyword in the H1 so the main heading matches the target topic.",
      "medium",
    ),
  );

  checks.push(
    placement(
      "keyword-in-intro",
      "Keyword in introduction",
      containsKeyword(leadingText(doc.content.text, 100), keyword),
      "first paragraph",
      2,
      "Mention the focus keyword within the first 100 words to establish the topic early.",
      "medium",
    ),
  );

  const subheadings = doc.headings.filter((heading) => heading.level >= 2);
  if (subheadings.length > 0) {
    const inSub = subheadings.some((heading) => containsKeyword(heading.text, keyword));
    checks.push(
      placement(
        "keyword-in-subheadings",
        "Keyword in subheadings",
        inSub,
        "subheadings",
        1,
        "Use the focus keyword (or a close variant) in at least one subheading.",
        "low",
      ),
    );
  }

  const url = doc.url;
  if (url) {
    let slug = url;
    try {
      slug = decodeURIComponent(new URL(url).pathname);
    } catch {
      /* keep raw url */
    }
    const readableSlug = slug.replace(/[-_/]+/g, " ");
    checks.push(
      placement(
        "keyword-in-url",
        "Keyword in URL",
        containsKeyword(readableSlug, keyword),
        "URL slug",
        1,
        "Include the focus keyword in the URL slug, separated by hyphens.",
        "low",
      ),
    );
  }

  const withAlt = doc.images.filter((image) => image.hasAlt && image.alt);
  if (withAlt.length > 0) {
    const inAlt = withAlt.some((image) => containsKeyword(image.alt, keyword));
    checks.push(
      placement(
        "keyword-in-alt",
        "Keyword in image alt",
        inAlt,
        "alt text of an image",
        1,
        "Add the focus keyword to the alt text of a relevant image where it describes it accurately.",
        "low",
      ),
    );
  }

  return checks;
}
