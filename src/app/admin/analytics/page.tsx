import { adminAnalytics } from "@/lib/data/analytics";
import { AnalyticsWorkspace } from "./AnalyticsWorkspace";

export const metadata = { title: "Аналитика — Rusability" };

// Refresh the cached aggregates at most once per hour.
export const revalidate = 3600;

export default async function AdminAnalyticsPage() {
  const data = await adminAnalytics();

  return (
    <div className="mx-auto max-w-[1180px]">
      <AnalyticsWorkspace
        kpis={data.kpis}
        seriesByPeriod={data.seriesByPeriod}
        sources={data.sources}
        topPages={data.topPages}
        generatedAt={data.generatedAt}
      />
    </div>
  );
}
