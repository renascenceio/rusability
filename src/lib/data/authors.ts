import "server-only";
import { db } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import type { Author } from "@/lib/types";

type Row = typeof authors.$inferSelect;

function toISO(v: Date | string | null | undefined): string {
  if (!v) return "";
  return typeof v === "string" ? v : v.toISOString();
}

export function mapAuthor(r: Row): Author {
  return {
    id: r.id,
    username: r.username,
    name: r.name,
    role: r.role as Author["role"],
    avatar: r.avatar,
    bio: r.bio,
    archetype: r.archetype ?? undefined,
    location: r.location ?? undefined,
    followers: r.followers,
    articlesCount: r.articlesCount,
    elite: r.elite,
    joinedAt: toISO(r.joinedAt),
    socials: (r.socials as Author["socials"]) ?? {},
  };
}

export async function allAuthors(): Promise<Author[]> {
  const rows = await db.select().from(authors).orderBy(asc(authors.name));
  return rows.map(mapAuthor);
}

export async function getAuthor(id: string): Promise<Author | undefined> {
  const rows = await db.select().from(authors).where(eq(authors.id, id)).limit(1);
  return rows[0] ? mapAuthor(rows[0]) : undefined;
}

export async function getAuthorByUsername(username: string): Promise<Author | undefined> {
  const rows = await db.select().from(authors).where(eq(authors.username, username)).limit(1);
  return rows[0] ? mapAuthor(rows[0]) : undefined;
}

/** Batch lookup keyed by id — handy for enriching article lists without N+1. */
export async function authorsByIds(ids: string[]): Promise<Map<string, Author>> {
  const map = new Map<string, Author>();
  if (ids.length === 0) return map;
  const rows = await db.select().from(authors);
  for (const r of rows) {
    if (ids.includes(r.id)) map.set(r.id, mapAuthor(r));
  }
  return map;
}
