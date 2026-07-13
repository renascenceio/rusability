"use server";

import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { putSetting } from "@/lib/data/settings";
import { requireRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { redirects } from "@/lib/db/schema";

export type RedirectRow = {
  id: number;
  source: string;
  destination: string;
  statusCode: number;
  enabled: boolean;
  hits: number;
  note: string | null;
};

/** Normalise a user-entered path to a leading-slash, no-trailing-slash form. */
function normalizeSource(raw: string): string {
  let s = raw.trim();
  if (!s) return "";
  if (!s.startsWith("/") && !s.startsWith("http")) s = "/" + s;
  if (s.length > 1) s = s.replace(/\/+$/, "");
  return s;
}

export async function listRedirects(): Promise<RedirectRow[]> {
  await requireRole(["admin", "superadmin"]);
  const rows = await db.select().from(redirects).orderBy(desc(redirects.createdAt));
  return rows.map((r) => ({
    id: r.id,
    source: r.source,
    destination: r.destination,
    statusCode: r.statusCode,
    enabled: r.enabled,
    hits: r.hits,
    note: r.note,
  }));
}

export async function createRedirect(input: {
  source: string;
  destination: string;
  statusCode: number;
}): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin", "superadmin"]);
  const source = normalizeSource(input.source);
  const destination = input.destination.trim();
  if (!source || !destination) return { ok: false, error: "Укажите откуда и куда" };
  if (source === normalizeSource(destination)) {
    return { ok: false, error: "Источник и цель совпадают" };
  }
  const code = input.statusCode === 302 ? 302 : 301;
  try {
    await db
      .insert(redirects)
      .values({ source, destination, statusCode: code })
      .onConflictDoUpdate({
        target: redirects.source,
        set: { destination, statusCode: code, enabled: true },
      });
    revalidatePath("/admin/seo");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось сохранить редирект" };
  }
}

export async function toggleRedirect(id: number, enabled: boolean) {
  await requireRole(["admin", "superadmin"]);
  await db.update(redirects).set({ enabled }).where(eq(redirects.id, id));
  revalidatePath("/admin/seo");
  return { ok: true as const, enabled };
}

export async function deleteRedirect(id: number) {
  await requireRole(["admin", "superadmin"]);
  await db.delete(redirects).where(eq(redirects.id, id));
  revalidatePath("/admin/seo");
  return { ok: true as const };
}

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
