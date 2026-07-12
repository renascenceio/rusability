import "server-only";
import { db } from "@/lib/db";
import { siteCtas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type SiteCta = {
  placement: string;
  eyebrow: string;
  title: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
  variant: "soft" | "gradient" | "dark";
  active: boolean;
};

type Row = typeof siteCtas.$inferSelect;

function mapCta(r: Row): SiteCta {
  return {
    placement: r.placement,
    eyebrow: r.eyebrow,
    title: r.title,
    body: r.body,
    buttonLabel: r.buttonLabel,
    buttonHref: r.buttonHref,
    variant: (r.variant as SiteCta["variant"]) ?? "soft",
    active: r.active,
  };
}

/** All CTAs (admin view — includes inactive). */
export async function allCtas(): Promise<SiteCta[]> {
  const rows = await db.select().from(siteCtas).orderBy(siteCtas.placement);
  return rows.map(mapCta);
}

/** A single active CTA for a placement, or null when missing/disabled. */
export async function activeCta(placement: string): Promise<SiteCta | null> {
  const rows = await db
    .select()
    .from(siteCtas)
    .where(eq(siteCtas.placement, placement))
    .limit(1);
  const cta = rows[0] ? mapCta(rows[0]) : null;
  return cta && cta.active ? cta : null;
}
