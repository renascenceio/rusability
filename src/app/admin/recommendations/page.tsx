import { PageHeader } from "@/components/admin/ui";
import { RecommendationsWorkspace } from "./RecommendationsWorkspace";

export const metadata = { title: "Рекомендации — Админка" };

export default function RecommendationsPage() {
  return (
    <div>
      <PageHeader title="Рекомендации" subtitle="Алгоритм персонализации контента" />
      <RecommendationsWorkspace />
    </div>
  );
}
