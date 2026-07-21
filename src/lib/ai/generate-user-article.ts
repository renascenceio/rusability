import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CONTENT_MODEL, buildRequirementsPreamble } from "./model";
import { getHumanizerConfig, humanizeBlocks } from "./humanizer";
import { normalizeList } from "@/lib/article-list";
import type { ArticleBlock } from "@/lib/types";

export interface UserArticleInput {
  /** Author's display name — the piece is written in their first-person voice. */
  authorName: string;
  /** Freeform notes, outline, bullet points, pasted research or source text. */
  materials: string;
  /** Optional explicit topic/angle; falls back to inferring from materials. */
  topic?: string;
  category: string;
  /** Elite authors get an FAQ block for AEO/GEO. */
  elite?: boolean;
}

export interface GeneratedUserArticle {
  title: string;
  subtitle: string;
  excerpt: string;
  body: ArticleBlock[];
  tags: string[];
  readingMinutes: number;
  geoScore: number;
  seoScore: number;
  aeoScore: number;
}

const blockSchema = z.object({
  type: z.enum(["p", "h2", "h3", "quote", "list"]),
  text: z.string().nullable(),
  items: z.array(z.string()).nullable(),
  cite: z.string().nullable(),
  ordered: z.boolean().nullable(),
});

const schema = z.object({
  title: z.string().describe("Заголовок статьи на русском, до 90 символов, с ключевым запросом"),
  subtitle: z.string().describe("Короткий подзаголовок-лид, 1 предложение, раскрывает угол темы"),
  excerpt: z.string().describe("Анонс для ленты, 1–2 предложения, прямой ответ на вопрос темы"),
  tags: z.array(z.string()).describe("3–6 тегов на русском в нижнем регистре"),
  geoScore: z.number().describe("Самооценка готовности к ИИ-поиску (GEO) от 60 до 98"),
  seoScore: z.number().describe("Самооценка классической SEO-оптимизации от 60 до 98"),
  aeoScore: z.number().describe("Самооценка ответной оптимизации (AEO) от 60 до 98"),
  body: z
    .array(blockSchema)
    .describe(
      "Тело статьи блоками: абзац-ответ, затем подзаголовки h2/h3, абзацы p, списки list и 1–2 цитаты quote. Заверши списком практических выводов.",
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

function toBlocks(raw: z.infer<typeof blockSchema>[]): ArticleBlock[] {
  const body: ArticleBlock[] = [];
  for (const b of raw) {
    if (b.type === "list") {
      const items = (b.items ?? []).map((x) => x.trim()).filter(Boolean);
      if (items.length) {
        const norm = normalizeList(items, b.ordered ?? undefined);
        body.push({ type: "list", items: norm.items, ...(norm.ordered ? { ordered: true } : {}) });
      }
    } else if (b.type === "quote") {
      const text = (b.text ?? "").trim();
      if (text) body.push({ type: "quote", text, ...(b.cite ? { cite: b.cite.trim() } : {}) });
    } else {
      const text = (b.text ?? "").trim();
      if (text) body.push({ type: b.type, text });
    }
  }
  return body;
}

/**
 * Draft a full Russian article from an author's own materials, written in THEIR
 * first-person voice (not an AI persona). Obeys the editorial AI Requirements
 * and the strict "no invented facts" rule — only what's grounded in the
 * supplied materials or is general domain knowledge.
 */
export async function generateUserArticle(input: UserArticleInput): Promise<GeneratedUserArticle> {
  const { authorName, materials, topic, category, elite } = input;
  const preamble = await buildRequirementsPreamble("articles");

  const system = [
    `Ты помогаешь автору «${authorName}» превратить его черновые материалы в готовую статью для медиа Rusability.`,
    "Пиши от первого лица, в живом экспертном тоне автора — как будто это написал он сам, а не нейросеть.",
    "",
    preamble,
    "",
    "КРИТИЧЕСКОЕ ПРАВИЛО: опирайся ТОЛЬКО на факты из предоставленных материалов и общеизвестные профессиональные знания. НИКОГДА не выдумывай статистику, цитаты, названия компаний, имена или события, которых нет в материалах. Если данных не хватает — раскрывай тему через рассуждение и принципы, а не через придуманные факты.",
    "Структура AEO/SEO/GEO: прямой ответ в начале, содержательные подзаголовки, конкретика, список выводов в конце.",
    "Не используй markdown (**, ##, - ) внутри текстовых блоков — только чистый текст.",
    "Заголовки, подзаголовки (h2/h3) и термины — ТОЛЬКО на русском, без английского перевода в скобках (не «Воронка (Funnel)», а «Воронка»). Английское слово оставляй лишь для устоявшихся терминов без русского аналога или названий брендов/продуктов.",
    "Для списков не добавляй номера/маркеры в текст пунктов; для шагов ставь ordered:true.",
    elite
      ? "Это Elite-автор — сделай материал глубоким и структурированным."
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { output } = await generateText({
    model: CONTENT_MODEL,
    output: Output.object({ schema }),
    system,
    prompt: `${topic ? `Тема/угол статьи: «${topic}».\n` : ""}Категория: ${category}.

МАТЕРИАЛЫ АВТОРА (заметки, тезисы, источники — преврати их в связную статью, ничего не выдумывая сверх них):
"""
${materials.slice(0, 8000)}
"""

Напиши цельную статью на 700–1100 слов на основе этих материалов.`,
  });

  const body = toBlocks(output.body);
  const humanizer = await getHumanizerConfig();
  const finalBody = await humanizeBlocks(body, humanizer);
  const words = countWords(finalBody);
  const clamp = (n: number) => Math.min(98, Math.max(60, Math.round(n)));

  return {
    title: output.title.trim(),
    subtitle: output.subtitle.trim(),
    excerpt: output.excerpt.trim(),
    body: finalBody,
    tags: output.tags.map((t) => t.toLowerCase().trim()).filter(Boolean).slice(0, 6),
    readingMinutes: Math.max(1, Math.round(words / 180)),
    geoScore: clamp(output.geoScore),
    seoScore: clamp(output.seoScore),
    aeoScore: clamp(output.aeoScore),
  };
}
