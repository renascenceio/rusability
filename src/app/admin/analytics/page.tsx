import { getAnalytics, type RangeKey, type Granularity } from "@/lib/data/analytics";
import { AnalyticsWorkspace } from "./AnalyticsWorkspace";

export const metadata = { title: "Аналитика" };

// Server data is cached per filter signature inside getAnalytics (15 min).
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; granularity?: string }>;
}) {
  const sp = await searchParams;
  const data = await getAnalytics({
    range: sp.range as RangeKey,
    granularity: sp.granularity as Granularity,
  });

  return (
    <div className="mx-auto max-w-[1180px]">
      <AnalyticsWorkspace data={data} />
    </div>
  );
}
