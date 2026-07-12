import { KPIS, TRAFFIC_SERIES, TRAFFIC_SOURCES, TOP_PAGES } from "@/lib/mock";
import { AnalyticsWorkspace } from "./AnalyticsWorkspace";

export const metadata = { title: "Аналитика — Rusability" };

export default function AdminAnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <AnalyticsWorkspace
        kpis={KPIS}
        series={TRAFFIC_SERIES}
        sources={TRAFFIC_SOURCES}
        topPages={TOP_PAGES}
      />
    </div>
  );
}
