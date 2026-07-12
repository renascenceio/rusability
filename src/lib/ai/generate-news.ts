import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CONTENT_MODEL, buildRequirementsPreamble } from "./model";
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
}

const newsSchema = z.object({
  title: z.string().describe("Оригинальный заголовок новости на русском, до 90 символов, без кликбейта"),
  excerpt: z.string().describe("Лид-абзац: суть новости в 1–2 предложениях, прямой ответ на вопрос «что произошло»"),
  body: z
    .array(z.string())
    .describe("2–4 абзаца связного текста на русском: что произошло, детали, значение для рынка. Только чистый текст."),
  tags: z.array(z.string()).describe("2–5 тегов на русском в нижнем регистре"),
  category: z.enum(["tech", "marketing", "business", "science"]),
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
  };
}
