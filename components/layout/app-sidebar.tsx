import { ScrollArea } from "@/components/ui/scroll-area";
import { Brand } from "./brand";
import { SidebarNav } from "./sidebar-nav";

/** Persistent desktop sidebar. Hidden below the `lg` breakpoint. */
export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
      <div className="flex h-16 items-center border-b px-5">
        <Brand />
      </div>
      <ScrollArea className="min-h-0 flex-1 px-3 py-5">
        <SidebarNav />
      </ScrollArea>
    </aside>
  );
}
