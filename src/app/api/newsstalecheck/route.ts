import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { news } from "@/lib/db/schema";
import { and, eq, sql as dsql } from "drizzle-orm";
import { rewriteNews } from "@/lib/ai/generate-news";
import type { NewsCategory } from "@/lib/types";

// TEMP verification route — classify the already-published items whose title
// contains a past year, using the NEW timeliness-aware rewriteNews. Read-only.
export async function GET() {
  const rows = await db
    .select()
    .from(news)
    .where(and(eq(news.pipeline, "published"), dsql`${news.title} ~ '20(1[0-9]|2[0-4])'`))
    .limit(30);

  const results: Array<Record<string, unknown>> = [];
  for (const row of rows) {
    try {
      const r = await rewriteNews({
        sourceTitle: row.originalTitle || row.title,
        sourceSummary: row.excerpt || "",
        sourceName: row.source,
        category: (row.category as NewsCategory) || "business",
      });
      results.push({
        id: row.id,
        currentTitle: row.title,
        timeliness: r.timeliness,
        format: r.format,
        publishable: r.publishable,
        newTitle: r.title,
      });
    } catch (e) {
      results.push({ id: row.id, error: e instanceof Error ? e.message : String(e) });
    }
  }
  const stale = results.filter((r) => r.timeliness === "stale").length;
  return NextResponse.json({ total: results.length, stale, results });
}
