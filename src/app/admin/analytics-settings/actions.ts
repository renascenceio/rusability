"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";
import { putSetting } from "@/lib/data/settings";
import {
  ANALYTICS_CONFIG_TAG,
  ANALYTICS_SETTINGS_KEY,
  DEFAULT_ANALYTICS_CONFIG,
  readAnalyticsConfig,
  type AnalyticsConfig,
} from "@/lib/data/analytics-config";

export type SaveResult = { ok: true; config: AnalyticsConfig } | { ok: false; error: string };

/** Read the current saved config for the admin form. */
export async function getAnalyticsSettings(): Promise<AnalyticsConfig> {
  await requireRole(["admin", "superadmin"]);
  return readAnalyticsConfig();
}

/** GA measurement ids look like `G-XXXXXXXXXX`; Metrika ids are 6–9 digits. */
function isValidGaId(id: string): boolean {
  return /^G-[A-Z0-9]{6,}$/.test(id.trim());
}
function isValidMetrikaId(id: string): boolean {
  return /^\d{5,10}$/.test(id.trim());
}

export async function saveAnalyticsSettings(input: AnalyticsConfig): Promise<SaveResult> {
  await requireRole(["admin", "superadmin"]);

  const ga = {
    enabled: Boolean(input.ga?.enabled),
    id: (input.ga?.id ?? "").trim() || DEFAULT_ANALYTICS_CONFIG.ga.id,
  };
  const metrika = {
    enabled: Boolean(input.metrika?.enabled),
    id: (input.metrika?.id ?? "").trim() || DEFAULT_ANALYTICS_CONFIG.metrika.id,
  };

  // Only validate an id when its tracker is being turned on — a disabled
  // tracker can keep whatever placeholder id without blocking the save.
  if (ga.enabled && !isValidGaId(ga.id)) {
    return { ok: false, error: "Некорректный ID Google Analytics (формат G-XXXXXXXXXX)." };
  }
  if (metrika.enabled && !isValidMetrikaId(metrika.id)) {
    return { ok: false, error: "Некорректный номер счётчика Яндекс.Метрики (только цифры)." };
  }

  const config: AnalyticsConfig = { ga, metrika };
  await putSetting(ANALYTICS_SETTINGS_KEY, config);

  // Flush the cached read used by the public root layout, then refresh routes.
  revalidateTag(ANALYTICS_CONFIG_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/analytics-settings");

  return { ok: true, config };
}
