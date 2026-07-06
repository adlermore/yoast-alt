"use client";

import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HELP_CONTENT, type HelpEntry, type HelpKey } from "./help-content";

/** Shared status/score legend appended to analyzer help popups. */
function StatusLegend() {
  return (
    <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
      <p className="text-sm font-medium">Reading the results</p>
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li>
          <span className="font-medium text-success">Pass</span> — meets the
          standard, nothing to do.
        </li>
        <li>
          <span className="font-medium text-warning">Warning</span> — suboptimal;
          fix when you touch the page. Half credit in the score.
        </li>
        <li>
          <span className="font-medium text-danger">Error</span> — actively
          hurting the page; fix first. Zero credit.
        </li>
        <li>
          <span className="font-medium">Info</span> — context or a judgment
          call; never affects the score.
        </li>
      </ul>
      <p className="text-sm text-muted-foreground">
        Scores are weighted 0–100: 90+ Excellent · 75+ Good · 50+ Needs work ·
        25+ Poor · below 25 Critical. Heavier checks (weight 2–3) move the
        score more than minor ones.
      </p>
    </div>
  );
}

/**
 * "How it works" button + popup with the page's in-app documentation.
 * Rendered by {@link PageHeader} when a page supplies a `helpKey`.
 */
export function PageHelp({ helpKey }: { helpKey: HelpKey }) {
  const entry: HelpEntry = HELP_CONTENT[helpKey];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CircleHelp className="size-4" />
          How it works
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-6 pb-4">
          <DialogTitle>{entry.title}</DialogTitle>
          <DialogDescription className="text-pretty">
            {entry.intro}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(85dvh-7rem)] space-y-5 overflow-y-auto p-6">
          {entry.sections.map((section) => (
            <section key={section.heading} className="space-y-1.5">
              <h3 className="text-sm font-semibold">{section.heading}</h3>
              {section.body ? (
                <p className="text-sm text-muted-foreground text-pretty">
                  {section.body}
                </p>
              ) : null}
              {section.bullets ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="text-pretty">
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          {entry.showLegend ? <StatusLegend /> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
