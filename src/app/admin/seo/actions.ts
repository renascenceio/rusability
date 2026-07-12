"use server";

import { revalidatePath } from "next/cache";
import { putSetting } from "@/lib/data/settings";
import { requireRole } from "@/lib/auth-helpers";

export type SeoMeta = {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
};

export type RobotsSettings = {
  index: boolean;
  follow: boolean;
  ai: boolean;
  sitemap: boolean;
};

export async function saveSeoMeta(meta: SeoMeta) {
  await requireRole(["admin", "superadmin"]);
  await putSetting("seo_meta", meta);
  revalidatePath("/admin/seo");
  return { ok: true as const };
}

export async function saveRobots(robots: RobotsSettings) {
  await requireRole(["admin", "superadmin"]);
  await putSetting("seo_robots", robots);
  revalidatePath("/admin/seo");
  return { ok: true as const };
}
