import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SiteCta } from "@/lib/data/ctas";

/**
 * Public marketing CTA rendered from admin-managed `site_ctas`. Replaces the
 * old hardcoded newsletter-signup form + События block. Three visual variants
 * so admins can pick a tone per placement.
 */
export function CtaBand({ cta }: { cta: SiteCta }) {
  if (cta.variant === "gradient") {
    return (
      <section
        className="overflow-hidden rounded-[26px] p-8 text-white md:p-12"
        style={{
          background: "linear-gradient(135deg, #060B1E 0%, #2E6BE6 60%, #6AA0F8 130%)",
        }}
      >
        <Inner cta={cta} tone="onDark" />
      </section>
    );
  }
  if (cta.variant === "dark") {
    return (
      <section className="overflow-hidden rounded-[26px] bg-[var(--ink)] p-8 text-white md:p-12">
        <Inner cta={cta} tone="onDark" />
      </section>
    );
  }
  return (
    <section className="overflow-hidden rounded-[26px] bg-[var(--primary-soft)] p-8 md:p-10">
      <Inner cta={cta} tone="soft" />
    </section>
  );
}

function Inner({ cta, tone }: { cta: SiteCta; tone: "onDark" | "soft" }) {
  const onDark = tone === "onDark";
  return (
    <div className="max-w-2xl">
      {cta.eyebrow && (
        <div
          className={
            onDark
              ? "text-[11px] font-bold uppercase tracking-[0.18em] text-white/60"
              : "text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]"
          }
        >
          {cta.eyebrow}
        </div>
      )}
      {cta.title && (
        <h2
          className={
            onDark
              ? "mt-3 font-serif text-3xl font-bold leading-tight text-balance md:text-4xl"
              : "mt-3 font-serif text-3xl font-bold leading-tight text-balance text-[var(--foreground)] md:text-4xl"
          }
        >
          {cta.title}
        </h2>
      )}
      {cta.body && (
        <p
          className={
            onDark
              ? "mt-4 max-w-xl text-sm leading-relaxed text-white/70"
              : "mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted-foreground)]"
          }
        >
          {cta.body}
        </p>
      )}
      {cta.buttonLabel && (
        <div className="mt-7">
          <Link
            href={cta.buttonHref || "#"}
            className={
              onDark
                ? "inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--ink)] transition-transform hover:scale-[1.03]"
                : "inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition-transform hover:scale-[1.03]"
            }
          >
            {cta.buttonLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
