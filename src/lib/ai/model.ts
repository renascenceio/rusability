import "server-only";
import { db } from "@/lib/db";
import { aiRequirements } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { getSetting } from "@/lib/data/settings";
import {
  buildHumanizerDirective,
  mergeHumanizer,
  type HumanizerConfig,
} from "./humanizer-config";

/** Default generation model (Russian long-form, cron scale). Via AI Gateway. */
export const CONTENT_MODEL = "google/gemini-2.5-flash";

/**
 * Provider options applied to EVERY content generation call.
 *
 * gemini-2.5-flash is a *thinking* model: by default it emits internal
 * reasoning ("thinking") tokens that are billed as OUTPUT tokens ($2.50/M) but
 * never appear in the article. For cron-scale structured generation this was
 * pure waste — measured ~2,300 reasoning tokens on a single article call
 * (~+80% output cost, ~+70% latency) with no quality benefit for our schema-
 * constrained output. Setting `thinkingBudget: 0` disables it. Spread this into
 * every `generateText` that uses CONTENT_MODEL so the setting can't drift.
 */
export const CONTENT_PROVIDER_OPTIONS = {
  google: { thinkingConfig: { thinkingBudget: 0 } },
} as const;

/**
 * Build the governance preamble injected into every AI job.
 * Always includes `global`, plus the area-specific block ('articles' | 'news'),
 * then the editable humanizer-ru directive when enabled for this area.
 * Reads live from the DB/settings so editors control it all in /admin.
 */
export async function buildRequirementsPreamble(area: "articles" | "news"): Promise<string> {
  const rows = await db
    .select()
    .from(aiRequirements)
    .where(inArray(aiRequirements.key, ["global", area]));

  // Deterministic order: global first, then the area block.
  const order = ["global", area];
  const blocks = rows
    .filter((r) => r.content.trim())
    .sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
    .map((r) => `## ${r.title || r.key}\n${r.content.trim()}`);

  const sections: string[] = [];
  if (blocks.length > 0) {
    sections.push(`ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ РЕДАКЦИИ (соблюдай неукоснительно):\n\n${blocks.join("\n\n")}`);
  }

  // Humanizer directive (humanizer-ru) — pure builder, read from site settings.
  const cfg = mergeHumanizer(await getSetting<Partial<HumanizerConfig>>("humanizer", {}));
  if (cfg.enabled && cfg.applyTo[area]) {
    const directive = buildHumanizerDirective(cfg);
    if (directive) sections.push(directive);
  }

  return sections.join("\n\n");
}
