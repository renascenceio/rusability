/**
 * Strip the formulaic trailing year that AI title generators habitually bolt
 * onto the end of a headline ("… к решительным действиям в 2026 году",
 * "… в B2B-продажах 2026"). This is a machine-generated tell and makes the feed
 * look templated; the publish date already carries recency.
 *
 * ★What it deliberately does NOT touch — the "year as the actual subject" cases,
 * which are legitimate and must survive:★
 *   • "CX-тренды 2026", "Тренды электронной коммерции 2026"
 *   • "Прогноз на 2026", "Итоги 2025 года", "Чего ждать в 2026-м: прогноз"
 * The rule: only remove a year that appears as a DANGLING SUFFIX after real
 * title content, and only via the generic connective patterns ("в NNNN году",
 * a trailing bare " NNNN"). A year that is grammatically part of the subject
 * (preceded by тренд/прогноз/итог/обзор, or standing as the headline's own
 * noun phrase) is left alone. When in doubt we KEEP the year — a false strip
 * that mangles a trends headline is worse than leaving one generic suffix.
 *
 * Pure/deterministic and dependency-free so it is safe to run at generation time
 * on every title and to reuse for the one-off backfill of existing rows.
 */

/**
 * A year is the SUBJECT only when it sits DIRECTLY next to a period/outlook
 * word — "тренды 2026", "прогноз на 2026", "итоги 2025", "чего ждать в 2026".
 * This is intentionally POSITIONAL: a title that merely contains "бюджет" or
 * "прогнозировать" elsewhere while ending in a generic "… в 2026 году" suffix
 * is NOT a year-subject title — the year is still a formulaic tail and must be
 * stripped. So we only spare the year when an outlook word immediately precedes
 * it (allowing a short connective like "на"/"в").
 */
const YEAR_SUBJECT_ADJACENT =
  /(тренд[а-я]*|прогноз[а-я]*|итог[а-я]*|обзор[а-я]*|перспектив[а-я]*|план[а-я]*|бюджет[а-я]*|календар[ья]|дорожн[а-я]*\s+карт[а-я]*|road ?map|чего ждать|что изменится|что нас ждёт|что нас ждет)\s+(?:в|во|на|к)?\s*20\d{2}/i;

export function tidyTitle(raw: string): string {
  let t = (raw ?? "").trim();
  if (!t) return t;

  // Spare the title ONLY when the year is adjacent to an outlook word (the year
  // is genuinely the subject). A trend-word elsewhere in the sentence does not
  // count.
  if (YEAR_SUBJECT_ADJACENT.test(t)) return t;

  const before = t;

  // NOTE: JS `\b` is ASCII-only, so `\bв` NEVER matches a Cyrillic "в" — it
  // silently fails and keeps the suffix. Anchor on whitespace/comma/dash before
  // "в" instead, never a word boundary.

  // 1) Trailing connective + "2026 году" / "2026-м году" / "2026 года" — covers
  //    "… в 2026 году", "… к 2026 году", "… на 2026 год", "… для 2026 года".
  //    Optional final punct.
  t = t.replace(/[\s,–—-]+(?:в|во|к|на|для|за)\s+20\d{2}(?:-?м)?\s+год[ауеы]?\s*[.!?]?\s*$/iu, "");

  // 2) Trailing connective + bare year WITHOUT "году" ("… в 2026", "… к 2026") —
  //    strip the connective together with the year so no orphan is left behind.
  if (t === before) {
    t = t.replace(/[\s,–—-]+(?:в|во|к|на|для|за)\s+20\d{2}(?:-?м)?\s*[.!?]?\s*$/iu, "");
  }

  // 3) Trailing bare year "… риски и решения 2026" / "… 2026 года" — a dangling
  //    year at the very end (subject-years were already spared by the guard).
  if (t === before) {
    t = t.replace(/[\s,–—-]+20\d{2}(?:-?м)?(?:\s+год[ауеы]?)?\s*[.!?]?\s*$/u, "");
  }

  t = t.trim();
  // Tidy a dangling connective / punctuation left behind by the removal
  // (a trailing lone "в", "на", "для", a colon, a comma, a dash…). NOTE: JS `\b`
  // is ASCII-only and NEVER matches before a Cyrillic word, so anchor on
  // whitespace + end, not `\b`.
  t = t.replace(/[\s,:–—-]+$/u, "").trim();
  t = t.replace(/\s+(?:в|во|на|для|к|ко|за|о|об|про|при)[\s,:–—-]*$/iu, "").trim();
  t = t.replace(/[\s,:–—-]+$/u, "").trim();

  // Never return an empty or absurdly short title — fall back to the original.
  if (t.length < 8) return before;
  return t;
}
