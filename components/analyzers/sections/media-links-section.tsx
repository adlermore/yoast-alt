import { ImageIcon, Link2 } from "lucide-react";
import type { ImageNode, LinkNode, ParsedDocument } from "@/types";
import { EmptyState } from "@/components/shared";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PreviewImage } from "../preview-image";

function AltBadge({ image }: { image: ImageNode }) {
  if (image.isTrackingPixel) return <Badge variant="outline">Pixel</Badge>;
  if (image.alt === "") return <Badge variant="secondary">Decorative</Badge>;
  if (image.hasAlt)
    return (
      <Badge className="border-success/30 bg-success/10 text-success">
        Alt set
      </Badge>
    );
  return (
    <Badge className="border-danger/30 bg-danger/10 text-danger">
      Missing alt
    </Badge>
  );
}

function ImagesCard({ images }: { images: ImageNode[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Images ({images.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <EmptyState icon={ImageIcon} title="No images found" />
        ) : (
          <div className="max-h-[28rem] overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/60 text-left text-xs uppercase text-muted-foreground backdrop-blur">
                <tr>
                  <th className="p-2 font-medium">Preview</th>
                  <th className="p-2 font-medium">Source</th>
                  <th className="p-2 font-medium">Alt</th>
                  <th className="p-2 font-medium">Format</th>
                  <th className="p-2 font-medium">Size</th>
                  <th className="p-2 font-medium">Loading</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {images.map((image, index) => (
                  <tr key={`${image.src ?? "img"}-${index}`}>
                    <td className="p-2">
                      <PreviewImage
                        src={image.resolvedSrc}
                        alt={image.alt ?? ""}
                        className="size-10 rounded border"
                      />
                    </td>
                    <td className="max-w-[16rem] p-2">
                      <span className="block truncate text-muted-foreground">
                        {image.src ?? "—"}
                      </span>
                    </td>
                    <td className="p-2">
                      <AltBadge image={image} />
                    </td>
                    <td className="p-2 uppercase text-muted-foreground">
                      {image.format}
                    </td>
                    <td className="p-2 tabular-nums text-muted-foreground">
                      {image.hasDimensions
                        ? `${image.width}×${image.height}`
                        : "—"}
                    </td>
                    <td className="p-2 text-muted-foreground">
                      {image.loading ?? "eager"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LinkBadges({ link }: { link: LinkNode }) {
  return (
    <div className="flex flex-wrap gap-1">
      {link.isInternal ? <Badge variant="secondary">Internal</Badge> : null}
      {link.isExternal ? <Badge variant="outline">External</Badge> : null}
      {link.isAnchor ? <Badge variant="outline">Anchor</Badge> : null}
      {link.isMailto ? <Badge variant="outline">Mail</Badge> : null}
      {link.isTel ? <Badge variant="outline">Tel</Badge> : null}
      {link.nofollow ? <Badge variant="outline">nofollow</Badge> : null}
      {link.isEmptyAnchor ? (
        <Badge className="border-warning/30 bg-warning/10 text-warning">
          Empty anchor
        </Badge>
      ) : null}
    </div>
  );
}

function LinksCard({ links }: { links: LinkNode[] }) {
  const internal = links.filter((link) => link.isInternal).length;
  const external = links.filter((link) => link.isExternal).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Links ({links.length})</CardTitle>
        <p className="text-sm text-muted-foreground">
          {internal} internal · {external} external
        </p>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <EmptyState icon={Link2} title="No links found" />
        ) : (
          <ul className="max-h-[28rem] divide-y overflow-auto rounded-md border">
            {links.map((link, index) => (
              <li
                key={`${link.href}-${index}`}
                className="flex flex-col gap-1 p-2.5"
              >
                <span
                  className={cn(
                    "text-sm",
                    link.isEmptyAnchor && "italic text-muted-foreground",
                  )}
                >
                  {link.text || "(no anchor text)"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {link.href}
                </span>
                <LinkBadges link={link} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function MediaLinksSection({ document }: { document: ParsedDocument }) {
  return (
    <div className="space-y-6">
      <ImagesCard images={document.images} />
      <LinksCard links={document.links} />
    </div>
  );
}
