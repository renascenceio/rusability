import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/kit";
import { ToolIcon } from "@/components/tools/tool-icon";
import { toolsByCategory, TOOLS } from "@/lib/tools/registry";

export const metadata = {
  title: "Бесплатные ИИ-инструменты для текста",
  description:
    "Бесплатные ИИ-инструменты Rusability: генератор заголовков, мета-описаний, рерайт текста и идеи для статей. Без регистрации.",
  alternates: { canonical: "/tools" },
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
        {groups.map((group) => (
          <section key={group.category}>
            <h2 className="mb-5 font-serif text-2xl font-bold text-[var(--foreground)]">
              {group.label}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.tools.map((tool) => (
                <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group">
                  <Card className="flex h-full flex-col p-6 transition-transform group-hover:-translate-y-1">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                      <ToolIcon name={tool.icon} className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-serif text-lg font-bold text-[var(--foreground)]">
                      {tool.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                      {tool.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)]">
                      Открыть
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
        Всего инструментов: {TOOLS.length}. Мы постепенно добавляем новые — каждый
        со своей логикой и настройками под русский язык.
      </p>
    </div>
  );
}
