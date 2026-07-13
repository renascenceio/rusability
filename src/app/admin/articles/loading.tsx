import {
  HeaderSkeleton,
  KpiRowSkeleton,
  TableSkeleton,
  TabsSkeleton,
} from "@/components/admin/Skeletons";

export default function ArticlesLoading() {
  return (
    <div className="animate-slide-up">
      <HeaderSkeleton action />
      <KpiRowSkeleton count={4} />
      <div className="mt-6">
        <TabsSkeleton count={3} />
        <TableSkeleton rows={9} cols={5} />
      </div>
    </div>
  );
}
