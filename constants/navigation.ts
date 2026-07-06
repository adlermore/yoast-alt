import type { LucideIcon } from "lucide-react";
import {
  Braces,
  BookOpen,
  Code2,
  FileText,
  Gauge,
  History,
  KeyRound,
  LayoutDashboard,
  Link2,
  ScrollText,
  Settings,
  Unlink,
  Wrench,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Sidebar navigation, grouped. Order defines display order. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Analyze",
    items: [
      { title: "Analyze URL", href: "/analyze/url", icon: Link2 },
      { title: "Analyze HTML", href: "/analyze/html", icon: Code2 },
      { title: "Analyze Text", href: "/analyze/text", icon: FileText },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Technical SEO", href: "/technical", icon: Wrench },
      { title: "Keyword", href: "/keyword", icon: KeyRound },
      { title: "Readability", href: "/readability", icon: BookOpen },
      { title: "Schema", href: "/schema", icon: Braces },
    ],
  },
  {
    label: "Surik Tools",
    items: [
      { title: "Site Auditor", href: "/surik/audit", icon: Gauge },
      { title: "Orphan Pages", href: "/surik/orphans", icon: Unlink },
    ],
  },
  {
    label: "Library",
    items: [
      { title: "Reports", href: "/reports", icon: ScrollText },
      { title: "History", href: "/history", icon: History },
    ],
  },
  {
    label: "System",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];

/** Flat list for lookups (e.g. active-route matching, breadcrumbs). */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);
