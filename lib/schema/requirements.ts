/**
 * Minimum recommended properties for common Schema.org types, used to flag
 * incomplete structured data. Not exhaustive — a pragmatic subset that maps to
 * Google's rich-result eligibility requirements.
 */

export const TYPE_REQUIREMENTS: Record<string, readonly string[]> = {
  Article: ["headline", "author", "datePublished"],
  BlogPosting: ["headline", "author", "datePublished"],
  NewsArticle: ["headline", "author", "datePublished"],
  Product: ["name", "image", "offers"],
  Offer: ["price", "priceCurrency"],
  Organization: ["name", "url"],
  LocalBusiness: ["name", "address", "telephone"],
  WebSite: ["name", "url"],
  WebPage: ["name"],
  BreadcrumbList: ["itemListElement"],
  FAQPage: ["mainEntity"],
  Recipe: ["name", "image", "recipeIngredient"],
  Event: ["name", "startDate", "location"],
  VideoObject: ["name", "thumbnailUrl", "uploadDate"],
  Person: ["name"],
};

/** Types that make a page notably richer in search when present at least once. */
export const RECOMMENDED_TYPES: readonly string[] = [
  "Organization",
  "WebSite",
  "BreadcrumbList",
];
