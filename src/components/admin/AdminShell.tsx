"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutGrid,
  FileText,
  Newspaper,
  Mail,
  BarChart3,
  Bot,
  Sparkles,
  ShieldCheck,
  Megaphone,
  Plug,
  Users,
  Wallet,
  Menu,
  X,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      { href: "/admin/ai-filter", label: "ИИ-фильтр РКН", icon: ShieldCheck },
      { href: "/admin/newsbot", label: "Newsbot", icon: Sparkles },
      { href: "/admin/ads", label: "Реклама", icon: Megaphone },
      { href: "/admin/connections", label: "Подключения", icon: Plug },
    ],
  },
  {
    title: "Аудитория",
    items: [
      { href: "/admin/users", label: "Пользователи", icon: Users },
      { href: "/admin/monetization", label: "Монетизация", icon: Wallet },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-root flex min-h-dvh">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#141019] px-4 lg:hidden">
        <span className="text-sm font-extrabold uppercase tracking-wide text-white">
          Rus<span className="text-[#4d5aff]">a</span>bility
        </span>
        <button onClick={() => setOpen(true)} aria-label="Меню" className="text-white">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#141019] text-[#c9c3d6] transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <div>
            <div className="text-base font-extrabold uppercase tracking-wide text-white">
              Rus<span className="text-[#4d5aff]">a</span>bility
            </div>
            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4d5aff]">
              Суперадмин
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/60 lg:hidden" aria-label="Закрыть">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/40">
            <Search className="h-3.5 w-3.5" />
            <span>Поиск…</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {NAV.map((group) => (
            <div key={group.title} className="mb-5">
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-[#4d5aff] text-white"
                          : "text-[#c9c3d6] hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#5b67ff] to-[#3d49e6] text-sm font-bold text-white">
              А
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">Админ Rusability</div>
              <div className="truncate text-xs text-white/40">admin@rusability.ru</div>
            </div>
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
      <div className="flex min-w-0 flex-1 flex-col pt-14 lg:pl-[260px] lg:pt-0">
        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
