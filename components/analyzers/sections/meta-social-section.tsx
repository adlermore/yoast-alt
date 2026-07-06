import type { ParsedDocument } from "@/types";
import { DefinitionList, MissingValue } from "@/components/shared";
import type { DefinitionItem } from "@/components/shared";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getHostname } from "@/lib/html";
import { SerpPreview } from "../serp-preview";
import { SocialPreview } from "../social-preview";

function withCount(value: string | null, count: number) {
  if (value === null) return <MissingValue />;
  return (
    <span>
      {value}{" "}
      <span className="text-muted-foreground">({count} chars)</span>
    </span>
  );
}

function orMissing(value: string | null) {
  return value === null ? <MissingValue /> : value;
}

export function MetaSocialSection({ document }: { document: ParsedDocument }) {
  const { meta, openGraph, twitter } = document;

  const domain =
    getHostname(document.url ?? "") ??
    getHostname(openGraph.url ?? "") ??
    "example.com";

  const metaItems: DefinitionItem[] = [
    { term: "Title", value: withCount(meta.title, meta.titleLength) },
    {
      term: "Description",
      value: withCount(meta.description, meta.descriptionLength),
    },
    { term: "Canonical", value: orMissing(meta.canonical) },
    { term: "Meta robots", value: orMissing(meta.robots) },
    { term: "Viewport", value: orMissing(meta.viewport) },
    { term: "Charset", value: orMissing(meta.charset) },
    { term: "Language", value: orMissing(meta.language) },
    { term: "Author", value: orMissing(meta.author) },
    { term: "Keywords", value: orMissing(meta.keywords) },
    { term: "Theme color", value: orMissing(meta.themeColor) },
    { term: "Favicon", value: orMissing(meta.favicon) },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search result preview</CardTitle>
        </CardHeader>
        <CardContent>
          <SerpPreview
            title={meta.title}
            description={meta.description}
            url={document.url}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meta tags</CardTitle>
        </CardHeader>
        <CardContent>
          <DefinitionList items={metaItems} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social previews</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <SocialPreview
            platform="Open Graph"
            domain={domain}
            title={openGraph.title ?? meta.title}
            description={openGraph.description ?? meta.description}
            image={openGraph.image}
          />
          <SocialPreview
            platform="Twitter"
            domain={domain}
            title={twitter.title ?? openGraph.title ?? meta.title}
            description={
              twitter.description ?? openGraph.description ?? meta.description
            }
            image={twitter.image ?? openGraph.image}
          />
        </CardContent>
      </Card>
    </div>
  );
}
