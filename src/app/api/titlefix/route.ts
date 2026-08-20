import "server-only";
import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";
import { CONTENT_MODEL, CONTENT_PROVIDER_OPTIONS } from "@/lib/ai/model";
import { recordTextUsage } from "@/lib/ai/usage";
import { tidyTitle } from "@/lib/ai/tidy-title";

/**
 * TEMP one-off: AI-rewrite article titles that carry a MID-TITLE year the
 * deterministic `tidyTitle` cannot safely remove ("… в 2026 году: стратегии",
 * "… что важнее в 2026 году? …"). The model removes the generic year while
 * keeping grammar intact, and keeps the year ONLY if it is genuinely the
 * subject. Gated by CRON_SECRET. Bounded per call so it never runs away.
 */
const schema = z.object({
  titles: z.array(z.object({ id: z.string(), title: z.string() })),
});

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 30);
  const sql = neon(process.env.DATABASE_URL!);

  // Candidates: a year appears together with "году" somewhere in the title
  // (the mid-title cases). Clean trailing suffixes were already stripped.
  const rows = (await sql`
    select id, title from articles
    where status = 'published' and title ~* 'в 20[0-9][0-9] году'
    order by published_at desc nulls last
    limit ${limit}
  `) as { id: string; title: string }[];

  if (rows.length === 0) {
    const rem = (await sql`select count(*)::int n from articles where status='published' and title ~* 'в 20[0-9][0-9] году'`) as { n: number }[];
    return NextResponse.json({ done: true, processed: 0, remaining: rem[0].n });
  }

  const { output, usage } = await generateText({
    model: CONTENT_MODEL,
    providerOptions: CONTENT_PROVIDER_OPTIONS,
    output: Output.object({ schema }),
    system:
      "Ты — редактор заголовков русскоязычного медиа. Тебе дают заголовки статей, в которых год приписан формально («в 2026 году»). Убери упоминание года так, чтобы заголовок остался грамматически верным, естественным и вечнозелёным. НЕ меняй смысл, порядок слов и стиль — только аккуратно удали год и почини грамматику/пунктуацию в месте удаления. Год ОСТАВЬ только если он и есть суть темы (обзор трендов/прогноз/итоги на период) — тогда верни заголовок без изменений. Верни для КАЖДОГО входного id его новый title.",
    prompt:
      "Перепиши эти заголовки, убрав формальное упоминание года:\n" +
      rows.map((r) => `${r.id}: ${r.title}`).join("\n"),
  });
  await recordTextUsage({ workload: "title-fix", model: CONTENT_MODEL, usage, contentKind: "article" });

  const byId = new Map(output.titles.map((t) => [t.id, t.title]));
  let updated = 0;
  const changes: { id: string; from: string; to: string }[] = [];
  for (const r of rows) {
    let next = (byId.get(r.id) ?? "").trim();
    if (!next) continue;
    // Belt-and-suspenders: run the deterministic strip over the AI output too.
    next = tidyTitle(next);
    // Sanity: don't accept an empty/absurd result or one that still has "в NNNN году".
    if (next.length < 8 || /в 20\d{2} году/i.test(next) || next === r.title) continue;
    await sql`update articles set title = ${next} where id = ${r.id}`;
    updated++;
    if (changes.length < 30) changes.push({ id: r.id, from: r.title, to: next });
  }

  const rem = (await sql`select count(*)::int n from articles where status='published' and title ~* 'в 20[0-9][0-9] году'`) as { n: number }[];
  return NextResponse.json({ processed: rows.length, updated, remaining: rem[0].n, changes });
}
