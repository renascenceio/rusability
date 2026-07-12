import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { connections } from "@/lib/db/schema";
import { ConnectionsWorkspace } from "./ConnectionsWorkspace";
import type { ConnectionRow } from "./actions";

export const metadata = { title: "Подключения — Rusability" };
export const dynamic = "force-dynamic";

function timeAgo(d: Date | null): string | null {
  if (!d) return null;
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  return `${Math.round(hrs / 24)} дн назад`;
}

export default async function AdminConnectionsPage() {
  const rows = await db.select().from(connections).orderBy(connections.id);
  const items: ConnectionRow[] = rows.map((c) => ({
    id: c.id,
    platform: c.platform,
    handle: c.handle,
    connected: c.connected,
    autopost: c.autopost,
    followers: c.followers,
    lastSync: timeAgo(c.lastSync ?? null),
  }));

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title="Подключения"
        subtitle="Соцсети, мессенджеры и внешние сервисы для автопостинга"
      />
      <ConnectionsWorkspace initial={items} />
    </div>
  );
}
