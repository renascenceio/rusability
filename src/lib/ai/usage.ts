import "server-only";
import type { LanguageModelUsage } from "ai";
import { db } from "@/lib/db";
import { aiUsageEvents } from "@/lib/db/schema";

/**
 * AI Gateway spend logging.
 *
 * There is no free source of truth for what a call cost, so we price each call
 * from a rate card at write time. Rates are USD per 1M tokens (text) or USD per
 * image, taken from the live Vercel AI Gateway model list. Keep these in sync
 * with the gateway; a model missing here is logged with `priced=false` so a
 * missing rate is visible rather than silently counted as $0.
 */

/** USD per 1,000,000 tokens. Reasoning tokens bill at the OUTPUT rate. */
const TEXT_RATES: Record<string, { input: number; output: number }> = {
  "google/gemini-2.5-flash": { input: 0.3, output: 2.5 },
  "google/gemini-2.5-flash-lite": { input: 0.1, output: 0.4 },
  "google/gemini-2.5-pro": { input: 1.25, output: 10 },
};

/** USD per generated image. */
const IMAGE_RATES: Record<string, number> = {
  // Active cover model (flat rate).
  "xai/grok-imagine-image": 0.02,
  // Historical — kept so old ledger rows stay priced. These Imagen ids stopped
  // working in Aug 2026 (no Vertex access for this project) and are no longer called.
  "google/imagen-4.0-fast-generate-001": 0.02,
  "google/imagen-4.0-generate-001": 0.04,
  "google/imagen-4.0-ultra-generate-001": 0.06,
};

export type ContentKind = "article" | "news" | null;

/** Price a text call. Returns `{ cost, priced }`; unknown model ⇒ priced=false, cost 0. */
export function priceText(
  model: string,
  inputTokens: number,
  outputTokens: number,
): { cost: number; priced: boolean } {
  const rate = TEXT_RATES[model];
  if (!rate) return { cost: 0, priced: false };
  const cost = (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000;
  return { cost, priced: true };
}

/** Price an image call. Returns `{ cost, priced }`; unknown model ⇒ priced=false. */
export function priceImage(model: string, images: number): { cost: number; priced: boolean } {
  const rate = IMAGE_RATES[model];
  if (rate == null) return { cost: 0, priced: false };
  return { cost: rate * images, priced: true };
}

/**
 * Record one text-generation call. Fire-and-forget: never throws, never blocks
 * a generation (all callers should `void recordTextUsage(...)` without await, or
 * await inside a try/catch — this function already swallows its own errors).
 */
export async function recordTextUsage(params: {
  workload: string;
  model: string;
  usage: LanguageModelUsage | undefined;
  contentKind?: ContentKind;
}): Promise<void> {
  try {
    const input = params.usage?.inputTokens ?? 0;
    const output = params.usage?.outputTokens ?? 0;
    const reasoning = params.usage?.outputTokenDetails?.reasoningTokens ?? 0;
    const { cost, priced } = priceText(params.model, input, output);
    await db.insert(aiUsageEvents).values({
      workload: params.workload,
      model: params.model,
      inputTokens: input,
      outputTokens: output,
      reasoningTokens: reasoning,
      images: 0,
      costUsd: cost.toFixed(6),
      priced,
      contentKind: params.contentKind ?? null,
    });
  } catch (err) {
    console.log("[v0] recordTextUsage failed:", err instanceof Error ? err.message : String(err));
  }
}

/** Record one image-generation call. Fire-and-forget; never throws. */
export async function recordImageUsage(params: {
  workload: string;
  model: string;
  images: number;
  contentKind?: ContentKind;
}): Promise<void> {
  try {
    const { cost, priced } = priceImage(params.model, params.images);
    await db.insert(aiUsageEvents).values({
      workload: params.workload,
      model: params.model,
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      images: params.images,
      costUsd: cost.toFixed(6),
      priced,
      contentKind: params.contentKind ?? null,
    });
  } catch (err) {
    console.log("[v0] recordImageUsage failed:", err instanceof Error ? err.message : String(err));
  }
}
