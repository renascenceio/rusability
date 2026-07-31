import { getAnalytics } from "@/lib/data/analytics";
import { AnalyticsWorkspace } from "@/app/admin/analytics/AnalyticsWorkspace";

export const dynamic = "force-dynamic";

// TEMP verification harness (admin is role-gated). Delete after checking.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; granularity?: string }>;
}) {
  const sp = await searchParams;
  const data = await getAnalytics({
    range: sp.range as never,
    granularity: sp.granularity as never,
  });
  return (
    <div className="admin-root min-h-dvh bg-[var(--background)] p-6" data-admin-theme="rusability">
      <AnalyticsWorkspace data={data} />
    </div>
  );
}
