/*
  Deterministic profile avatars via DiceBear "Glyphs" (v10 HTTP API).
  https://www.dicebear.com/styles/glyphs/

  - Regular users: each seed gets its own auto-generated colour/glyph.
  - Elite authors & admins: gold circle background with dark glyph elements,
    matching the platform's Elite treatment.

  The Glyphs style exposes a single colour group ("glyph") plus the shared
  "backgroundColor"/"backgroundType" options, so we drive Elite styling with
  `glyphColor` (dark) + `backgroundColor` (gold).
*/

const DICEBEAR_GLYPHS = "https://api.dicebear.com/10.x/glyphs/svg";

/** Gold used for Elite avatar backgrounds — matches `--gold` in globals.css. */
const ELITE_GOLD = "e8a85a";
/** Dark ink used for Elite glyph elements — matches `--elite`. */
const ELITE_INK = "1a1410";

export function glyphAvatar(seed: string, opts?: { elite?: boolean }): string {
  const params = new URLSearchParams({ seed: (seed || "rusability").trim() });
  if (opts?.elite) {
    params.set("backgroundColor", ELITE_GOLD);
    params.set("backgroundType", "solid");
    params.set("glyphColor", ELITE_INK);
  }
  return `${DICEBEAR_GLYPHS}?${params.toString()}`;
}

/** True when the stored avatar is empty or a generated placeholder we own. */
export function isGeneratedAvatar(url?: string | null): boolean {
  if (!url) return true;
  return url.includes("api.dicebear.com") || url.includes("/placeholder");
}

/**
 * Resolve the avatar to render for an author-like record. Falls back to a
 * deterministic Glyphs avatar (gold for Elite) when no real photo is set.
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
