"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Wallet,
  Globe2,
  Bell,
  SlidersHorizontal,
  Settings,
  PenLine,
  ArrowLeft,
} from "lucide-react";
import { Avatar } from "@/components/ui/kit";
import { AUTHORS } from "@/lib/mock/authors";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/author", label: "Дашборд", icon: LayoutDashboard },
  { href: "/author/articles", label: "Мои статьи", icon: FileText },
  { href: "/author/readers", label: "Аудитория", icon: Users },
  { href: "/author/monetization", label: "Монетизация", icon: Wallet },
  { href: "/author/geo", label: "География", icon: Globe2 },
  { href: "/author/notifications", label: "Уведомления", icon: Bell },
  { href: "/author/personalization", label: "Персонализация", icon: SlidersHorizontal },
  { href: "/author/settings", label: "Настройки", icon: Settings },
];

export function AuthorSidebar() {
  const pathname = usePathname();
  const me = AUTHORS[0];

  return (
    <aside className="sticky top-0 flex h-dvh w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] max-lg:hidden">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="font-serif text-xl font-bold text-[var(--foreground)]">Rusability</span>
      </div>

      <Link
        href="/author/editor"
        className="mx-4 mb-4 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-all hover:brightness-110"
      >
        <PenLine className="h-4 w-4" /> Написать статью
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map((item) => {
          const active =
            item.href === "/author" ? pathname === "/author" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        <Link
          href={`/authors/${me.username}`}
          className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--surface-2)]"
        >
          <Avatar src={me.avatar} alt={me.name} size={38} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[var(--foreground)]">{me.name}</div>
            <div className="truncate text-xs text-[var(--muted-foreground)]">Elite-автор</div>
          </div>
        </Link>
        <Link
          href="/"
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" /> На сайт
        </Link>
      </div>
    </aside>
  );
}
