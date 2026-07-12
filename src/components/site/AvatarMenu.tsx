"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  User,
  FileText,
  PenLine,
  BarChart3,
  Bell,
  Settings,
  Heart,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { glyphAvatar } from "@/lib/avatar";

type MenuItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const PRIMARY: MenuItem[] = [
  { href: "/author", label: "Личный кабинет", icon: User },
  { href: "/subscriptions", label: "Мои подписки", icon: Heart },
  { href: "/author/articles", label: "Мои статьи", icon: FileText },
  { href: "/author/drafts", label: "Черновики", icon: PenLine },
  { href: "/author/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/editor", label: "Написать статью", icon: PenLine },
];

const SECONDARY: MenuItem[] = [
  { href: "/author/notifications", label: "Уведомления", icon: Bell },
  { href: "/author/profile", label: "Настройки профиля", icon: Settings },
];

export function AvatarMenu({
  name = "Марина Стеблова",
  role = "Автор Rusability",
  avatar,
  elite = false,
}: {
  name?: string;
  role?: string;
  /** Real uploaded avatar; falls back to a deterministic DiceBear glyph. */
  avatar?: string;
  elite?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const avatarUrl = avatar && avatar.trim() ? avatar : glyphAvatar(name, { elite });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Меню профиля"
        className={cn(
          "h-10 w-10 shrink-0 overflow-hidden rounded-full outline-none ring-offset-2 ring-offset-[var(--surface)] transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
          elite ? "ring-1 ring-[var(--gold)]" : "border border-[var(--border)]",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.25)]"
        >
          {/* Identity */}
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={name}
              className={cn(
                "h-10 w-10 shrink-0 overflow-hidden rounded-full object-cover",
                elite ? "ring-1 ring-[var(--gold)]" : "border border-[var(--border)]",
              )}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">{name}</p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">{role}</p>
            </div>
          </div>

          <div className="py-1.5">
            {PRIMARY.map((item) => (
              <MenuLink key={item.href} item={item} onNavigate={() => setOpen(false)} />
            ))}
          </div>

          <div className="border-t border-[var(--border)] py-1.5">
            {SECONDARY.map((item) => (
              <MenuLink key={item.href} item={item} onNavigate={() => setOpen(false)} />
            ))}
          </div>

          <div className="border-t border-[var(--border)] py-1.5">
            <Link
              href="/sign-in"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--danger)] transition-colors hover:bg-[var(--danger)]/10"
            >
              <LogOut className="h-[18px] w-[18px]" />
              Выйти
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ item, onNavigate }: { item: MenuItem; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      role="menuitem"
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]",
      )}
    >
      <Icon className="h-[18px] w-[18px] text-[var(--muted-foreground)]" />
      {item.label}
    </Link>
  );
}
