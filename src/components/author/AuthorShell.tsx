"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutGrid,
  FileText,
  PenLine,
  BarChart3,
  DollarSign,
  Sparkles,
  User,
  Bell,
  ShieldCheck,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { authClient } from "@/lib/auth-client";

export type AuthorShellUser = { name: string; username: string };

type Item = { href: string; label: string; icon: typeof LayoutGrid; badge?: string; isNew?: boolean };

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: "Автор",
    items: [
      { href: "/author", label: "Дашборд", icon: LayoutGrid },
      { href: "/author/articles", label: "Мои статьи", icon: FileText, badge: "34" },
      { href: "/author/drafts", label: "Черновики", icon: PenLine, badge: "3" },
      { href: "/author/analytics", label: "Аналитика", icon: BarChart3 },
      { href: "/author/monetization", label: "Монетизация", icon: DollarSign },
      { href: "/author/personalization", label: "Персонализация", icon: Sparkles, isNew: true },
    ],
  },
  {
    title: "Настройки",
    items: [
      { href: "/author/profile", label: "Профиль", icon: User },
      { href: "/author/notifications", label: "Уведомления", icon: Bell },
      { href: "/author/security", label: "Безопасность", icon: ShieldCheck },
    ],
  },
];

export function AuthorShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthorShellUser;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function onSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh bg-[var(--background)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex">
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <span className="text-lg font-extrabold uppercase tracking-[0.02em] text-[var(--foreground)]">
            Rus<span className="text-[var(--primary)]">a</span>bility
          </span>
        </div>
        <Link
          href="/"
          className="mx-4 mb-3 flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> На сайт
        </Link>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                {g.title}
              </p>
              <ul className="space-y-0.5">
                {g.items.map((it) => {
                  const active = it.href === "/author" ? pathname === "/author" : pathname.startsWith(it.href);
                  const Icon = it.icon;
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                            : "text-[var(--muted-foreground)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
                        )}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="flex-1">{it.label}</span>
                        {it.badge && (
                          <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                            {it.badge}
                          </span>
                        )}
                        {it.isNew && (
                          <span className="rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--accent-foreground)]">
                            New
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">Тема</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-[var(--primary-foreground)]">
              {(user.name || user.username).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">@{user.username}</p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              disabled={signingOut}
              aria-label="Выйти"
              title="Выйти"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] disabled:opacity-50"
            >
              <LogOut className="h-[15px] w-[15px]" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:pl-[248px]">
        <main className="mx-auto max-w-[1120px] px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
