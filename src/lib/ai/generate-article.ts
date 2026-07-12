import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CONTENT_MODEL, buildRequirementsPreamble } from "./model";
import type { aiAuthors } from "@/lib/db/schema";
import type { ArticleBlock, CategorySlug, FaqItem } from "@/lib/types";

type AiAuthorRow = typeof aiAuthors.$inferSelect;

export interface GenerateArticleInput {
  author: AiAuthorRow;
  topic: string;
  keywords: string[];
  category: string;
  minWords: number;
  tone?: string;
  /** Elite authors get an FAQ block + surfaced AEO/SEO/GEO scores. */
  elite?: boolean;
}

export interface GeneratedArticle {
  title: string;
  excerpt: string;
  body: ArticleBlock[];
  tags: string[];
  readingMinutes: number;
  geoScore: number;
  seoScore: number;
  aeoScore: number;
  /** Populated only for Elite authors; empty otherwise. */
  faq: FaqItem[];
}

/* Flat block schema — every field present + nullable for strict structured
 * output (Gemini/OpenAI reject optional fields). Normalised into ArticleBlock
 * after generation. `text` holds paragraph/heading/quote copy; `items` holds
 * list bullets; `cite` is the optional quote attribution. */
const blockSchema = z.object({
  type: z.enum(["p", "h2", "h3", "quote", "list"]),
  text: z.string().nullable(),
  items: z.array(z.string()).nullable(),
  cite: z.string().nullable(),
});

const faqSchema = z.object({
  q: z.string().describe("Вопрос, который реально задают по теме"),
  a: z.string().describe("Краткий самодостаточный ответ, 2–4 предложения"),
});

const articleSchema = z.object({
  title: z.string().describe("Заголовок статьи на русском, до 90 символов, с ключевым запросом"),
  excerpt: z.string().describe("Краткое описание для анонса, 1–2 предложения, прямой ответ на вопрос темы"),
  tags: z.array(z.string()).describe("3–6 тегов на русском в нижнем регистре"),
  geoScore: z
    .number()
    .describe("Самооценка готовности к ИИ-поиску (GEO — Generative Engine Optimization) от 60 до 98"),
  seoScore: z
    .number()
    .describe("Самооценка классической SEO-оптимизации (структура, ключи, заголовки) от 60 до 98"),
  aeoScore: z
    .number()
    .describe("Самооценка ответной оптимизации (AEO — прямые ответы, определения, FAQ) от 60 до 98"),
  faq: z
    .array(faqSchema)
    .describe(
      "Блок вопросов и ответов для AEO/GEO. Если попросили — верни 6–8 пунктов; иначе пустой массив.",
    ),
  body: z
    .array(blockSchema)
    .describe(
      "Тело статьи блоками. Начни с абзаца-ответа, затем чередуй подзаголовки h2/h3, абзацы p, списки list и обязательно 1–2 цитаты quote (яркая мысль или мнение эксперта с атрибуцией в cite). Заверши блоком-списком практических выводов.",
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
    `Объём статьи — строго не меньше ${minWords} слов (это жёсткое требование, а не ориентир; лучше ${Math.round(
      minWords * 1.2,
    )}). Раскрывай каждый подзаголовок минимум в 3–4 содержательных абзаца, добавляй подтемы, чтобы полностью закрыть тему.`,
    "Обязательно: минимум один разбор кейса или пример с конкретными цифрами.",
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

  // Normalise flat blocks → ArticleBlock, dropping empty/invalid ones.
  const body: ArticleBlock[] = [];
  for (const b of output.body) {
    if (b.type === "list") {
      const items = (b.items ?? []).map((x) => x.trim()).filter(Boolean);
      if (items.length) body.push({ type: "list", items });
    } else if (b.type === "quote") {
      const text = (b.text ?? "").trim();
      if (text) body.push({ type: "quote", text, ...(b.cite ? { cite: b.cite.trim() } : {}) });
    } else {
      const text = (b.text ?? "").trim();
      if (text) body.push({ type: b.type, text });
    }
  }

  // Enforce the word floor with one bounded expansion pass: if the draft is
  // short, ask for extra sections and append them (the model routinely
  // under-delivers on length even when asked, so we top it up rather than
  // regenerate the whole piece).
  if (countWords(body) < minWords) {
    try {
      const have = countWords(body);
      const outline = body
        .filter((b) => b.type === "h2" || b.type === "h3")
        .map((b) => ("text" in b ? b.text : ""))
        .filter(Boolean)
        .join("; ");
      const { output: extra } = await generateText({
        model: CONTENT_MODEL,
        output: Output.object({ schema: z.object({ body: z.array(blockSchema) }) }),
        system,
        prompt: `Статья по теме «${topic}» пока слишком короткая (${have} слов, нужно не меньше ${minWords}).
Уже раскрыты разделы: ${outline || "(введение)"}.
Напиши ДОПОЛНИТЕЛЬНЫЕ разделы (новые подзаголовки h2/h3, абзацы, списки, при желании кейс с цифрами), которые НЕ повторяют уже написанное и добавляют минимум ${
          minWords - have + 150
        } слов. Верни только новые блоки.`,
      });
      for (const b of extra.body) {
        if (b.type === "list") {
          const items = (b.items ?? []).map((x) => x.trim()).filter(Boolean);
          if (items.length) body.push({ type: "list", items });
        } else if (b.type === "quote") {
          const text = (b.text ?? "").trim();
          if (text) body.push({ type: "quote", text, ...(b.cite ? { cite: b.cite.trim() } : {}) });
        } else {
          const text = (b.text ?? "").trim();
          if (text) body.push({ type: b.type, text });
        }
      }
    } catch {
      // If the expansion pass fails, keep the original draft rather than error.
    }
  }

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
