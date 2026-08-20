import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CONTENT_MODEL, CONTENT_PROVIDER_OPTIONS } from "./model";
import { recordTextUsage } from "./usage";
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
    const { output, usage } = await generateText({
      model: CONTENT_MODEL,
      providerOptions: CONTENT_PROVIDER_OPTIONS,
      output: Output.object({ schema: topicSchema }),
      system: `Ты — контент-стратег русскоязычного медиа Rusability. Придумываешь темы, которые реально ищут в поиске и задают ИИ-ассистентам. Сейчас ${year} год.
ПРАВИЛО ПРО ГОД В ЗАГОЛОВКЕ (строго):
— НЕ добавляй год как формальную приписку в конце («… в ${year} году», «… ${year}»). Это шаблонно и выдаёт машинную генерацию. Заголовок должен звучать вечнозелёно.
— Год уместен ТОЛЬКО когда сам год — суть темы: обзор трендов/прогнозов на период («CX-тренды ${year}», «Что изменится в …: прогноз на ${year}»), итоги или анонс конкретного события с датой. В этих случаях используй ${year} (никогда прошедшие ${year - 1} и ранее).
— Во всех остальных темах года в заголовке быть НЕ должно.`,
      prompt: `Автор «${author.name}» (${author.archetype}) пишет о: ${beats}.
${keywords.length ? `Ориентируйся на запросы: ${keywords.join(", ")}.` : ""}
Предложи ОДНУ свежую, конкретную и практическую тему для экспертной статьи в категории «${category}». Избегай общих формулировок — тема должна отвечать на конкретный вопрос аудитории. Содержание должно быть актуальным сегодня, но НЕ приписывай год к заголовку — год допустим в формулировке лишь тогда, когда он и есть предмет статьи (тренды/прогноз/итоги).${avoidBlock}${extra}`,
    });
    await recordTextUsage({ workload: "article-topic", model: CONTENT_MODEL, usage, contentKind: "article" });
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
