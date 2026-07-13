import "server-only";
import { getSetting, putSetting } from "./settings";

/**
 * Admin-managed "wrong topic" stop-list for the news collector. When an editor
 * marks a gathered item as «Неверная тема», its term is added here, and the
 * collector (`collectNews`) then drops any future source item matching it —
 * on top of the static keyword filter in content-filter.ts.
 *
 * Stored in site_settings under a single key so no migration is needed.
 */
const KEY = "news_blocked_terms";
type Blob = { terms: string[] };

export async function getBlockedTerms(): Promise<string[]> {
  const { terms } = await getSetting<Blob>(KEY, { terms: [] });
  return Array.isArray(terms) ? terms : [];
}

export async function addBlockedTerm(term: string): Promise<string[]> {
  const t = term.trim();
  const cur = await getBlockedTerms();
  if (!t) return cur;
  if (cur.some((x) => x.toLowerCase() === t.toLowerCase())) return cur;
  const next = [...cur, t];
  await putSetting(KEY, { terms: next });
  return next;
}

export async function removeBlockedTerm(term: string): Promise<string[]> {
  const cur = await getBlockedTerms();
  const next = cur.filter((x) => x.toLowerCase() !== term.trim().toLowerCase());
  await putSetting(KEY, { terms: next });
  return next;
}
