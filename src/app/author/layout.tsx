import type { ReactNode } from "react";
import { AuthorSidebar } from "@/components/author/AuthorSidebar";

export const metadata = {
  title: "Кабинет автора — Rusability",
};

export default function AuthorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-[var(--background)]">
      <AuthorSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
