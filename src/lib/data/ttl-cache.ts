import "server-only";

/**
 * In-process, module-scoped TTL memo for hot reference/list reads.
 *
 * WHY NOT `unstable_cache`? Next's Data Cache SILENTLY refuses to store any
 * payload over ~2 MB — no error, it just re-runs the loader on every request,
 * so a big all-rows list *looks* cached but isn't. Our published-articles list
 * serializes to ~4.7 MB and published-news to ~8 MB (measured), so both blow
 * that limit. This memo keeps the resolved list in RAM and serves it across
 * requests within a warm serverless instance, with no size ceiling.
 *
 * Staleness is bounded by `ttlMs` (a few minutes) — acceptable because these
 * lists only change when the content cron publishes or an admin edits, and the
 * product tolerates a few minutes of cache lag. There is no cross-instance
 * invalidation (each warm instance refreshes independently on TTL expiry),
 * which is exactly the tradeoff that makes it cheap and stampede-safe.
 *
 * The PROMISE is cached (not the resolved value) so concurrent callers during a
 * cold load coalesce onto a single query instead of stampeding the DB. A
 * rejected load is evicted so the next call retries rather than caching an error.
 */
type Entry<T> = { at: number; value: Promise<T> };

const store = new Map<string, Entry<unknown>>();

export function memoTTL<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && now - hit.at < ttlMs) return hit.value;

  const value = loader().catch((err) => {
    // Never cache a failure — evict so the next request retries.
    const cur = store.get(key);
    if (cur && cur.value === (value as Promise<unknown>)) store.delete(key);
    throw err;
  });
  store.set(key, { at: now, value });
  return value;
}

/** Shared staleness window for public list/reference reads (matches the app's
 *  existing `revalidate: 300` convention for cached config). */
export const LIST_TTL_MS = 300_000; // 5 minutes
