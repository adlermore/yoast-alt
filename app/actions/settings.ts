"use server";

import { revalidatePath } from "next/cache";
import type { AppSettings } from "@/types";
import { saveSettings } from "@/services/settings";

export type UpdateSettingsResult = { ok: true } | { ok: false; message: string };

export async function updateSettingsAction(
  settings: AppSettings,
): Promise<UpdateSettingsResult> {
  try {
    await saveSettings(settings);
    revalidatePath("/settings");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save settings.",
    };
  }
}
