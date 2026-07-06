import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSettings } from "@/services/settings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure which analyzers run. Persisted to settings.json.",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <PageContainer>
      <div className="space-y-8">
        <PageHeader
          title="Settings"
          description="Preferences are persisted to data/settings.json — no database. Use the theme toggle in the top bar to switch light/dark."
        />
        <div className="max-w-2xl">
          <SettingsForm initial={settings} />
        </div>
      </div>
    </PageContainer>
  );
}
