import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CONTENT_MODEL, buildRequirementsPreamble } from "./model";
import {
  SAFETY_POLICY_RU,
  RELEVANCE_POLICY_RU,
  FORMAT_GEO_POLICY_RU,
  buildClassExamplesBlock,
} from "./content-filter";
import type { NewsCategory } from "@/lib/types";

export type NewsFormat = "news" | "article" | "borderline";
export type GeoScope = "in_scope" | "out_of_scope" | "unclear";

/**
 * AEO/GEO/SEO editorial policy injected into every news rewrite so that even
 * short news notes are structured for answer engines and generative search,
 * not just classic SEO.
 */
const AEO_GEO_SEO_POLICY_RU = [
  "ОПТИМИЗАЦИЯ ПОД ПОИСК И ИИ-АССИСТЕНТЫ (AEO / GEO / SEO) — обязательна для КАЖДОЙ новости:",
  "• Лид (excerpt) — это ПРЯМОЙ ОТВЕТ на вопрос «что произошло»: главный факт в первом предложении, без разгона и предыстории (принцип «ответ сначала»).",
  "• Пиши самодостаточными абзацами: каждый абзац понятен в отрыве от остальных, чтобы ИИ мог процитировать любой фрагмент.",
  "• Называй конкретные сущности: компании, продукты, суммы, даты, проценты, имена — это то, что извлекают нейропоисковики (ChatGPT, Алиса, Gemini, Perplexity) и Яндекс/Google.",
  "• keyPoints — короткая выжимка (TL;DR) из 2–4 самодостаточных тезисов для быстрого ответа ассистента.",
  "• faq — 3–4 реальных вопроса, которые пользователь задаёт по этой теме, с прямыми полными ответами. Это повышает шанс попасть в блок ответов и в featured snippet.",
  "• metaTitle (≤60 симв.) и metaDescription (140–160 симв.) — с главным ключевым запросом, информативные, без кликбейта.",
  "• Никакой воды, штампов и «в современном мире»: только факты и польза. Плотность фактов важнее объёма.",
  "• Оцени материал по шкалам geoScore / seoScore / aeoScore (0–100) честно, исходя из этих критериев.",
].join("\n");

export interface RewriteNewsInput {
  sourceTitle: string;
  sourceSummary: string;
  sourceName: string;
  category: NewsCategory;
  /** Recent editorial decisions used as few-shot guidance for the classifier. */
  examples?: { good: string[]; bad: string[] };
}

export interface RewrittenNews {
  title: string;
  excerpt: string;
  body: string[];
  tags: string[];
  category: NewsCategory;
  publishable: boolean;
  blockReason: string | null;
  format: NewsFormat;
  geoScope: GeoScope;
  /** AEO/GEO/SEO extras. */
  keyPoints: string[];
  faq: { q: string; a: string }[];
  metaTitle: string;
  metaDescription: string;
  geoScore: number;
  seoScore: number;
  aeoScore: number;
}

const newsSchema = z.object({
  publishable: z
    .boolean()
    .describe(
      "true ТОЛЬКО если материал (1) относится к нашим рубрикам (бизнес, маркетинг, технологии, нейросети/ИИ, финтех, биотех, стартапы, e-commerce, наука) И (2) не относится к запрещённым темам. false — если тема запрещена (Украина, война, политика, наркотики, азартные игры, 18+, терроризм) ИЛИ нерелевантна (спорт, знаменитости, расписания рейсов, погода, здоровье/диеты, гороскопы, туризм, бытовые новости).",
    ),
  blockReason: z
    .string()
    .nullable()
    .describe("Если publishable=false — короткая причина на русском (например «нерелевантная тема» или «спорт»). Иначе null."),
  title: z.string().describe("Оригинальный заголовок новости на русском, до 90 символов, без кликбейта"),
  excerpt: z.string().describe("Лид-абзац: суть новости в 1–2 предложениях, прямой ответ на вопрос «что произошло»"),
  body: z
    .array(z.string())
    .describe("2–4 абзаца связного текста на русском: что произошло, детали, значение для рынка. Только чистый текст."),
  tags: z.array(z.string()).describe("2–5 тегов на русском в нижнем регистре"),
  category: z
    .enum(["tech", "marketing", "business", "science", "fintech", "biotech", "ai", "startups", "ecommerce"])
    .describe(
      "Наиболее точная рубрика: ai — нейросети/ИИ; fintech — финтех, платежи, банки; biotech — биотех/медтех/фарма; startups — стартапы и инвестиции; ecommerce — онлайн-торговля; tech — прочие технологии; marketing; business; science.",
    ),
  format: z
    .enum(["news", "article"])
    .describe(
      'Формат материала: "news" — это событие с привязкой ко времени (что произошло). "article" — вечнозелёный/аналитический материал без конкретного события (подборки, рейтинги, обзоры трендов, гайды, мнения).',
    ),
  formatConfidence: z
    .enum(["high", "low"])
    .describe(
      '"high" — уверен в определении формата. "low" — пограничный случай: аналитика/комментарий, привязанные к свежему поводу, которые можно опубликовать как новость (тогда решает редактор).',
    ),
  geoScope: z
    .enum(["in_scope", "out_of_scope", "unclear"])
    .describe(
      '"in_scope" — про Россию/Казахстан/Узбекистан/Беларусь/Киргизию/Таджикистан ИЛИ глобально релевантная бизнес/тех-новость. "out_of_scope" — привязано к конкретному зарубежному рынку вне этого списка (напр. «топ маркетплейсов США»). "unclear" — не уверен.',
    ),
  keyPoints: z
    .array(z.string())
    .describe(
      "AEO: 2–4 ключевых тезиса-выжимки (TL;DR). Каждый — законченное самодостаточное утверждение из одного предложения, которое отвечает на вопрос читателя даже вне контекста статьи (для цитирования нейропоисковиками и голосовыми ассистентами). Только факты из текста, без воды.",
    ),
  faq: z
    .array(z.object({ q: z.string(), a: z.string() }))
    .describe(
      "AEO/GEO: 3–4 пары «вопрос-ответ». Вопросы — так, как их реально задают люди и вводят в поиск («Что такое…», «Почему…», «Как повлияет…», «Когда…»). Ответы — прямые, полные, самодостаточные, 1–3 предложения, содержат ключевые сущности и цифры. Не повторяй дословно лид.",
    ),
  metaTitle: z
    .string()
    .describe("SEO title до 60 символов: содержит главный ключевой запрос, отражает суть, без кликбейта."),
  metaDescription: z
    .string()
    .describe("SEO meta description 140–160 символов: краткое информативное описание с ключевыми словами, побуждающее к переходу."),
  geoScore: z
    .number()
    .min(0)
    .max(100)
    .describe("GEO (Generative Engine Optimization): насколько текст пригоден для цитирования генеративными ИИ-поисковиками (структура, факты, сущности, отсутствие воды). 0–100."),
  seoScore: z
    .number()
    .min(0)
    .max(100)
    .describe("SEO: насколько материал оптимизирован для классического поиска (ключевые слова, заголовок, мета, структура). 0–100."),
  aeoScore: z
    .number()
    .min(0)
    .max(100)
    .describe("AEO (Answer Engine Optimization): насколько легко извлечь из текста прямой ответ (лид-ответ, тезисы, FAQ). 0–100."),
});

/**
 * Rewrite an aggregated source item into an original Russian news note.
 * Never copies the source verbatim — summarises + reframes with attribution
 * handled separately (we store the original source name + url).
 */
export async function rewriteNews(input: RewriteNewsInput): Promise<RewrittenNews> {
  const preamble = await buildRequirementsPreamble("news");

  const examplesBlock = buildClassExamplesBlock(input.examples ?? { good: [], bad: [] });

  const system = [
    "Ты — новостной редактор русскоязычного делового медиа Rusability.",
    "Ты получаешь заголовок и краткое описание из внешнего источника и пишешь СВОЮ оригинальную новостную заметку на русском.",
    "Категорически нельзя копировать текст источника дословно — только переосмысление и пересказ своими словами.",
    "Источник может быть на русском, английском или китайском — итоговую заметку всегда пиши на русском.",
    "",
    SAFETY_POLICY_RU,
    "",
    RELEVANCE_POLICY_RU,
    "",
    FORMAT_GEO_POLICY_RU,
    "",
    AEO_GEO_SEO_POLICY_RU,
    ...(examplesBlock ? ["", examplesBlock] : []),
    "",
    preamble,
  ].join("\n");

  const { output } = await generateText({
    model: CONTENT_MODEL,
    output: Output.object({ schema: newsSchema }),
    system,
    prompt: `Источник: ${input.sourceName}.
Заголовок источника: «${input.sourceTitle}».
Краткое описание: «${input.sourceSummary || "(нет описания)"}»
Предполагаемая категория: ${input.category}.

Напиши оригинальную новостную заметку на русском по этому событию: заголовок, лид-ОТВЕТ и 2–4 абзаца. Затем добавь для оптимизации под поиск и ИИ-ассистенты: keyPoints (2–4 тезиса-выжимки), faq (3–4 вопроса-ответа), metaTitle, metaDescription и честные оценки geoScore/seoScore/aeoScore. Если данных мало — не выдумывай факты, опиши только то, что известно.`,
  });

  // A low-confidence format call is a borderline item → editor decides.
  const format: NewsFormat = output.formatConfidence === "low" ? "borderline" : output.format;

  const clampScore = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  return {
    title: output.title.trim(),
    excerpt: output.excerpt.trim(),
    body: output.body.map((p) => p.trim()).filter(Boolean),
    tags: output.tags.map((t) => t.toLowerCase().trim()).filter(Boolean).slice(0, 5),
    category: output.category,
    publishable: output.publishable,
    blockReason: output.blockReason?.trim() || null,
    format,
    geoScope: output.geoScope,
    keyPoints: (output.keyPoints ?? []).map((p) => p.trim()).filter(Boolean).slice(0, 4),
    faq: (output.faq ?? [])
      .map((f) => ({ q: f.q.trim(), a: f.a.trim() }))
      .filter((f) => f.q && f.a)
      .slice(0, 4),
    metaTitle: output.metaTitle?.trim() || output.title.trim(),
    metaDescription: output.metaDescription?.trim() || output.excerpt.trim(),
    geoScore: clampScore(output.geoScore ?? 0),
    seoScore: clampScore(output.seoScore ?? 0),
    aeoScore: clampScore(output.aeoScore ?? 0),
  };
}
