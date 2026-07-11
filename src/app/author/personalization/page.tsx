import { Sparkles } from "lucide-react";

export const metadata = { title: "Персонализация — Rusability" };

const TONES = ["Экспертный", "Дружелюбный", "Провокационный", "Академический"];
const FORMATS = ["Лонгриды", "Гайды", "Мнения", "Разборы кейсов", "Новостные заметки"];

export default function AuthorPersonalizationPage() {
  return (
    <div>
      <header className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-black text-[var(--foreground)]">Персонализация</h1>
          <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
            Настройте, как ИИ-редактор помогает вашему письму
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-1 font-serif text-lg font-bold text-[var(--foreground)]">Тон голоса</h2>
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            ИИ будет предлагать правки в выбранном стиле
          </p>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t, i) => (
              <span
                key={t}
                className={
                  i === 0
                    ? "rounded-full border border-transparent bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
                    : "rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
                }
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-1 font-serif text-lg font-bold text-[var(--foreground)]">Любимые форматы</h2>
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            Приоритетные типы материалов для рекомендаций
          </p>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map((f, i) => (
              <span
                key={f}
                className={
                  i < 2
                    ? "rounded-full border border-transparent bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)]"
                    : "rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
                }
              >
                {f}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 lg:col-span-2">
          <h2 className="mb-4 font-serif text-lg font-bold text-[var(--foreground)]">Ассистент письма</h2>
          <div className="space-y-3">
            {[
              { title: "Авто-предложения по SEO", desc: "Подсказки по заголовкам и структуре во время письма", on: true },
              { title: "Проверка на соответствие РКН", desc: "Предупреждать о потенциально запрещённых темах", on: true },
              { title: "Улучшение читаемости", desc: "Предлагать упрощение сложных предложений", on: false },
            ].map((s) => (
              <div
                key={s.title}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{s.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{s.desc}</p>
                </div>
                <span
                  className={
                    "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 " +
                    (s.on ? "justify-end bg-[var(--primary)]" : "justify-start bg-[var(--surface-3)]")
                  }
                >
                  <span className="h-5 w-5 rounded-full bg-white shadow" />
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
