import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

/* ---------------- Button ---------------- */

type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "soft";
type ButtonSize = "sm" | "md" | "lg";

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 shadow-sm",
  accent: "bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-105 shadow-sm",
  outline: "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-2)]",
  ghost: "text-[var(--foreground)] hover:bg-[var(--surface-2)]",
  soft: "bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--surface-3)]",
};

const BTN_SIZE: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={cn(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={cn(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], className)} {...props} />;
}

/* ---------------- Badge / Chip ---------------- */

type BadgeTone = "primary" | "accent" | "success" | "gold" | "neutral" | "danger";

const BADGE_TONE: Record<BadgeTone, string> = {
  primary: "bg-[var(--primary)]/12 text-[var(--primary)]",
  accent: "bg-[var(--accent)]/14 text-[var(--accent)]",
  success: "bg-[var(--success)]/14 text-[var(--success)]",
  gold: "bg-[var(--gold)]/16 text-[var(--gold-ink)]",
  neutral: "bg-[var(--surface-3)] text-[var(--muted-foreground)]",
  danger: "bg-[var(--danger)]/12 text-[var(--danger)]",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        BADGE_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Chip({
  active,
  className,
  children,
  ...props
}: ComponentProps<"span"> & { active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-transparent bg-[var(--foreground)] text-[var(--background)]"
          : "border-[var(--border)] text-[var(--foreground)]",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-[var(--border)]", className)} />;
}

/* ---------------- Card ---------------- */

export function Card({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ---------------- Section heading ---------------- */

export function SectionHeading({
  title,
  action,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-6", className)}>
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--foreground)] text-balance">
        {title}
      </h2>
      {action}
    </div>
  );
}

/* ---------------- Avatar ---------------- */

export function Avatar({
  src,
  alt,
  size = 40,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || "/placeholder.svg"}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover bg-[var(--surface-3)]", className)}
      style={{ width: size, height: size }}
    />
  );
}

/* ---------------- Input ---------------- */

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

/* ---------------- Stat delta ---------------- */

export function Delta({ value, className }: { value: number; className?: string }) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold",
        positive ? "text-[var(--success)]" : "text-[var(--danger)]",
        className,
      )}
    >
      {positive ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

/* ---------------- Number formatting ---------------- */

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}
