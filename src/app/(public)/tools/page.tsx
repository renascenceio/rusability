import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ToolIcon } from "@/components/tools/tool-icon";
import { toolsByCategory, TOOLS, type ToolCategory } from "@/lib/tools/registry";

export const metadata = {
  title: "Бесплатные ИИ-инструменты для текста",
  description:
    "Бесплатные ИИ-инструменты Rusability: генератор заголовков, мета-описаний, рерайт текста и идеи для статей. Без регистрации.",
  alternates: { canonical: "/tools" },
};

/** Per-category color language. Blue = SEO, terracotta = текст, gold = идеи. */
const CAT_STYLE: Record<
  ToolCategory,
  { tint: string; border: string; fg: string; chip: string }
> = {
  seo: {
    tint: "color-mix(in srgb, var(--primary) 7%, var(--tool-surface))",
    border: "color-mix(in srgb, var(--primary) 30%, transparent)",
    fg: "var(--primary)",
    chip: "color-mix(in srgb, var(--primary) 14%, transparent)",
  },
  writing: {
    tint: "color-mix(in srgb, var(--accent) 8%, var(--tool-surface))",
    border: "color-mix(in srgb, var(--accent) 30%, transparent)",
    fg: "var(--accent)",
    chip: "color-mix(in srgb, var(--accent) 14%, transparent)",
  },
  ideas: {
    tint: "color-mix(in srgb, var(--gold) 14%, var(--tool-surface))",
    border: "color-mix(in srgb, var(--gold) 42%, transparent)",
    fg: "var(--gold-ink, var(--gold))",
    chip: "color-mix(in srgb, var(--gold) 22%, transparent)",
  },
};

export default function ToolsHubPage() {
  const groups = toolsByCategory();

  return (
    <div className="container-editorial py-10 md:py-14">
      <header className="mb-10 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
          Инструменты
        </span>
        <h1 className="mt-2 text-balance font-serif text-4xl font-bold text-[var(--foreground)] md:text-5xl">
          Бесплатные ИИ-инструменты для текста
        </h1>
        <p className="mt-3 text-pretty text-lg leading-relaxed text-[var(--muted-foreground)]">
          Набор помощников для маркетологов и авторов: заголовки, мета-описания,
          рерайт и идеи для статей. На русском языке, без регистрации.
        </p>
      </header>

      <div className="flex flex-col gap-12">
        {groups.map((group) => {
          const cs = CAT_STYLE[group.category];
          return (
            <section key={group.category}>
              <h2 className="mb-5 font-serif text-2xl font-bold text-[var(--foreground)]">
                {group.label}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.tools.map((tool) => (
                  <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group block">
                    <article
                      className="relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] p-6 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lift)]"
                      style={{ background: cs.tint }}
                    >
                      {/* Oversized watermark icon — subtle but visible */}
                      <ToolIcon
                        name={tool.icon}
                        className="pointer-events-none absolute -bottom-7 -right-5 h-40 w-40"
                        style={{ color: cs.fg, opacity: 0.1 }}
                      />

                      <span
                        className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ background: cs.chip, color: cs.fg }}
                      >
                        <ToolIcon name={tool.icon} className="h-6 w-6" />
                      </span>
                      <h3 className="relative z-10 mt-4 font-serif text-lg font-bold text-[var(--foreground)]">
                        {tool.title}
                      </h3>
                      <p className="relative z-10 mt-2 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                        {tool.description}
                      </p>
                      <span
                        className="relative z-10 mt-5 inline-flex items-center gap-1.5 text-sm font-semibold"
                        style={{ color: cs.fg }}
                      >
                        Открыть
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-12 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
        Всего инструментов: {TOOLS.length}. Мы постепенно добавляем новые — каждый
        со своей логикой и настройками под русский язык.
      </p>
    </div>
  );
}
