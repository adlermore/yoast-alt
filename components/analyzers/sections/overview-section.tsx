import {
  AlignLeft,
  Braces,
  Clock,
  Heading,
  ImageIcon,
  Link2,
  TriangleAlert,
} from "lucide-react";
import type { ParsedDocument } from "@/types";
import { StatCard } from "@/components/cards/stat-card";
import { PresenceBadge } from "@/components/shared";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber } from "@/lib/format";

export function OverviewSection({ document }: { document: ParsedDocument }) {
  const { content, headings, images, links, structuredData, structure } =
    document;

  const internal = links.filter((link) => link.isInternal).length;
  const external = links.filter((link) => link.isExternal).length;
  const missingAlt = images.filter(
    (image) => !image.hasAlt && !image.isTrackingPixel,
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Words"
          value={formatNumber(content.wordCount)}
          icon={AlignLeft}
        />
        <StatCard label="Headings" value={headings.length} icon={Heading} />
        <StatCard
          label="Images"
          value={images.length}
          icon={ImageIcon}
          hint={missingAlt > 0 ? `${missingAlt} missing alt` : "all have alt"}
        />
        <StatCard
          label="Links"
          value={links.length}
          icon={Link2}
          hint={`${internal} internal · ${external} external`}
        />
        <StatCard label="Schema" value={structuredData.length} icon={Braces} />
        <StatCard
          label="Read time"
          value={`${content.readingTimeMinutes}m`}
          icon={Clock}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document landmarks</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <PresenceBadge present={structure.hasHeader} label="Header" />
          <PresenceBadge present={structure.hasNav} label="Nav" />
          <PresenceBadge present={structure.hasMain} label="Main" />
          <PresenceBadge present={structure.hasAside} label="Aside" />
          <PresenceBadge present={structure.hasFooter} label="Footer" />
          <PresenceBadge
            present={structure.hasBreadcrumbs}
            label="Breadcrumbs"
          />
        </CardContent>
      </Card>

      {document.warnings.length > 0 ? (
        <Card className="border-warning/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TriangleAlert className="size-4 text-warning" />
              Parser warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {document.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
