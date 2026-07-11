import { APPS } from "@/lib/mock/apps";
import { AppsBrowser } from "@/components/site/AppsBrowser";

export const metadata = {
  title: "Инструменты — Rusability",
  description: "Каталог сервисов и инструментов для дизайна, маркетинга и продуктовой работы.",
};

export default function AppsPage() {
  return (
    <div className="container-editorial py-10 md:py-14">
      <header className="mb-10 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
          Каталог
        </span>
        <h1 className="mt-2 font-serif text-4xl font-bold text-[var(--foreground)] md:text-5xl">
          Инструменты
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Проверенные сервисы, которыми пользуются команды — от дизайна до аналитики.
        </p>
      </header>

      <AppsBrowser apps={APPS} />
    </div>
  );
}
