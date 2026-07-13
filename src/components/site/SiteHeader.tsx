"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/", label: "Лента", exact: true },
  { href: "/articles", label: "Статьи" },
  { href: "/news", label: "Новости" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === "/" : pathname.startsWith(item.href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-[var(--background)]/85 backdrop-blur-xl transition-colors",
        scrolled || open ? "border-[var(--border)]" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Rusability">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/rusability-logo-black.png"
            alt="Rusability"
            className="h-[18px] w-auto dark:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/rusability-logo-white.png"
            alt="Rusability"
            className="hidden h-[18px] w-auto dark:block"
          />
        </Link>

        <nav className="ml-3 hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-black/[0.06] font-bold text-[var(--foreground)] dark:bg-white/[0.08]"
                    : "font-normal text-[var(--muted-foreground)] hover:bg-black/[0.04] hover:text-[var(--foreground)] dark:hover:bg-white/[0.05]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] sm:flex"
            aria-label="Поиск"
          >
            <kbd className="rounded bg-[var(--surface-3)] px-1.5 py-0.5 font-sans text-[11px] font-semibold">
              ⌘K
            </kbd>
            Поиск
          </Link>
          <Link
            href="/search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--surface-2)] sm:hidden"
            aria-label="Поиск"
          >
            <Search className="h-5 w-5" />
          </Link>
          <ThemeToggle />
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
        <nav className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-2)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
