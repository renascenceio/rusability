import { AuthorShell } from "@/components/author/AuthorShell";

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  return <AuthorShell>{children}</AuthorShell>;
}
