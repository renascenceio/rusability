import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CONTENT_MODEL } from "./model";
import { buildHumanizerDirective, mergeHumanizer, type HumanizerConfig } from "./humanizer-config";
import { getSetting } from "@/lib/data/settings";
import type { ArticleBlock } from "@/lib/types";

export const HUMANIZER_SETTING_KEY = "humanizer";

/** Live humanizer config from site settings, merged over defaults. */
export async function getHumanizerConfig(): Promise<HumanizerConfig> {
  const stored = await getSetting<Partial<HumanizerConfig>>(HUMANIZER_SETTING_KEY, {});
  return mergeHumanizer(stored);
}

/* ------------------------------------------------------------------ */
/* Optional second pass — rewrite an assembled draft to strip residual */
/* AI markers while preserving block structure exactly.                */
/* ------------------------------------------------------------------ */

/** Flatten the editable text of a block list into indexed segments. */
function extractSegments(blocks: ArticleBlock[]): { i: number; text: string }[] {
  const out: { i: number; text: string }[] = [];
  blocks.forEach((b, idx) => {
    if (b.type === "p" || b.type === "h2" || b.type === "h3" || b.type === "quote") {
      if (b.text.trim()) out.push({ i: idx, text: b.text });
    } else if (b.type === "list") {
      b.items.forEach((item, j) => {
        if (item.trim()) out.push({ i: idx * 1000 + j + 100000, text: item });
      });
    }
  });
  return out;
}

const rewriteSchema = z.object({
  segments: z
    .array(z.object({ i: z.number(), text: z.string() }))
    .describe("Те же сегменты с теми же индексами i, но переписанным текстом text."),
});

/**
 * Second humanize pass: rewrites paragraph / heading / quote / list text with
 * the humanizer directive applied, keeping block count, order and types intact.
 * Falls back to the original blocks on any error or size mismatch.
 */
export async function humanizeBlocks(
  blocks: ArticleBlock[],
  cfg: HumanizerConfig,
): Promise<ArticleBlock[]> {
  if (!cfg.enabled || !cfg.secondPass) return blocks;

  const segments = extractSegments(blocks);
  if (!segments.length) return blocks;

  const directive = buildHumanizerDirective(cfg);
  if (!directive) return blocks;

  try {
    const { output } = await generateText({
      model: CONTENT_MODEL,
      output: Output.object({ schema: rewriteSchema }),
      system: [
        directive,
        "",
        "ЗАДАЧА: тебе дан массив сегментов текста уже готовой статьи. Перепиши КАЖДЫЙ сегмент, убрав маркеры нейросети по правилам выше, но сохрани смысл, факты, цифры, имена и общий объём.",
        "СТРОГО: верни ровно те же сегменты с теми же индексами i. Не добавляй, не удаляй и не объединяй сегменты. Не трогай фактическое содержание — только формулировки. Не добавляй markdown.",
      ].join("\n"),
      prompt: JSON.stringify({ segments }),
    });

    const byIndex = new Map(output.segments.map((s) => [s.i, s.text]));
    // Require full coverage; otherwise keep the safe original.
    if (byIndex.size < segments.length) return blocks;

    return blocks.map((b, idx) => {
      if (b.type === "p" || b.type === "h2" || b.type === "h3") {
        const next = byIndex.get(idx);
        return next && next.trim() ? { ...b, text: next.trim() } : b;
      }
      if (b.type === "quote") {
        const next = byIndex.get(idx);
        return next && next.trim() ? { ...b, text: next.trim() } : b;
      }
      if (b.type === "list") {
        const items = b.items.map((item, j) => {
          const next = byIndex.get(idx * 1000 + j + 100000);
          return next && next.trim() ? next.trim() : item;
        });
        return { ...b, items };
      }
      return b;
    });
  } catch {
    return blocks;
  }
}
