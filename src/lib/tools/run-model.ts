import "server-only";
import { generateText } from "ai";

/**
 * Tool generation runs on Kimi K2 (best Russian copy) via the Vercel AI Gateway,
 * with an automatic fallback to Gemini 2.5 Flash (thinking off) if Kimi errors
 * or returns nothing. Both are called with plain-text output and parsed by the
 * caller, so we don't depend on any provider-specific structured-output support.
 */
export const TOOL_MODEL_PRIMARY = "moonshotai/kimi-k2";
export const TOOL_MODEL_FALLBACK = "google/gemini-2.5-flash";

export type ToolModelResult = { text: string; model: string };

export async function runToolModel(args: {
  system: string;
  prompt: string;
  maxOutputTokens?: number;
}): Promise<ToolModelResult> {
  const maxOutputTokens = args.maxOutputTokens ?? 1200;

  // 1) Primary — Kimi K2.
  try {
    const { text } = await generateText({
      model: TOOL_MODEL_PRIMARY,
      system: args.system,
      prompt: args.prompt,
      maxOutputTokens,
      temperature: 0.8,
    });
    if (text && text.trim()) return { text: text.trim(), model: TOOL_MODEL_PRIMARY };
  } catch (err) {
    console.log("[v0] tool primary model failed, falling back:", (err as Error).message);
  }

  // 2) Fallback — Gemini 2.5 Flash with thinking OFF (thinking tokens would
  //    otherwise eat the output budget and return an empty string).
  const { text } = await generateText({
    model: TOOL_MODEL_FALLBACK,
    system: args.system,
    prompt: args.prompt,
    maxOutputTokens: maxOutputTokens + 400,
    temperature: 0.8,
    providerOptions: { google: { thinkingConfig: { thinkingBudget: 0 } } },
  });
  return { text: (text ?? "").trim(), model: TOOL_MODEL_FALLBACK };
}

/**
 * Parse a plain-text model response into a clean list of variant lines:
 * strips bullets / numbering / surrounding quotes, drops blanks, de-dupes,
 * and caps to `count`.
 */
export function parseVariants(raw: string, count: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    let s = line.trim();
    if (!s) continue;
    // Strip leading list markers: "1.", "1)", "-", "•", "*", "—"
    s = s.replace(/^\s*(?:\d+[.)]\s*|[-•*—]\s+)/, "").trim();
    // Strip a single pair of wrapping quotes.
    s = s.replace(/^["'«“”](.*)["'»“”]$/u, "$1").trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= count) break;
  }
  return out;
}
