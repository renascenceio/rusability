"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth-helpers";

const SUPERADMIN = ["superadmin"] as const;

export async function setMessageStatus(id: string, status: "new" | "read" | "archived") {
  await requireRole([...SUPERADMIN], "/admin");
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
  return { ok: true as const, status };
}

export async function deleteMessage(id: string) {
  await requireRole([...SUPERADMIN], "/admin");
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
  return { ok: true as const };
}
