import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CONTENT_MODEL } from "./model";
import type { aiAuthors } from "@/lib/db/schema";

type AiAuthorRow = typeof aiAuthors.$inferSelect;

const topicSchema = z.object({
  topic: z.string().describe("Конкретная тема статьи на русском в форме вопроса или ясного тезиса"),
  keywords: z.array(z.string()).describe("3–5 поисковых ключевых запросов на русском"),
});

/** Propose a fresh, specific topic within an author's beats. */
export async function generateTopic(input: {
  author: AiAuthorRow;
  category: string;
  keywords: string[];
}): Promise<{ topic: string; keywords: string[] }> {
  const { author, category, keywords } = input;
  const beats = author.topics.length ? author.topics.join(", ") : category;
  const year = new Date().getFullYear();

  const { output } = await generateText({
    model: CONTENT_MODEL,
    output: Output.object({ schema: topicSchema }),
    system: `Ты — контент-стратег русскоязычного медиа Rusability. Придумываешь темы, которые реально ищут в поиске и задают ИИ-ассистентам. Сейчас ${year} год: НИКОГДА не указывай прошедшие годы в теме. Год добавляй в формулировку только если он реально важен для темы, и тогда используй ${year} (не ${year - 1} и не более ранние).`,
    prompt: `Автор «${author.name}» (${author.archetype}) пишет о: ${beats}.
${keywords.length ? `Ориентируйся на запросы: ${keywords.join(", ")}.` : ""}
Предложи ОДНУ свежую, конкретную и практическую тему для экспертной статьи в категории «${category}». Избегай общих формулировок — тема должна отвечать на конкретный вопрос аудитории. Тема должна быть актуальной для ${year} года; не упоминай прошедшие годы (${year - 1} и ранее).`,
  });

  return {
    topic: output.topic.trim(),
    keywords: output.keywords.map((k) => k.toLowerCase().trim()).filter(Boolean).slice(0, 5),
  };
}
