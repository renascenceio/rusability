import { PageHeader } from "@/components/admin/ui";
import { CONNECTIONS } from "@/lib/mock";
import { ConnectionsWorkspace } from "./ConnectionsWorkspace";

export const metadata = { title: "Подключения — Rusability" };

export default function AdminConnectionsPage() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Подключения"
        subtitle="Соцсети, мессенджеры и внешние сервисы для автопостинга"
      />
      <ConnectionsWorkspace initial={CONNECTIONS} />
    </div>
  );
}
