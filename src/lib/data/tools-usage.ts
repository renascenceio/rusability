import "server-only";

import { neon } from "@neondatabase/serverless";
import { TOOLS } from "@/lib/tools/registry";

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);

export type ToolUsageRow = {
  slug: string;
  title: string;
  category: string;
  runs7d: number;
  runsTotal: number;
  errors7d: number;
  avgMs: number | null;
  lastRun: string | null;
};

export type ToolsUsage = {
  totals: {
    runs7d: number;
    runsTotal: number;
    errors7d: number;
    uniqueIps7d: number;
    avgMs: number | null;
  };
  perTool: ToolUsageRow[];
  daily: { day: string; runs: number }[];
  recentErrors: { slug: string; error: string; createdAt: string }[];
};

/** Aggregated usage for the admin dashboard. Registry is the source of truth for
 *  the tool list; DB rows contribute the live counts (a tool with 0 runs still shows). */
export async function getToolsUsage(): Promise<ToolsUsage> {
  const [totals, perSlug, daily, recentErrors] = await Promise.all([
    sql`
      select
        count(*) filter (where created_at >= now() - interval '7 days')::int as runs7d,
        count(*)::int as runs_total,
        count(*) filter (where status='error' and created_at >= now() - interval '7 days')::int as errors7d,
        count(distinct ip) filter (where created_at >= now() - interval '7 days')::int as unique_ips7d,
        avg(duration_ms) filter (where status='ok' and created_at >= now() - interval '7 days')::int as avg_ms
      from tool_runs
    `,
    sql`
      select slug,
        count(*) filter (where created_at >= now() - interval '7 days')::int as runs7d,
        count(*)::int as runs_total,
        count(*) filter (where status='error' and created_at >= now() - interval '7 days')::int as errors7d,
        avg(duration_ms) filter (where status='ok' and created_at >= now() - interval '7 days')::int as avg_ms,
        max(created_at)::text as last_run
      from tool_runs group by slug
    `,
    sql`
      select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day, count(*)::int as runs
      from tool_runs
      where created_at >= now() - interval '14 days'
      group by 1 order by 1
    `,
    sql`
      select slug, coalesce(error, '') as error, created_at::text as "createdAt"
      from tool_runs where status='error' order by id desc limit 8
    `,
  ]);

  const bySlug = new Map(perSlug.map((r) => [r.slug as string, r]));
  const perTool: ToolUsageRow[] = TOOLS.map((t) => {
    const r = bySlug.get(t.slug);
    return {
      slug: t.slug,
      title: t.title,
      category: t.category,
      runs7d: r?.runs7d ?? 0,
      runsTotal: r?.runs_total ?? 0,
      errors7d: r?.errors7d ?? 0,
      avgMs: r?.avg_ms ?? null,
      lastRun: r?.last_run ?? null,
    };
  }).sort((a, b) => b.runs7d - a.runs7d || b.runsTotal - a.runsTotal);

  const t = totals[0] ?? {};
  return {
    totals: {
      runs7d: t.runs7d ?? 0,
      runsTotal: t.runs_total ?? 0,
      errors7d: t.errors7d ?? 0,
      uniqueIps7d: t.unique_ips7d ?? 0,
      avgMs: t.avg_ms ?? null,
    },
    perTool,
    daily: daily.map((d) => ({ day: d.day as string, runs: d.runs as number })),
    recentErrors: recentErrors.map((e) => ({
      slug: e.slug as string,
      error: e.error as string,
      createdAt: e.createdAt as string,
    })),
  };
}
