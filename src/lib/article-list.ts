/*
  Shared helpers for rendering list blocks correctly.

  The model (and older stored articles) frequently emit numbered lists as bullet
  items whose text already starts with "1. ", "2) " etc. — which renders as an
  ugly "• 1. text" (a bullet AND a number). These helpers detect that case,
  strip the redundant numeric prefix, and tell the renderer to use an ordered
  <ol> with real numbers instead of bullets.
*/

const NUM_PREFIX = /^\s*\(?\d+\s*[.)\]]\s+/;

/**
 * Decide whether a list should render as ordered (numbered) and return the
 * cleaned items (with any leading "N." / "N)" prefix stripped when ordered).
 *
 * A list is ordered when it was explicitly flagged OR when the majority of its
 * items begin with a numeric marker.
 */
export function normalizeList(items: string[], ordered?: boolean): {
  ordered: boolean;
  items: string[];
} {
  const numbered = items.filter((it) => NUM_PREFIX.test(it)).length;
  const isOrdered = ordered === true || (items.length > 0 && numbered >= Math.ceil(items.length / 2));

  if (!isOrdered) return { ordered: false, items };

  // Strip the leading numeric prefix so the <ol> counter isn't duplicated.
  const cleaned = items.map((it) => it.replace(NUM_PREFIX, "").trim()).filter(Boolean);
  return { ordered: true, items: cleaned.length ? cleaned : items };
}
