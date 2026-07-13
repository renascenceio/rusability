import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CONTENT_MODEL, buildRequirementsPreamble } from "./model";
import { SAFETY_POLICY_RU, RELEVANCE_POLICY_RU } from "./content-filter";
import type { NewsCategory } from "@/lib/types";

export interface RewriteNewsInput {
  sourceTitle: string;
  sourceSummary: string;
  sourceName: string;
  category: NewsCategory;
}

export interface RewrittenNews {
  title: string;
  excerpt: string;
  body: string[];
  tags: string[];
  category: NewsCategory;
  publishable: boolean;
  blockReason: string | null;
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
});

/**
 * Rewrite an aggregated source item into an original Russian news note.
 * Never copies the source verbatim — summarises + reframes with attribution
 * handled separately (we store the original source name + url).
 */
export async function rewriteNews(input: RewriteNewsInput): Promise<RewrittenNews> {
  const preamble = await buildRequirementsPreamble("news");

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

Напиши оригинальную новостную заметку на русском по этому событию: заголовок, лид и 2–4 абзаца. Если данных мало — не выдумывай факты, опиши только то, что известно.`,
  });

  return {
    title: output.title.trim(),
    excerpt: output.excerpt.trim(),
    body: output.body.map((p) => p.trim()).filter(Boolean),
    tags: output.tags.map((t) => t.toLowerCase().trim()).filter(Boolean).slice(0, 5),
    category: output.category,
    publishable: output.publishable,
    blockReason: output.blockReason?.trim() || null,
  };
}
