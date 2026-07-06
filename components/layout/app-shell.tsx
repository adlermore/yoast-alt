import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
