import {
  HeaderSkeleton,
  PanelSkeleton,
  Shimmer,
  TableSkeleton,
} from "@/components/admin/Skeletons";

export default function ArticleCronsLoading() {
  return (
    <div className="animate-slide-up">
      <HeaderSkeleton action />
      <PanelSkeleton className="mb-4">
        <Shimmer className="h-4 w-48" />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Shimmer key={i} className="h-16 rounded-[10px]" />
          ))}
        </div>
      </PanelSkeleton>
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}
