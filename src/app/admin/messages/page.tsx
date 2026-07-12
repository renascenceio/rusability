import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth-helpers";
import { MessagesWorkspace, type ContactMessage } from "@/components/admin/MessagesWorkspace";

export const metadata = { title: "Сообщения — Rusability Admin" };
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  await requireRole(["superadmin"], "/admin");

  const rows = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(300);

  const messages: ContactMessage[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    subject: r.subject,
    message: r.message,
    status: r.status as ContactMessage["status"],
    createdAt: r.createdAt.toISOString(),
  }));

  return <MessagesWorkspace messages={messages} />;
}
