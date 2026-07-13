import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

/**
 * Accessible, clickable breadcrumb trail. The last crumb is the current page
 * (rendered as plain text). Also emits BreadcrumbList JSON-LD for SEO.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="transition-colors hover:text-[var(--foreground)] hover:underline"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  className={last ? "text-[var(--foreground)]" : undefined}
                  aria-current={last ? "page" : undefined}
                >
                  {c.label}
                </span>
              )}
              {!last && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
