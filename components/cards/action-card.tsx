import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

export function ActionCard({
  href,
  title,
  description,
  icon: Icon,
  badge,
}: ActionCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full gap-0 p-5 transition-colors hover:border-primary/40 hover:bg-accent/40">
        <div className="flex items-center justify-between">
          <span className="flex size-10 items-center justify-center rounded-lg border bg-muted">
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="flex items-center gap-2">
            {badge ? <Badge variant="secondary">{badge}</Badge> : null}
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
        <p className="mt-4 font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </Card>
    </Link>
  );
}
