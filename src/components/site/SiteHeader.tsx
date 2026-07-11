"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ButtonLink } from "@/components/ui/kit";

const NAV = [
  { href: "/articles", label: "Статьи" },
  { href: "/news", label: "Новости" },
  { href: "/events", label: "События" },
  { href: "/apps", label: "Сервисы" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Rusability">
          <span className="font-serif text-xl font-extrabold tracking-tight text-[var(--foreground)]">
            Rusability
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--surface-2)] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
            aria-label="Поиск"
          >
            <Search className="h-5 w-5" />
          </Link>
          <ThemeToggle />
          <ButtonLink href="/author" variant="primary" size="sm" className="hidden sm:inline-flex">
            <Sparkles className="h-4 w-4" />
            Стать автором
          </ButtonLink>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--foreground)] md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Меню"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-2)]"
            >
              {item.label}
            </Link>
          ))}
          <ButtonLink href="/author" variant="primary" size="sm" className="mt-2 w-full">
            Стать автором
          </ButtonLink>
        </nav>
      )}
    </header>
  );
}
