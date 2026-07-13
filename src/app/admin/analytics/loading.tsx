import {
  ChartSkeleton,
  DonutSkeleton,
  HeaderSkeleton,
  KpiRowSkeleton,
  TableSkeleton,
} from "@/components/admin/Skeletons";

export default function AnalyticsLoading() {
  return (
    <div className="animate-slide-up">
      <HeaderSkeleton action />
      <KpiRowSkeleton />
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartSkeleton className="lg:col-span-2" />
        <DonutSkeleton />
      </div>
      <div className="mt-4">
        <TableSkeleton rows={6} cols={3} />
      </div>
    </div>
  );
}
