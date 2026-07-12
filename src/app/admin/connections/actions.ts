"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { connections } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth-helpers";

export type ConnectionRow = {
  id: string;
  platform: string;
  handle: string;
  connected: boolean;
  autopost: boolean;
  followers: string;
  lastSync: string | null;
};

/** Toggle whether a platform is connected. Disconnecting also stops autopost. */
export async function toggleConnected(id: string) {
  await requireRole(["admin", "superadmin"]);
  const [row] = await db.select().from(connections).where(eq(connections.id, id));
  if (!row) return { ok: false as const };
  const nextConnected = !row.connected;
  await db
    .update(connections)
    .set({
      connected: nextConnected,
      autopost: nextConnected ? row.autopost : false,
      lastSync: nextConnected ? new Date() : null,
    })
    .where(eq(connections.id, id));
  revalidatePath("/admin/connections");
  return { ok: true as const, connected: nextConnected };
}

/** Toggle autopost for an already-connected platform. */
export async function toggleAutopost(id: string) {
  await requireRole(["admin", "superadmin"]);
  const [row] = await db.select().from(connections).where(eq(connections.id, id));
  if (!row || !row.connected) return { ok: false as const };
  const nextAutopost = !row.autopost;
  await db.update(connections).set({ autopost: nextAutopost }).where(eq(connections.id, id));
  revalidatePath("/admin/connections");
  return { ok: true as const, autopost: nextAutopost };
}
