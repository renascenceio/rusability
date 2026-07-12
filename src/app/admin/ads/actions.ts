"use server";

import { db } from "@/lib/db";
import { siteCtas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export type CtaInput = {
  placement: string;
  eyebrow: string;
  title: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
  variant: "soft" | "gradient" | "dark";
  active: boolean;
};

/** Revalidate every public surface that renders an admin CTA. */
function revalidatePublic() {
  revalidatePath("/admin/ads");
  revalidatePath("/");
  revalidatePath("/news");
}

/**
 * Create or update a marketing CTA (keyed by placement). Editor/admin only.
 * These rows drive the public homepage + /news slots via `activeCta()`.
 */
export async function saveCta(input: CtaInput): Promise<{ ok: boolean }> {
  await requireRole(["superadmin", "admin", "editor"]);
  const placement = input.placement.trim();
  if (!placement) return { ok: false };

  const values = {
    placement,
    eyebrow: input.eyebrow.trim(),
    title: input.title.trim(),
    body: input.body.trim(),
    buttonLabel: input.buttonLabel.trim(),
    buttonHref: input.buttonHref.trim(),
    variant: input.variant,
    active: input.active,
    updatedAt: new Date(),
  };

  await db
    .insert(siteCtas)
    .values(values)
    .onConflictDoUpdate({ target: siteCtas.placement, set: values });

  revalidatePublic();
  return { ok: true };
}

/** Flip a CTA on/off without opening the editor. */
export async function toggleCta(placement: string, active: boolean): Promise<{ ok: boolean }> {
  await requireRole(["superadmin", "admin", "editor"]);
  await db
    .update(siteCtas)
    .set({ active, updatedAt: new Date() })
    .where(eq(siteCtas.placement, placement));
  revalidatePublic();
  return { ok: true };
}

/** Delete a CTA placement entirely. */
export async function deleteCta(placement: string): Promise<{ ok: boolean }> {
  await requireRole(["superadmin", "admin", "editor"]);
  await db.delete(siteCtas).where(eq(siteCtas.placement, placement));
  revalidatePublic();
  return { ok: true };
}
