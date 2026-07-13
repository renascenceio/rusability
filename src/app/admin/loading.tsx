import { HeaderSkeleton, KpiRowSkeleton, PanelSkeleton, Shimmer } from "@/components/admin/Skeletons";

export default function AdminLoading() {
  return (
    <div className="animate-slide-up">
      <HeaderSkeleton action />
      <KpiRowSkeleton />
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <PanelSkeleton className="lg:col-span-2">
          <Shimmer className="h-4 w-40" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Shimmer key={i} className="h-12 rounded-[10px]" />
            ))}
          </div>
        </PanelSkeleton>
        <PanelSkeleton>
          <Shimmer className="h-4 w-32" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Shimmer key={i} className="h-14 rounded-[10px]" />
            ))}
          </div>
        </PanelSkeleton>
      </div>
    </div>
  );
}
