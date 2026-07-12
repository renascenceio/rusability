import { PageHeader } from "@/components/admin/ui";
import { getSetting } from "@/lib/data/settings";
import { RecommendationsWorkspace } from "./RecommendationsWorkspace";
import type { RecConfig } from "./actions";

export const metadata = { title: "Рекомендации — Админка" };
export const dynamic = "force-dynamic";

const DEFAULT_CONFIG: RecConfig = {
  active: true,
  weights: { history: 85, categories: 70, popularity: 40, collab: 55 },
};

export default async function RecommendationsPage() {
  const config = await getSetting<RecConfig>("recommendations", DEFAULT_CONFIG);
  return (
    <div>
      <PageHeader title="Рекомендации" subtitle="Алгоритм персонализации контента" />
      <RecommendationsWorkspace initialConfig={config} />
    </div>
  );
}
