import "server-only";
import { db } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import type { Author } from "@/lib/types";
import { memoTTL, LIST_TTL_MS } from "@/lib/data/ttl-cache";

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
    manifesto: r.manifesto ?? undefined,
    followers: r.followers,
    articlesCount: r.articlesCount,
    elite: r.elite,
    joinedAt: toISO(r.joinedAt),
    socials: (r.socials as Author["socials"]) ?? {},
  };
}

/**
 * All authors, name-sorted. Memoized in-process for a few minutes.
 *
 * Authors change only on admin edit, but this set is read on essentially every
 * article-list render (via `authorsByIds`) — ~212k reads / 5.5M rows over 20
 * days uncached. It's tiny (~0.02 MB) so size is not a concern; the memo just
 * removes it from the hot path. `authorsByIds` derives from this same result.
 */
export async function allAuthors(): Promise<Author[]> {
  return memoTTL("authors:all", LIST_TTL_MS, async () => {
    const rows = await db.select().from(authors).orderBy(asc(authors.name));
    return rows.map(mapAuthor);
  });
}

export async function getAuthor(id: string): Promise<Author | undefined> {
  const rows = await db.select().from(authors).where(eq(authors.id, id)).limit(1);
  return rows[0] ? mapAuthor(rows[0]) : undefined;
}

export async function getAuthorByUsername(username: string): Promise<Author | undefined> {
  const rows = await db.select().from(authors).where(eq(authors.username, username)).limit(1);
  return rows[0] ? mapAuthor(rows[0]) : undefined;
}

/** Batch lookup keyed by id — handy for enriching article lists without N+1.
 *  Reads from the cached `allAuthors()` set (the author roster is small and
 *  changes rarely) instead of scanning the whole table on every list render. */
export async function authorsByIds(ids: string[]): Promise<Map<string, Author>> {
  const map = new Map<string, Author>();
  if (ids.length === 0) return map;
  const wanted = new Set(ids);
  for (const a of await allAuthors()) {
    if (wanted.has(a.id)) map.set(a.id, a);
  }
  return map;
}
