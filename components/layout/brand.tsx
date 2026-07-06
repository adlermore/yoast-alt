import Link from "next/link";
import { ScanSearch } from "lucide-react";
import { SITE } from "@/constants/site";

export function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <ScanSearch className="size-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold tracking-tight">{SITE.name}</span>
        <span className="text-[11px] text-muted-foreground">{SITE.tagline}</span>
      </span>
    </Link>
  );
}
