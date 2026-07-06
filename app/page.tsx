import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Braces,
  Code2,
  FileText,
  KeyRound,
  Link2,
  Wrench,
} from "lucide-react";
import { PageContainer } from "@/components/layout";
import { ActionCard } from "@/components/cards/action-card";
import { Button } from "@/components/ui/button";
import { SITE } from "@/constants/site";

export const metadata: Metadata = {
  title: "Dashboard",
};

const MODES: {
  href: string;
  title: string;
  description: string;
  icon: typeof Link2;
  badge?: string;
}[] = [
  {
    href: "/analyze/url",
    title: "Analyze URL",
    description: "Fetch a live page and run the full analyzer suite with technical checks.",
    icon: Link2,
    badge: "Available",
  },
  {
    href: "/analyze/html",
    title: "Analyze HTML",
    description: "Paste raw markup and inspect its full extracted structure.",
    icon: Code2,
    badge: "Available",
  },
  {
    href: "/analyze/text",
    title: "Analyze Text",
    description: "Score readability and keyword usage for an article.",
    icon: FileText,
    badge: "Available",
  },
];

const CAPABILITIES: { title: string; icon: typeof Wrench }[] = [
  { title: "Technical SEO", icon: Wrench },
  { title: "Keyword analysis", icon: KeyRound },
  { title: "Readability", icon: BookOpen },
  { title: "Structured data", icon: Braces },
];

export default function DashboardPage() {
  return (
    <PageContainer>
      <div className="space-y-10">
        <section className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/70 via-background to-background p-8">
          <p className="text-sm font-medium text-muted-foreground">
            {SITE.tagline}
          </p>
          <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-balance">
            Audit SEO &amp; readability for any website.
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground text-pretty">
            {SITE.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/analyze/html">Analyze HTML</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/analyze/url">Analyze a URL</Link>
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Start an analysis
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODES.map((mode) => (
              <ActionCard key={mode.href} {...mode} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Built-in analyzers
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((capability) => {
              const Icon = capability.icon;
              return (
                <div
                  key={capability.title}
                  className="flex items-center gap-3 rounded-lg border p-4"
                >
                  <span className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="text-sm font-medium">
                    {capability.title}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
