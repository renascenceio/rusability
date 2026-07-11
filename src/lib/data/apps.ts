import "server-only";
import { db } from "@/lib/db";
import { apps } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import type { AppTool } from "@/lib/types";

type Row = typeof apps.$inferSelect;

export function mapApp(r: Row): AppTool {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    description: r.description,
    icon: r.icon,
    category: r.category,
    pricing: r.pricing as AppTool["pricing"],
    rating: Number(r.rating),
    users: r.users,
    featured: r.featured,
  };
}

export async function allApps(): Promise<AppTool[]> {
  const rows = await db.select().from(apps).orderBy(asc(apps.name));
  return rows.map(mapApp);
}

export async function getApp(slug: string): Promise<AppTool | undefined> {
  const rows = await db.select().from(apps).where(eq(apps.slug, slug)).limit(1);
  return rows[0] ? mapApp(rows[0]) : undefined;
}
