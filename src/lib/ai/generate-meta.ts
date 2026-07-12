import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CONTENT_MODEL } from "./model";
import type { ArticleBlock } from "@/lib/types";

export interface ArticleMeta {
  /** Meta description / feed announcement, 1–2 sentences, ≤ 200 chars. */
  excerpt: string;
  seoScore: number;
  aeoScore: number;
  geoScore: number;
}

/** Flatten article blocks into plain text for the meta prompt. */
function bodyToText(body: ArticleBlock[]): string {
  const parts: string[] = [];
  for (const b of body) {
    if ("text" in b && b.text) parts.push(b.text);
    if (b.type === "list" && Array.isArray(b.items)) parts.push(b.items.join(". "));
  }
  return parts.join("\n\n");
}

const schema = z.object({
  excerpt: z
    .string()
    .describe("Мета-описание статьи на русском: 1–2 предложения, до 200 символов, прямой ответ на запрос темы, без кликбейта"),
  seoScore: z.number().describe("Оценка классической SEO-оптимизации от 60 до 98"),
  aeoScore: z.number().describe("Оценка ответной оптимизации (AEO) от 60 до 98"),
  geoScore: z.number().describe("Оценка готовности к генеративному ИИ-поиску (GEO) от 60 до 98"),
});

const clamp = (n: number) => Math.min(98, Math.max(60, Math.round(n)));

/**
 * Auto-assign SEO metadata for ANY article regardless of how it was authored
 * (user, cron, AI). Produces a clean meta description and honest SEO/AEO/GEO
 * self-assessments from the finished title + body. Best-effort: callers should
 * fall back to a trimmed excerpt if this throws (no network / model error).
 */
export async function generateArticleMeta(input: {
  title: string;
  body: ArticleBlock[];
  category: string;
}): Promise<ArticleMeta> {
  const text = bodyToText(input.body).slice(0, 6000);

  const { output } = await generateText({
    model: CONTENT_MODEL,
    output: Output.object({ schema }),
    system:
      "Ты SEO-редактор медиа Rusability. По готовой статье составь честное мета-описание и оцени её оптимизацию для классического поиска (SEO), ответных систем (AEO) и генеративного ИИ-поиска (GEO). Оценки должны отражать реальное качество структуры и содержания, а не быть завышенными.",
    prompt: `Категория: ${input.category}
Заголовок: ${input.title}

Текст статьи:
"""
${text}
"""

Составь мета-описание и оценки.`,
  });

  return {
    excerpt: output.excerpt.trim(),
    seoScore: clamp(output.seoScore),
    aeoScore: clamp(output.aeoScore),
    geoScore: clamp(output.geoScore),
  };
}

/** Cheap non-AI fallback meta description from the body text. */
export function fallbackExcerpt(body: ArticleBlock[]): string {
  const text = bodyToText(body).replace(/\s+/g, " ").trim();
  if (text.length <= 200) return text;
  const cut = text.slice(0, 200);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return (lastStop > 120 ? cut.slice(0, lastStop + 1) : cut.trimEnd() + "…").trim();
}
