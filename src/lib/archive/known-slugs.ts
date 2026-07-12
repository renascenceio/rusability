import { neon } from "@neondatabase/serverless";

/**
 * Edge-safe slug existence check used by middleware to tell an OLD (removed)
 * article/news link apart from a genuine NEW one.
 *
 * The app's main DB layer uses `pg`, which cannot run on the edge, so this
 * module talks to Neon over its HTTP driver instead.
 *
 * Design goals:
 *  - Real (new) articles must never be blocked → we FAIL OPEN on any error or
 *    uncertainty (treat the slug as valid).
 *  - Cheap on the hot path → the small set of published NEW slugs is cached in
 *    module scope with a short TTL, so valid views are an in-memory lookup with
 *    no per-request query. Only cache misses (i.e. old links) hit the DB, and
 *    their negative result is cached too.
 */

type Section = "articles" | "news";

const SET_TTL_MS = 60_000; // refresh the known-slug set at most once a minute
const NEG_TTL_MS = 300_000; // remember confirmed-gone slugs for 5 minutes

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

const setCache: Record<Section, { at: number; slugs: Set<string> } | null> = {
  articles: null,
  news: null,
};
const negCache: Record<Section, Map<string, number>> = {
  articles: new Map(),
  news: new Map(),
};

async function loadKnownSet(section: Section): Promise<Set<string> | null> {
  const cached = setCache[section];
  if (cached && Date.now() - cached.at < SET_TTL_MS) return cached.slugs;
  if (!sql) return null;

  try {
    const rows =
      section === "articles"
        ? await sql`select slug from articles where status = 'published'`
        : await sql`select slug from news where pipeline is null or pipeline = 'published'`;
    const slugs = new Set<string>(rows.map((r) => String(r.slug)));
    setCache[section] = { at: Date.now(), slugs };
    return slugs;
  } catch {
    return null; // fail open
  }
}

async function confirmGone(section: Section, slug: string): Promise<boolean> {
  if (!sql) return false;
  const neg = negCache[section];
  const seen = neg.get(slug);
  if (seen && Date.now() - seen < NEG_TTL_MS) return true;

  try {
    const rows =
      section === "articles"
        ? await sql`select 1 from articles where slug = ${slug} and status = 'published' limit 1`
        : await sql`select 1 from news where slug = ${slug} and (pipeline is null or pipeline = 'published') limit 1`;
    if (rows.length > 0) return false; // it exists → not gone
    neg.set(slug, Date.now());
    return true;
  } catch {
    return false; // fail open
  }
}

/**
 * Returns true only when we are confident the slug points at content that no
 * longer exists on the new site (i.e. an old, removed link). Any uncertainty
 * returns false so real content is always served.
 */
export async function isGoneLink(section: Section, slug: string): Promise<boolean> {
  const known = await loadKnownSet(section);
  if (known === null) return false; // couldn't load → never block
  if (known.has(slug)) return false; // valid new content
  return confirmGone(section, slug); // double-check for very recent publishes
}
