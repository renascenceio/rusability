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

/**
 * Normalize a title/topic for near-duplicate comparison: lowercase, strip
 * punctuation, drop very short stopword-ish tokens, sort the remaining tokens.
 */
function topicTokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 4),
  );
}

/** Jaccard-style overlap between two topic strings (0..1). */
function topicSimilarity(a: string, b: string): number {
  const ta = topicTokens(a);
  const tb = topicTokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  return shared / Math.min(ta.size, tb.size);
}

/** True when `candidate` is essentially a topic the author already covered. */
export function isDuplicateTopic(candidate: string, previous: string[], threshold = 0.6): boolean {
  return previous.some((p) => topicSimilarity(candidate, p) >= threshold);
}

/**
 * Propose a fresh, specific topic within an author's beats.
 *
 * `avoidTitles` is the author's memory — titles/topics they have already
 * published (or queued). The model is told to steer clear of them, and we
 * re-roll once if it still returns a near-duplicate, so the same author never
 * republishes the same subject.
 */
export async function generateTopic(input: {
  author: AiAuthorRow;
  category: string;
  keywords: string[];
  avoidTitles?: string[];
}): Promise<{ topic: string; keywords: string[] }> {
  const { author, category, keywords } = input;
  const avoidTitles = (input.avoidTitles ?? []).slice(0, 60);
  const beats = author.topics.length ? author.topics.join(", ") : category;
  const year = new Date().getFullYear();

  const avoidBlock = avoidTitles.length
    ? `\n\nАвтор УЖЕ писал на следующие темы — НЕ повторяй их и не предлагай близкие по смыслу вариации (нужна принципиально новая тема, новый угол):\n${avoidTitles
        .map((t) => `— ${t}`)
        .join("\n")}`
    : "";

  const askModel = async (extra: string) => {
    const { output } = await generateText({
      model: CONTENT_MODEL,
      output: Output.object({ schema: topicSchema }),
      system: `Ты — контент-стратег русскоязычного медиа Rusability. Придумываешь темы, которые реально ищут в поиске и задают ИИ-ассистентам. Сейчас ${year} год: НИКОГДА не указывай прошедшие годы в теме. Год добавляй в формулировку только если он реально важен для темы, и тогда используй ${year} (не ${year - 1} и не более ранние).`,
      prompt: `Автор «${author.name}» (${author.archetype}) пишет о: ${beats}.
${keywords.length ? `Ориентируйся на запросы: ${keywords.join(", ")}.` : ""}
Предложи ОДНУ свежую, конкретную и практическую тему для экспертной статьи в категории «${category}». Избегай общих формулировок — тема должна отвечать на конкретный вопрос аудитории. Тема должна быть актуальной для ${year} года; не упоминай прошедшие годы (${year - 1} и ранее).${avoidBlock}${extra}`,
    });
    return {
      topic: output.topic.trim(),
      keywords: output.keywords.map((k) => k.toLowerCase().trim()).filter(Boolean).slice(0, 5),
    };
  };

  let result = await askModel("");
  // Re-roll once if the model still echoed an already-covered topic.
  if (isDuplicateTopic(result.topic, avoidTitles)) {
    result = await askModel(
      `\n\nВАЖНО: предыдущее предложение слишком похоже на уже опубликованное. Предложи СОВЕРШЕННО ДРУГУЮ тему, не пересекающуюся с перечисленными выше.`,
    );
  }
  return result;
}
