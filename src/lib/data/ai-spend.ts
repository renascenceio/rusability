import "server-only";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/** Reporting window in days. */
export type SpendRange = 1 | 7 | 30 | 90;
export const SPEND_RANGES: SpendRange[] = [1, 7, 30, 90];

export interface SpendRow {
  key: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  images: number;
  costUsd: number;
  unpriced: number;
}
export interface SpendDay {
  day: string; // YYYY-MM-DD
  costUsd: number;
  calls: number;
}
export interface AiSpend {
  range: SpendRange;
  totalCostUsd: number;
  totalCalls: number;
  totalReasoningTokens: number;
  reasoningCostUsd: number; // cost attributable to reasoning tokens (gemini output rate)
  unpricedCalls: number;
  byWorkload: SpendRow[];
  byModel: SpendRow[];
  perDay: SpendDay[];
  hasData: boolean;
  /** Projected 30-day cost from the current range's daily average. */
  projectedMonthlyUsd: number;
}

function n(v: unknown): number {
  const x = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(x) ? x : 0;
}

export async function getAiSpend(range: SpendRange = 7): Promise<AiSpend> {
  const days = range;

  const totalsQ = db.execute(sql`
    SELECT
      COALESCE(SUM(cost_usd), 0)::float8 AS cost,
      COUNT(*)::int AS calls,
      COALESCE(SUM(reasoning_tokens), 0)::bigint AS reasoning,
      COUNT(*) FILTER (WHERE priced = false)::int AS unpriced
    FROM ai_usage_events
    WHERE created_at >= now() - make_interval(days => ${days})
  `);

  const byWorkloadQ = db.execute(sql`
    SELECT workload AS key, COUNT(*)::int AS calls,
      COALESCE(SUM(input_tokens),0)::bigint AS input_tokens,
      COALESCE(SUM(output_tokens),0)::bigint AS output_tokens,
      COALESCE(SUM(reasoning_tokens),0)::bigint AS reasoning_tokens,
      COALESCE(SUM(images),0)::int AS images,
      COALESCE(SUM(cost_usd),0)::float8 AS cost,
      COUNT(*) FILTER (WHERE priced=false)::int AS unpriced
    FROM ai_usage_events
    WHERE created_at >= now() - make_interval(days => ${days})
    GROUP BY workload ORDER BY cost DESC
  `);

  const byModelQ = db.execute(sql`
    SELECT model AS key, COUNT(*)::int AS calls,
      COALESCE(SUM(input_tokens),0)::bigint AS input_tokens,
      COALESCE(SUM(output_tokens),0)::bigint AS output_tokens,
      COALESCE(SUM(reasoning_tokens),0)::bigint AS reasoning_tokens,
      COALESCE(SUM(images),0)::int AS images,
      COALESCE(SUM(cost_usd),0)::float8 AS cost,
      COUNT(*) FILTER (WHERE priced=false)::int AS unpriced
    FROM ai_usage_events
    WHERE created_at >= now() - make_interval(days => ${days})
    GROUP BY model ORDER BY cost DESC
  `);

  const perDayQ = db.execute(sql`
    SELECT to_char(created_at::date, 'YYYY-MM-DD') AS day,
      COALESCE(SUM(cost_usd),0)::float8 AS cost, COUNT(*)::int AS calls
    FROM ai_usage_events
    WHERE created_at >= now() - make_interval(days => ${days})
    GROUP BY 1 ORDER BY 1
  `);

  const [totalsR, byWorkloadR, byModelR, perDayR] = await Promise.all([
    totalsQ,
    byWorkloadQ,
    byModelQ,
    perDayQ,
  ]);

  const trow = (totalsR.rows ?? totalsR)[0] as Record<string, unknown>;
  const rows = (r: unknown): Record<string, unknown>[] =>
    ((r as { rows?: unknown[] }).rows ?? (r as unknown[])) as Record<string, unknown>[];

  const mapRow = (r: Record<string, unknown>): SpendRow => ({
    key: String(r.key),
    calls: n(r.calls),
    inputTokens: n(r.input_tokens),
    outputTokens: n(r.output_tokens),
    reasoningTokens: n(r.reasoning_tokens),
    images: n(r.images),
    costUsd: n(r.cost),
    unpriced: n(r.unpriced),
  });

  const totalCostUsd = n(trow?.cost);
  const totalReasoningTokens = n(trow?.reasoning);
  // Reasoning tokens are billed at gemini-2.5-flash output rate ($2.50/M).
  const reasoningCostUsd = (totalReasoningTokens * 2.5) / 1_000_000;
  const perDay: SpendDay[] = rows(perDayR).map((r) => ({
    day: String(r.day),
    costUsd: n(r.cost),
    calls: n(r.calls),
  }));

  return {
    range,
    totalCostUsd,
    totalCalls: n(trow?.calls),
    totalReasoningTokens,
    reasoningCostUsd,
    unpricedCalls: n(trow?.unpriced),
    byWorkload: rows(byWorkloadR).map(mapRow),
    byModel: rows(byModelR).map(mapRow),
    perDay,
    hasData: n(trow?.calls) > 0,
    projectedMonthlyUsd: days > 0 ? (totalCostUsd / days) * 30 : 0,
  };
}
