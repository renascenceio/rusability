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
  | "терроризм и экстремизм"
  | "нерелевантная тема";

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
  {
    // Off-topic for a business/marketing/tech/science outlet: sports, celebrity
    // gossip, transport schedules, weather, lifestyle/health tips, recipes,
    // horoscopes, leisure travel. Stems chosen to avoid false positives with
    // relevant terms (e.g. "маршрут пользователя", "здоровье бренда").
    reason: "нерелевантная тема",
    stems: [
      // sports
      "футбол",
      "хоккей",
      "баскетбол",
      "волейбол",
      "теннис",
      "биатлон",
      "олимпиад",
      "чемпионат",
      "первенств",
      "турнир",
      "вратар",
      "полузащит",
      "нападающ",
      "легкоатлет",
      "месси",
      "роналду",
      "мбаппе",
      "неймар",
      "овечкин",
      // celebrity / entertainment
      "знаменитост",
      "актрис",
      "актёр",
      "актер",
      "певиц",
      "певец",
      "рэпер",
      "сериал",
      "кинопремьер",
      "кинофестивал",
      "гастрол",
      "папарацци",
      // weather
      "синоптик",
      "циклон",
      "антициклон",
      "заморозк",
      "похолодан",
      "потеплен",
      "снегопад",
      // lifestyle / health tips / food / travel leisure
      "похуден",
      "гороскоп",
      "зодиак",
      "знахар",
      "курорт",
      // transport schedules
      "электричк",
      "авиарейс",
      "аэроэкспресс",
    ],
    words: [
      "спорт",
      "спорта",
      "спорте",
      "матч",
      "матча",
      "матчи",
      "гол",
      "голы",
      "уефа",
      "фифа",
      "кхл",
      "рпл",
      "нба",
      "погода",
      "погоды",
      "погоду",
      "рейс",
      "рейсы",
      "рейса",
      "рейсов",
      "автобус",
      "автобусы",
      "автобусов",
      "ягода",
      "ягоды",
      "ягод",
      "витамины",
      "диета",
      "диеты",
      "рецепт",
      "рецепты",
    ],
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

/** Normalise text for admin stop-term matching (lowercase, ё→е, collapse spaces). */
function normForTerms(s: string): string {
  return s.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
}

/**
 * Match text against an admin-managed blocklist of stop-terms (the "неверная
 * тема" feedback the editor gives from the admin). Returns the first matching
 * term or null. A multi-word term matches as a normalised substring (phrase);
 * a single word matches as a whole token OR as a ≥4-char prefix stem, so
 * inflected forms are caught (e.g. blocking "аэрофлот" also drops "аэрофлота").
 */
export function matchesBlockedTerm(text: string, terms: string[]): string | null {
  if (!text || !terms?.length) return null;
  const norm = normForTerms(text);
  const tokens = new Set(tokenize(text));
  for (const raw of terms) {
    const term = normForTerms(raw);
    if (!term) continue;
    if (term.includes(" ")) {
      if (norm.includes(term)) return raw;
    } else {
      if (tokens.has(term)) return raw;
      if (term.length >= 4) {
        for (const t of tokens) if (t.startsWith(term)) return raw;
      }
    }
  }
  return null;
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

/**
 * Relevance gate for the news aggregator. Rusability is a professional B2B
 * outlet — we publish ONLY business / marketing / tech / fintech / biotech /
 * AI / startups / e-commerce / science. This is injected into the news rewrite
 * prompt so the model drops off-topic firehose items (sports, celebrities,
 * transport schedules, weather, lifestyle) that the keyword filter may miss —
 * especially for English/Chinese source items.
 */
export const RELEVANCE_POLICY_RU = `РЕЛЕВАНТНОСТЬ (обязательно):
- Публикуй ТОЛЬКО материалы по темам: бизнес и экономика компаний, маркетинг и реклама, технологии и IT, нейросети и ИИ, финтех, биотех и медтех, стартапы и инвестиции, e-commerce и ритейл, наука и исследования.
- НЕ публикуй (ставь publishable=false, blockReason="нерелевантная тема"): спорт и результаты матчей; знаменитостей, шоу-бизнес, кино и сериалы; расписания рейсов, транспорт, аэропорты, автобусы, электрички; погоду; советы о здоровье, диетах, «полезных продуктах», рецепты; гороскопы; туризм и отдых; бытовые происшествия и повседневные городские новости без делового значения.
- Материал может быть на английском или китайском — перепиши его суть на русском. Если тема нерелевантна нашим рубрикам — отклони.
- Если сомневаешься, относится ли материал к нашим темам, — отклоняй (publishable=false).`;
