import "server-only";
import { db } from "@/lib/db";
import { aiRequirements } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

/** Default generation model (Russian long-form, cron scale). Via AI Gateway. */
export const CONTENT_MODEL = "google/gemini-2.5-flash";

/**
 * Build the governance preamble injected into every AI job.
 * Always includes `global`, plus the area-specific block ('articles' | 'news').
 * Reads live from the ai_requirements table so editors control it in /admin.
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

  if (blocks.length === 0) return "";
  return `ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ РЕДАКЦИИ (соблюдай неукоснительно):\n\n${blocks.join("\n\n")}`;
}
