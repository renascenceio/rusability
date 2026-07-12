"use server";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

/** Ban a user manually (admin action). */
export async function banUser(userId: string, reason: string): Promise<{ ok: boolean }> {
  await requireRole(["superadmin", "admin"]);
  await db
    .update(user)
    .set({ banned: true, banReason: reason.trim() || "Заблокирован администратором" })
    .where(eq(user.id, userId));
  revalidatePath("/admin/users");
  return { ok: true };
}

/** Lift a ban and reset the РКН strike counter. */
export async function unbanUser(userId: string): Promise<{ ok: boolean }> {
  await requireRole(["superadmin", "admin"]);
  await db
    .update(user)
    .set({ banned: false, banReason: null, banExpires: null, rknStrikes: 0 })
    .where(eq(user.id, userId));
  revalidatePath("/admin/users");
  return { ok: true };
}

/** Change a user's platform role. */
export async function setUserRole(userId: string, role: string): Promise<{ ok: boolean }> {
  await requireRole(["superadmin"]);
  await db.update(user).set({ role }).where(eq(user.id, userId));
  revalidatePath("/admin/users");
  return { ok: true };
}
