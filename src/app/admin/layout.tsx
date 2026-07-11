import { AdminShell } from "@/components/admin/AdminShell";
import { requireRole, ADMIN_ROLES } from "@/lib/auth-helpers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(ADMIN_ROLES, "/admin");
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }}>
      {children}
    </AdminShell>
  );
}
