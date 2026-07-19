import { requireRole, ADMIN_ROLES } from "@/lib/auth-helpers";
import { listThreads } from "@/lib/mail/store";
import { isMailConfigured, MAIL_FROM } from "@/lib/mail/resend";
import { InboxWorkspace } from "@/components/admin/InboxWorkspace";

export const metadata = { title: "Почта — Rusability Admin" };
export const dynamic = "force-dynamic";

export default async function InboxPage() {
  await requireRole(ADMIN_ROLES, "/admin");
  const threads = await listThreads();
  return (
    <InboxWorkspace
      threads={threads}
      configured={isMailConfigured()}
      fromAddress={MAIL_FROM}
    />
  );
}
