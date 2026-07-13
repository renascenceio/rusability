import { neon } from "@neondatabase/serverless";

/**
 * Edge-safe redirect lookup used by middleware.
 *
 * The app's main DB layer uses `pg`, which cannot run on the edge, so this
 * module talks to Neon over its HTTP driver instead (same approach as
 * known-slugs.ts). All enabled redirects are cached in module scope with a
 * short TTL, so the hot path is an in-memory map lookup with no per-request
 * query. We FAIL OPEN on any error (no redirect) so a DB hiccup never breaks
 * navigation.
 */

export type RedirectRule = {
  source: string;
  destination: string;
  statusCode: number;
};

const TTL_MS = 60_000; // refresh the redirect set at most once a minute

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

let cache: { at: number; map: Map<string, RedirectRule> } | null = null;

/** Normalise a path for matching: strip trailing slash (except root), lowercase host-agnostic. */
export function normalizePath(path: string): string {
  if (!path) return "/";
  const trimmed = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return trimmed || "/";
}

async function loadRedirects(): Promise<Map<string, RedirectRule> | null> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.map;
  if (!sql) return null;
  try {
    const rows = await sql`
      select source, destination, status_code
      from redirects
      where enabled = true
    `;
    const map = new Map<string, RedirectRule>();
    for (const r of rows) {
      map.set(normalizePath(String(r.source)), {
        source: String(r.source),
        destination: String(r.destination),
        statusCode: Number(r.status_code) || 301,
      });
    }
    cache = { at: Date.now(), map };
    return map;
  } catch {
    return null; // fail open
  }
}

/** Returns the matching redirect rule for a path, or null if none. */
export async function matchRedirect(pathname: string): Promise<RedirectRule | null> {
  const map = await loadRedirects();
  if (!map) return null;
  return map.get(normalizePath(pathname)) ?? null;
}
