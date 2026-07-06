/**
 * Settings persistence — a single JSON file under `data/`. Reads always return
 * a complete {@link AppSettings} by merging stored values over the defaults, so
 * missing or partial files degrade gracefully.
 */

import "server-only";
import type { AppSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types/settings";
import { dataPath, readJsonFile, writeJsonFile } from "@/services/storage";

const SETTINGS_FILE = () => dataPath("settings.json");

export async function getSettings(): Promise<AppSettings> {
  const stored = await readJsonFile<Partial<AppSettings>>(SETTINGS_FILE(), {});
  return {
    analyzers: {
      ...DEFAULT_SETTINGS.analyzers,
      ...(stored.analyzers ?? {}),
    },
  };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await writeJsonFile(SETTINGS_FILE(), settings);
}
