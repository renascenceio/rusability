import { AuthorShell } from "@/components/author/AuthorShell";
import { requireRole, AUTHOR_ROLES } from "@/lib/auth-helpers";

export default async function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(AUTHOR_ROLES, "/author");
  const username = user.email.split("@")[0];

  return (
    <AuthorShell user={{ name: user.name || username, username }}>
      {children}
    </AuthorShell>
  );
}
