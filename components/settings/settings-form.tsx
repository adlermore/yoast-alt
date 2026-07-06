"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { AnalyzerToggles, AppSettings } from "@/types";
import { updateSettingsAction } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ToggleMeta {
  key: keyof AnalyzerToggles;
  label: string;
  description: string;
}

const TOGGLES: readonly ToggleMeta[] = [
  {
    key: "readability",
    label: "Readability analyzer",
    description: "Reading ease, sentence/paragraph length, passive voice, and transitions.",
  },
  {
    key: "technical",
    label: "Technical analyzer",
    description: "Mixed content, URL structure, and (for URLs) HTTP status, headers, robots.txt, and sitemap.",
  },
  {
    key: "schema",
    label: "Schema analyzer",
    description: "Structured-data detection, validity, and required-property checks.",
  },
  {
    key: "geo",
    label: "GEO / AI Search analyzer",
    description:
      "AI crawler access (robots.txt), llms.txt, and passage-level citability for AI Overviews, ChatGPT, and Perplexity.",
  },
];

/** Toggle which optional analyzers run. SEO always runs; keyword runs when a keyword is set. */
export function SettingsForm({ initial }: { initial: AppSettings }) {
  const [analyzers, setAnalyzers] = useState<AnalyzerToggles>(initial.analyzers);
  const [pending, startTransition] = useTransition();

  const toggle = (key: keyof AnalyzerToggles) =>
    setAnalyzers((prev) => ({ ...prev, [key]: !prev[key] }));

  const save = () => {
    startTransition(async () => {
      const result = await updateSettingsAction({ analyzers });
      if (result.ok) toast.success("Settings saved.");
      else toast.error(result.message);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Analyzers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          The SEO analyzer always runs. The keyword analyzer runs automatically when you
          provide a focus keyword.
        </p>

        <div className="divide-y rounded-lg border">
          {TOGGLES.map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-start justify-between gap-4 p-4"
            >
              <span className="min-w-0 space-y-0.5">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block text-sm text-muted-foreground text-pretty">
                  {item.description}
                </span>
              </span>
              <input
                type="checkbox"
                checked={analyzers[item.key]}
                onChange={() => toggle(item.key)}
                className="mt-1 size-4 shrink-0 accent-primary"
              />
            </label>
          ))}
        </div>

        <Button onClick={save} disabled={pending} className="gap-2">
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save settings
        </Button>
      </CardContent>
    </Card>
  );
}
