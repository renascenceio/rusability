import { sql } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/data/settings";
import { RecommendationsWorkspace, type RecommendationMetrics } from "./RecommendationsWorkspace";
import type { RecConfig } from "./actions";

export const metadata = { title: "Рекомендации — Админка" };
export const dynamic = "force-dynamic";

const DEFAULT_CONFIG: RecConfig = {
  active: true,
  weights: { history: 85, categories: 70, popularity: 40, collab: 55 },
};

async function getRecommendationMetrics(): Promise<RecommendationMetrics> {
  const [totalsResult, topResult] = await Promise.all([
    db.execute<{ impressions: number; clicks: number; clicking_sessions: number }>(sql`
      SELECT
        count(*) FILTER (WHERE event_type = 'impression')::int AS impressions,
        count(*) FILTER (WHERE event_type = 'click')::int AS clicks,
        count(DISTINCT session_id) FILTER (WHERE event_type = 'click')::int AS clicking_sessions
      FROM recommendation_events
      WHERE created_at >= now() - interval '30 days'
    `),
    db.execute<{ title: string; impressions: number; clicks: number }>(sql`
      WITH content AS (
        SELECT 'article'::text AS kind, id, title FROM articles
        UNION ALL
        SELECT 'news'::text AS kind, id, title FROM news
      )
      SELECT
        content.title,
        count(*) FILTER (WHERE events.event_type = 'impression')::int AS impressions,
        count(*) FILTER (WHERE events.event_type = 'click')::int AS clicks
      FROM recommendation_events events
      JOIN content ON content.kind = events.target_kind AND content.id = events.target_content_id
      WHERE events.created_at >= now() - interval '30 days'
      GROUP BY content.kind, content.id, content.title
      ORDER BY impressions DESC, clicks DESC
      LIMIT 5
    `),
  ]);

  const totals = totalsResult.rows[0] ?? { impressions: 0, clicks: 0, clicking_sessions: 0 };
  return {
    impressions: totals.impressions,
    clicks: totals.clicks,
    ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    clickingSessions: totals.clicking_sessions,
    top: topResult.rows,
  };
}

export default async function RecommendationsPage() {
  const [config, metrics] = await Promise.all([
    getSetting<RecConfig>("recommendations", DEFAULT_CONFIG),
    getRecommendationMetrics(),
  ]);
  return (
    <div>
      <PageHeader title="Рекомендации" subtitle="Алгоритм персонализации контента" />
      <RecommendationsWorkspace initialConfig={config} metrics={metrics} />
    </div>
  );
}
