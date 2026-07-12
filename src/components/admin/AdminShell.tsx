"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  LayoutGrid,
  FileText,
  Newspaper,
  Mail,
  BarChart3,
  Bot,
  Sparkles,
  ShieldCheck,
  Plug,
  Users,
  Crown,
  Clock,
  ScrollText,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

export type ShellUser = { name: string; email: string; role: string };

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Суперадмин",
  admin: "Администратор",
  editor: "Редактор",
  author: "Автор",
  reader: "Читатель",
};

type NavItem = { href: string; label: string; icon: React.ElementType };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: "Контент",
    items: [
      { href: "/admin", label: "Обзор", icon: LayoutGrid },
      { href: "/admin/articles", label: "Статьи", icon: FileText },
      { href: "/admin/news", label: "Новости", icon: Newspaper },
      { href: "/admin/newsletter", label: "Рассылки", icon: Mail },
      { href: "/admin/analytics", label: "Аналитика", icon: BarChart3 },
    ],
  },
  {
    title: "ИИ-система",
    items: [
      { href: "/admin/ai-authors", label: "ИИ-авторы", icon: Bot },
      { href: "/admin/article-crons", label: "Генерация статей", icon: Clock },
      { href: "/admin/ai-requirements", label: "ИИ-требования", icon: ScrollText },
      { href: "/admin/ai-filter", label: "РКН-фильтр", icon: ShieldCheck },
      { href: "/admin/newsbot", label: "Newsbot", icon: Sparkles },
      { href: "/admin/connections", label: "Подключения", icon: Plug },
    ],
  },
  {
    title: "Аудитория",
    items: [
      { href: "/admin/users", label: "Пользователи", icon: Users },
      { href: "/admin/authors", label: "Авторы и Elite", icon: Crown },
    ],
  },
];

function Logo() {
  return (
    <>
      <img
        src="/brand/rusability-logo-black.png"
        alt="Rusability"
        className="block h-5 w-auto dark:hidden"
      />
      <img
        src="/brand/rusability-logo-white.png"
        alt="Rusability"
        className="hidden h-5 w-auto dark:block"
      />
    </>
  );
}

function ThemeControl() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center justify-between px-3.5 py-2.5">
      <span className="text-[11px] text-[var(--muted-foreground)]">
        {mounted ? (isDark ? "Тёмная" : "Светлая") : "Тема"}
      </span>
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Переключить тему"
        className="flex h-[26px] w-7 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
      >
        {mounted && isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: ShellUser;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function onSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-root flex min-h-dvh">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--sidebar)] px-4 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} aria-label="Меню" className="text-[var(--foreground)]">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col border-r border-[var(--border)] bg-[var(--sidebar)] transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo header */}
        <div className="flex items-start justify-between border-b border-[var(--border)] px-5 pb-4 pt-5">
          <div>
            <Logo />
            <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--faint)]">
              Суперадмин
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-[var(--muted-foreground)] lg:hidden"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2.5">
          {NAV.map((group) => (
            <div key={group.title} className="mb-1.5">
              <div className="px-3 pb-1.5 pt-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">
                {group.title}
              </div>
              {group.items.map((item) => {
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "my-px flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-[7px] text-[13px] transition-colors",
                      active
                        ? "border-[var(--primary)] bg-[var(--primary-soft)] font-semibold text-[var(--foreground)]"
                        : "border-transparent font-normal text-[var(--muted-foreground)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
                    )}
                  >
                    <Icon className="h-[15px] w-[15px] shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--border)]">
          <ThemeControl />
          <div className="flex items-center gap-2.5 border-t border-[var(--border)] px-3.5 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4d5aff] to-[#7a8aff] text-xs font-bold text-white">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-[var(--foreground)]">
                {ROLE_LABELS[user.role] ?? user.role}
              </div>
              <div className="truncate text-[11px] text-[var(--muted-foreground)]">
                {user.email}
              </div>
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

      {/* Scrim */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col pt-14 lg:pl-[240px] lg:pt-0">
        <main className="flex-1 px-5 py-6 md:px-9 md:py-8">{children}</main>
      </div>
    </div>
  );
}
