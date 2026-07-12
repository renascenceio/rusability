"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/articles", label: "Все статьи" },
  { href: "/admin/editor", label: "Редактор" },
  { href: "/admin/ai-authors", label: "✦ ИИ-авторы" },
  { href: "/admin/article-crons", label: "Автопубликация" },
  { href: "/admin/ai-filter", label: "⚠ РКН-фильтр" },
  { href: "/admin/ai-requirements", label: "Политика" },
];

/**
 * Shared tab bar for the article-management surface. Mirrors the admin
 * prototype: one row of tabs above every article-related admin page so the
 * existing standalone routes read as a single "Статьи" workspace.
 */
export function ArticleTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-[var(--primary)] text-[var(--foreground)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
