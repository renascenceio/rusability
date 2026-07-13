import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CONTENT_MODEL } from "./model";
import { blockReason } from "./content-filter";

export type ModerationVerdict =
  | { allowed: true }
  | { allowed: false; reason: string };

const schema = z.object({
  allowed: z
    .boolean()
    .describe("true, если комментарий допустим к публикации; false — если нарушает правила."),
  reason: z
    .string()
    .describe(
      "Если allowed=false — короткое вежливое объяснение на русском, ЧТО именно не так (1–2 предложения). Если allowed=true — пустая строка.",
    ),
});

const SYSTEM = `Ты — модератор комментариев русскоязычного медиа Rusability о бизнесе, маркетинге и технологиях. Комментарии оставляют без регистрации, поэтому проверяй их строго, но справедливо.

ОТКЛОНЯЙ комментарий (allowed=false), если он содержит:
- оскорбления, травлю, угрозы, разжигание ненависти по любому признаку;
- мат и нецензурную брань;
- спам, рекламу, ссылки на сторонние сайты, попытки продать товар/услугу;
- мошенничество, призывы к противоправным действиям, экстремизм, терроризм;
- дезинформацию, выдаваемую за факт, клевету в адрес людей или компаний;
- контент 18+, наркотики, азартные игры;
- бессмысленный набор символов или явно сгенерированный ботом текст.

РАЗРЕШАЙ (allowed=true) обычные мнения, критику по существу (даже резкую, но без оскорблений), вопросы и полезные дополнения.

Если отклоняешь — в reason кратко и вежливо объясни причину на русском, обращаясь к автору на «вы».`;

/**
 * Two-layer moderation: a fast keyword pre-filter (banned themes) followed by
 * an LLM judgment. Fails OPEN on model error (a moderation outage shouldn't
 * block legitimate readers) — the keyword filter still applies.
 */
export async function moderateComment(text: string): Promise<ModerationVerdict> {
  const clean = text.trim();
  if (!clean) return { allowed: false, reason: "Комментарий не может быть пустым." };

  // Layer 1 — deterministic banned-theme keyword filter.
  const kw = blockReason(clean);
  if (kw) {
    return {
      allowed: false,
      reason: `Комментарий отклонён: недопустимая тема (${kw}). Пожалуйста, переформулируйте без нарушения правил.`,
    };
  }

  // Layer 2 — LLM moderator.
  try {
    const { output } = await generateText({
      model: CONTENT_MODEL,
      output: Output.object({ schema }),
      system: SYSTEM,
      prompt: `Проверь комментарий:\n"""${clean.slice(0, 2000)}"""`,
    });
    if (output && output.allowed === false) {
      return {
        allowed: false,
        reason:
          output.reason?.trim() ||
          "Комментарий отклонён модерацией. Пожалуйста, соблюдайте правила сообщества.",
      };
    }
    return { allowed: true };
  } catch {
    // Model unavailable — allow (keyword layer already passed).
    return { allowed: true };
  }
}
