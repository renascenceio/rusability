import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CONTENT_MODEL, buildRequirementsPreamble } from "./model";
import type { aiAuthors } from "@/lib/db/schema";
import type { ArticleBlock, CategorySlug } from "@/lib/types";

type AiAuthorRow = typeof aiAuthors.$inferSelect;

export interface GenerateArticleInput {
  author: AiAuthorRow;
  topic: string;
  keywords: string[];
  category: string;
  minWords: number;
  tone?: string;
}

export interface GeneratedArticle {
  title: string;
  excerpt: string;
  body: ArticleBlock[];
  tags: string[];
  readingMinutes: number;
  geoScore: number;
}

/* Block schema mirrors ArticleBlock (discriminated by `type`). */
const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: z.string() }),
  z.object({ type: z.literal("h2"), text: z.string() }),
  z.object({ type: z.literal("h3"), text: z.string() }),
  z.object({ type: z.literal("quote"), text: z.string(), cite: z.string().nullable() }),
  z.object({ type: z.literal("list"), items: z.array(z.string()) }),
]);

const articleSchema = z.object({
  title: z.string().describe("Заголовок статьи на русском, до 90 символов, с ключевым запросом"),
  excerpt: z.string().describe("Краткое описание для анонса, 1–2 предложения, прямой ответ на вопрос темы"),
  tags: z.array(z.string()).describe("3–6 тегов на русском в нижнем регистре"),
  geoScore: z
    .number()
    .describe("Самооценка готовности к ИИ-поиску (GEO/AEO) от 60 до 98"),
  body: z
    .array(blockSchema)
    .describe(
      "Тело статьи блоками. Начни с абзаца-ответа, затем чередуй подзаголовки h2/h3, абзацы p, списки list и при необходимости цитату quote. Заверши блоком-списком практических выводов.",
    ),
});

function countWords(body: ArticleBlock[]): number {
  let n = 0;
  for (const b of body) {
    if ("text" in b && b.text) n += b.text.split(/\s+/).length;
    if (b.type === "list") n += b.items.join(" ").split(/\s+/).length;
  }
  return n;
}

/**
 * Generate a full Russian article in one author's voice, obeying the editable
 * AI Requirements (global + articles) plus AEO/SEO/GEO structure.
 */
export async function generateArticle(input: GenerateArticleInput): Promise<GeneratedArticle> {
  const { author, topic, keywords, category, minWords } = input;
  const preamble = await buildRequirementsPreamble("articles");

  const system = [
    `Ты — «${author.name}», ${author.archetype}. Пишешь для медиа Rusability на русском языке.`,
    `ТВОЙ ГОЛОС: ${author.tone}`,
    `ТВОЙ ПОДХОД: ${author.approach}`,
    author.stylePrompt,
    "",
    preamble,
    "",
    `Объём статьи — не меньше ${minWords} слов. Обязательно: минимум один разбор кейса или пример с цифрами.`,
    "Не используй разметку markdown внутри текстовых блоков — только чистый текст.",
  ]
    .filter(Boolean)
    .join("\n");

  const kw = keywords.length ? `Ключевые запросы для SEO: ${keywords.join(", ")}.` : "";
  const toneHint = input.tone ? `Дополнительный тон для этого материала: ${input.tone}.` : "";

  const { output } = await generateText({
    model: CONTENT_MODEL,
    output: Output.object({ schema: articleSchema }),
    system,
    prompt: `Напиши развёрнутую экспертную статью по теме: «${topic}».
Категория: ${category}. ${kw} ${toneHint}
Соблюдай структуру AEO/SEO/GEO: прямой ответ в начале, содержательные подзаголовки, конкретный кейс, список выводов в конце.`,
  });

  // Normalise quote.cite (schema uses nullable → strip null for our type).
  const body: ArticleBlock[] = output.body.map((b) =>
    b.type === "quote" ? { type: "quote", text: b.text, ...(b.cite ? { cite: b.cite } : {}) } : b,
  );

  const words = countWords(body);
  const readingMinutes = Math.max(1, Math.round(words / 180));

  return {
    title: output.title.trim(),
    excerpt: output.excerpt.trim(),
    body,
    tags: output.tags.map((t) => t.toLowerCase().trim()).filter(Boolean).slice(0, 6),
    readingMinutes,
    geoScore: Math.min(98, Math.max(60, Math.round(output.geoScore))),
  };
}

export type { CategorySlug };
