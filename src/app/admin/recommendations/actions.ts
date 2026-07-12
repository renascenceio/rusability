"use server";

import { revalidatePath } from "next/cache";
import { putSetting } from "@/lib/data/settings";
import { requireRole } from "@/lib/auth-helpers";

export type RecWeights = Record<string, number>;
export type RecConfig = { active: boolean; weights: RecWeights };

export async function saveRecommendations(config: RecConfig) {
  await requireRole(["admin", "superadmin"]);
  await putSetting("recommendations", config);
  revalidatePath("/admin/recommendations");
  return { ok: true as const };
}
