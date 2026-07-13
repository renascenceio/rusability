import {
  HeaderSkeleton,
  KpiRowSkeleton,
  TableSkeleton,
  TabsSkeleton,
} from "@/components/admin/Skeletons";

export default function NewsLoading() {
  return (
    <div className="animate-slide-up">
      <HeaderSkeleton action />
      <KpiRowSkeleton count={4} />
      <div className="mt-6">
        <TabsSkeleton count={4} />
        <TableSkeleton rows={10} cols={4} />
      </div>
    </div>
  );
}
