import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

/** Read a settings blob by key, falling back to the provided default. */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
  if (!row) return fallback;
  return { ...fallback, ...(row.value as Partial<T>) };
}

/** Upsert a settings blob by key. */
export async function putSetting(key: string, value: unknown): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key, value: value as object, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: value as object, updatedAt: new Date() },
    });
}
