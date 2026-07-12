"use server";

import { db } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

/**
 * Grant or revoke Elite status for an author. Elite unlocks the dark premium
 * card treatment, unlimited AI credits and the gold badge. Superadmin-only.
 */
export async function setAuthorElite(authorId: string, elite: boolean): Promise<{ ok: boolean }> {
  await requireRole(["superadmin"]);
  await db.update(authors).set({ elite }).where(eq(authors.id, authorId));
  revalidatePath("/admin/authors");
  revalidatePath("/");
  return { ok: true };
}
