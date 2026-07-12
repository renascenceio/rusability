/**
 * Editorial content-safety filter for the news aggregator (and a shared policy
 * string injected into every AI job). Rusability is a business / marketing /
 * tech / science outlet, so we hard-drop source items about topics the editor
 * has banned: Ukraine, war, politics, drugs, gambling/casino, adult content,
 * terrorism/extremism.
 *
 * Client-safe: pure consts + functions only, so both UI and server can import.
 *
 * Matching strategy: we tokenise text into words (Cyrillic/Latin/digits) and
 * test each token, which avoids substring false positives that a naive
 * `includes()` would cause — e.g. "выборка" (data sample) must NOT trip the
 * "выборы" (elections) rule, and "протестировать" (to test) must NOT trip
 * "протест" (protest).
 *
 * - STEM rules match a token by PREFIX (e.g. "украин" → "украина",
 *   "украинский"). Use only for unambiguous long stems.
 * - WORD rules match a WHOLE token exactly (e.g. "сво", "нато"). Use for short
 *   or ambiguous tokens.
 */

export type BlockReason =
  | "украинская тематика"
  | "военная тематика"
  | "политика"
  | "наркотики"
  | "азартные игры"
  | "контент 18+"
  | "терроризм и экстремизм";

interface Rule {
  reason: BlockReason;
  stems?: string[];
  words?: string[];
}

const RULES: Rule[] = [
  {
    reason: "украинская тематика",
    stems: [
      "украин",
      "киев",
      "київ",
      "зеленск",
      "донбасс",
      "донецк",
      "луганск",
      "харьков",
      "одесс",
      "мариупол",
      "херсон",
      "бахмут",
      "авдеевк",
      "купянск",
      "славянск",
      "краматорск",
      "николаев",
      "кременчуг",
      "запорожск",
    ],
    words: ["всу", "зсу", "днр", "лнр"],
  },
  {
    reason: "военная тематика",
    stems: [
      "войн",
      "военн",
      "спецоперац",
      "обстрел",
      "ракетн",
      "ракета",
      "ракеты",
      "дрон",
      "беспилотн",
      "мобилизац",
      "артиллер",
      "авиауда",
      "бомбардир",
      "наступлен",
      "окоп",
      "снаряд",
      "боеприпас",
      "хаймарс",
      "himars",
      "ядерн",
      "фронтов",
    ],
    words: ["война", "войну", "войне", "войны", "войной", "сво", "нато", "фронт", "фронте"],
  },
  {
    reason: "политика",
    stems: [
      "госдум",
      "депутат",
      "сенатор",
      "оппозиц",
      "митинг",
      "инаугурац",
      "референдум",
      "парламент",
      "кремл",
      "путин",
      "байден",
      "трамп",
      "лавров",
      "песков",
      "импичмент",
      "предвыборн",
      "протестующ",
      "протестн",
      "геополит",
    ],
    words: [
      "выборы",
      "выборов",
      "выборах",
      "выборам",
      "протест",
      "протеста",
      "протесты",
      "протестов",
      "митинги",
    ],
  },
  {
    reason: "наркотики",
    stems: [
      "наркотик",
      "наркоман",
      "наркоконтрол",
      "наркотраф",
      "героин",
      "кокаин",
      "марихуан",
      "каннабис",
      "гашиш",
      "мефедрон",
      "амфетамин",
      "метамфетамин",
      "психотроп",
      "cocaine",
      "heroin",
      "cannabis",
    ],
    words: ["наркота", "дурь", "weed"],
  },
  {
    reason: "азартные игры",
    stems: [
      "казино",
      "азартн",
      "букмекер",
      "игорн",
      "тотализатор",
      "казик",
      "casino",
      "gambling",
    ],
    words: ["poker", "betting", "1xbet"],
  },
  {
    reason: "контент 18+",
    stems: [
      "порно",
      "порнограф",
      "эротик",
      "проститу",
      "вебкам",
      "эскорт",
      "онлифанс",
      "onlyfans",
    ],
    words: ["порн", "xxx", "porn", "секс", "sex"],
  },
  {
    reason: "терроризм и экстремизм",
    stems: ["террор", "теракт", "экстремис", "смертник"],
    words: ["игил", "боевик", "боевики", "боевиков"],
  },
];

/** Split text into lowercase word tokens; normalise ё→е for stable matching. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/[^0-9a-zа-я]+/)
    .filter(Boolean);
}

/**
 * Return the first ban reason the text trips, or null if it is safe.
 * Checks title + summary combined.
 */
export function blockReason(text: string): BlockReason | null {
  if (!text) return null;
  const tokens = tokenize(text);
  if (tokens.length === 0) return null;
  const set = new Set(tokens);
  for (const rule of RULES) {
    if (rule.words) {
      for (const w of rule.words) {
        if (set.has(w)) return rule.reason;
      }
    }
    if (rule.stems) {
      for (const t of tokens) {
        for (const stem of rule.stems) {
          if (t.startsWith(stem)) return rule.reason;
        }
      }
    }
  }
  return null;
}

/** Convenience wrapper for a source item (title + summary). */
export function isBlockedItem(input: { title?: string | null; summary?: string | null }): {
  blocked: boolean;
  reason: BlockReason | null;
} {
  const reason = blockReason(`${input.title ?? ""} ${input.summary ?? ""}`);
  return { blocked: reason !== null, reason };
}

/**
 * Human-readable editorial safety policy, injected into AI news/article
 * prompts as a hard second-layer gate (in addition to the keyword pre-filter).
 */
export const SAFETY_POLICY_RU = `РЕДАКЦИОННАЯ ПОЛИТИКА БЕЗОПАСНОСТИ (соблюдай неукоснительно):
- Rusability — деловое медиа о маркетинге, бизнесе, технологиях и науке. Пиши только по этим темам.
- ПОЛНОСТЬЮ ИГНОРИРУЙ и НЕ публикуй материалы про: Украину и события вокруг неё; войну, боевые действия, армию, оружие; политику, выборы, власть, геополитику; наркотики; азартные игры, казино, ставки, букмекеров; порнографию и контент 18+; терроризм и экстремизм.
- Никаких оценочных и авторских мнений на темы войны и политики — вообще не затрагивай эти темы.
- Если исходный материал относится к любой из запрещённых тем — не переписывай его и пометь как неподходящий (publishable=false).
- Разрешено писать про мировые и зарубежные события, ЕСЛИ они касаются бизнеса, маркетинга, технологий или науки и не относятся к запрещённым темам.`;
