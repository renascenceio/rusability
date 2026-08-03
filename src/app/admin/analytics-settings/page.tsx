import { PageHeader } from "@/components/admin/ui";
import { getAnalyticsSettings } from "./actions";
import { AnalyticsSettingsWorkspace } from "./AnalyticsSettingsWorkspace";

export const metadata = { title: "Счётчики аналитики" };
export const dynamic = "force-dynamic";

export default async function AnalyticsSettingsPage() {
  const config = await getAnalyticsSettings();
  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Счётчики аналитики"
        subtitle="Включение и настройка Google Analytics и Яндекс.Метрики"
      />
      <AnalyticsSettingsWorkspace initial={config} />
    </div>
  );
}
