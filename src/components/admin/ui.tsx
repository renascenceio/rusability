import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/* Page header with title, subtitle, optional action slot */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[28px] font-bold leading-tight text-[var(--foreground)]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* KPI stat card */
export function KpiCard({
  label,
  value,
  delta,
  deltaUp,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm text-[var(--muted-foreground)]">{label}</span>
        {icon && <span className="text-[var(--muted-foreground)]">{icon}</span>}
      </div>
      <div className="mt-2 font-serif text-3xl font-bold text-[var(--foreground)]">{value}</div>
      {delta && (
        <div
          className={cn(
            "mt-1.5 text-xs font-semibold",
            deltaUp ? "text-[var(--success)]" : "text-[var(--danger)]",
          )}
        >
          {deltaUp ? "▲" : "▼"} {delta}
        </div>
      )}
    </div>
  );
}

/* Panel / card container with optional header */
export function Panel({
  title,
  action,
  className,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--surface)]",
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
          <h2 className="text-sm font-bold text-[var(--foreground)]">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/* Status / category badge */
export function Tag({
  tone = "neutral",
  className,
  children,
}: ComponentProps<"span"> & {
  tone?: "neutral" | "primary" | "success" | "warn" | "danger" | "gold";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-[var(--muted)] text-[var(--muted-foreground)]",
    primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
    success: "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]",
    warn: "bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-[var(--gold-ink)]",
    danger: "bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--danger)]",
    gold: "bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-[var(--gold-ink)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* Pill button */
export function AdminButton({
  variant = "primary",
  href,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "ghost" | "outline"; href?: string }) {
  const variants: Record<string, string> = {
    primary: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110",
    ghost: "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--surface-3)]",
    outline: "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]",
  };
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97]",
    variants[variant],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}

/* Simple table primitives */
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">{children}</table>
    </div>
  );
}
export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-[var(--border)] px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]",
        className,
      )}
    >
      {children}
    </th>
  );
}
export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-[var(--border)] px-3 py-3 text-[var(--foreground)]", className)}>
      {children}
    </td>
  );
}
