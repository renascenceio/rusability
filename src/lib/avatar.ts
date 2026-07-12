/*
  Deterministic profile avatars.

  - Regular users: DiceBear "Glyphs" (v10 HTTP API) — each seed gets its own
    auto-generated colour/glyph.
  - Elite authors & admins: a self-contained GOLD avatar with a dark glyph.
    We can't use DiceBear's `backgroundColor` for this because the Glyphs style
    paints its own opaque white "card" on top of the background rect, so the
    gold never shows through (it renders grey). Instead we build our own inline
    SVG (gold circle + deterministic dark glyph), guaranteeing gold + black with
    no network round-trip.
*/

const DICEBEAR_GLYPHS = "https://api.dicebear.com/10.x/glyphs/svg";

/** Gold used for Elite avatar backgrounds — matches `--gold` in globals.css. */
const ELITE_GOLD = "#e8a85a";
/** Dark ink used for Elite glyph elements — matches `--elite`. */
const ELITE_INK = "#1a1410";

/** Small deterministic string hash → non-negative int. */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/* Bold, centred dark glyph shapes drawn on the gold field (viewBox 0 0 72 72). */
const ELITE_GLYPHS: string[] = [
  // Arc over filled semicircle (Rusability-like mark)
  `<path d="M22 40a14 14 0 0 1 28 0" fill="none" stroke="${ELITE_INK}" stroke-width="7" stroke-linecap="round"/><path d="M22 50a14 14 0 0 1 28 0z" fill="${ELITE_INK}"/>`,
  // Ring + dot
  `<circle cx="36" cy="34" r="13" fill="none" stroke="${ELITE_INK}" stroke-width="7"/><circle cx="36" cy="52" r="5" fill="${ELITE_INK}"/>`,
  // Triangle
  `<path d="M36 22 52 50 20 50z" fill="${ELITE_INK}"/>`,
  // Two stacked bars
  `<rect x="22" y="28" width="28" height="7" rx="3.5" fill="${ELITE_INK}"/><rect x="22" y="40" width="20" height="7" rx="3.5" fill="${ELITE_INK}"/>`,
  // Rotated square
  `<rect x="26" y="26" width="20" height="20" rx="3" transform="rotate(45 36 36)" fill="${ELITE_INK}"/>`,
  // Plus / cross
  `<rect x="32" y="20" width="8" height="32" rx="4" fill="${ELITE_INK}"/><rect x="20" y="32" width="32" height="8" rx="4" fill="${ELITE_INK}"/>`,
  // Chevron up
  `<path d="M20 46 36 28 52 46" fill="none" stroke="${ELITE_INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  // Half-moon
  `<path d="M44 20a18 18 0 1 0 0 32 22 22 0 0 1 0-32z" fill="${ELITE_INK}"/>`,
];

/** Self-contained gold Elite avatar as a data URI (no network). */
function eliteAvatar(seed: string): string {
  const glyph = ELITE_GLYPHS[hashSeed(seed) % ELITE_GLYPHS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><rect width="72" height="72" fill="${ELITE_GOLD}"/>${glyph}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function glyphAvatar(seed: string, opts?: { elite?: boolean }): string {
  const s = (seed || "rusability").trim();
  if (opts?.elite) return eliteAvatar(s);
  const params = new URLSearchParams({ seed: s });
  return `${DICEBEAR_GLYPHS}?${params.toString()}`;
}

/** True when the stored avatar is empty or a generated placeholder we own. */
export function isGeneratedAvatar(url?: string | null): boolean {
  if (!url) return true;
  return (
    url.includes("api.dicebear.com") ||
    url.startsWith("data:image/svg") ||
    url.includes("/placeholder")
  );
}

/**
 * Resolve the avatar to render for an author-like record. Falls back to a
 * deterministic avatar (gold for Elite) when no real photo is set.
 */
export function resolveAvatar(input: {
  avatar?: string | null;
  name?: string | null;
  username?: string | null;
  elite?: boolean;
}): string {
  if (input.avatar && !isGeneratedAvatar(input.avatar)) return input.avatar;
  const seed = input.username || input.name || "rusability";
  return glyphAvatar(seed, { elite: Boolean(input.elite) });
}
