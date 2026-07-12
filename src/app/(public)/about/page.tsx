import { ButtonLink, Card } from "@/components/ui/kit";
import { Sparkles, ShieldCheck, Newspaper, Users } from "lucide-react";

export const metadata = {
  title: "О нас — Rusability",
  description:
    "Rusability — независимое издание о маркетинге, технологиях и бизнесе. Рассказываем о том, что меняет индустрию, простым и точным языком.",
};

const VALUES = [
  {
    icon: Newspaper,
    title: "Польза важнее хайпа",
    text: "Мы пишем не ради инфоповода, а ради практической ценности. Каждый материал должен что-то давать читателю.",
  },
  {
    icon: ShieldCheck,
    title: "Проверенные факты",
    text: "Материалы проходят редакционную и автоматическую проверку на соответствие законодательству РФ и требованиям Роскомнадзора.",
  },
  {
    icon: Sparkles,
    title: "Технологии на службе редакции",
    text: "Мы используем ИИ как инструмент: он помогает готовить черновики и подборки, но финальное слово всегда за человеком.",
  },
  {
    icon: Users,
    title: "Сообщество экспертов",
    text: "Elite-авторы и приглашённые специалисты делятся опытом, который не найти в пресс-релизах.",
  },
];

const STATS = [
  { value: "2014", label: "год основания" },
  { value: "10 000+", label: "опубликованных материалов" },
  { value: "5 разделов", label: "маркетинг, технологии, бизнес и не только" },
];

const TOPICS = [
  "Цифровой маркетинг",
  "SEO и аналитика",
  "Искусственный интеллект",
  "Технологии и продукты",
  "Бизнес и стратегия",
  "Медиа и коммуникации",
];

export default function AboutPage() {
  return (
    <div className="container-editorial py-10 md:py-16">
      {/* Hero */}
      <header className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
          О проекте
        </span>
        <h1 className="mt-3 text-balance font-serif text-4xl font-bold leading-tight text-[var(--foreground)] md:text-6xl">
          Издание о том, что меняет индустрию
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-[var(--muted-foreground)]">
          Rusability — независимое медиа о маркетинге, технологиях и бизнесе. Мы объясняем сложное
          простым языком и помогаем профессионалам принимать решения на основе фактов, а не шума.
        </p>
      </header>

      {/* Stats */}
      <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <Card key={s.label} className="p-6 text-center">
            <div className="font-serif text-3xl font-bold text-[var(--foreground)]">{s.value}</div>
            <div className="mt-1 text-sm text-[var(--muted-foreground)]">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Mission */}
      <section className="mx-auto mt-16 max-w-3xl border-l-2 border-[var(--primary)] pl-6">
        <h2 className="font-serif text-2xl font-bold text-[var(--foreground)] md:text-3xl">
          Наша миссия
        </h2>
        <p className="mt-3 text-pretty text-lg leading-relaxed text-[var(--muted-foreground)]">
          Сделать профессиональные знания о цифровой индустрии доступными каждому. Мы верим, что
          качественная аналитика и честная журналистика двигают рынок вперёд быстрее, чем реклама.
        </p>
      </section>

      {/* Values */}
      <section className="mx-auto mt-16 max-w-4xl">
        <h2 className="text-center font-serif text-2xl font-bold text-[var(--foreground)] md:text-3xl">
          Во что мы верим
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <Card key={v.title} className="flex flex-col gap-3 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                  <Icon className="h-5 w-5 text-[var(--primary)]" />
                </span>
                <h3 className="font-serif text-lg font-bold text-[var(--foreground)]">{v.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{v.text}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Topics */}
      <section className="mx-auto mt-16 max-w-3xl text-center">
        <h2 className="font-serif text-2xl font-bold text-[var(--foreground)] md:text-3xl">
          О чём мы пишем
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          {TOPICS.map((t) => (
            <span
              key={t}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-16 max-w-3xl">
        <Card className="flex flex-col items-center gap-5 bg-[var(--ink)] px-6 py-12 text-center">
          <h2 className="text-balance font-serif text-2xl font-bold text-[var(--on-ink)] md:text-3xl">
            Есть вопрос, идея или предложение?
          </h2>
          <p className="max-w-lg text-pretty leading-relaxed text-[var(--on-ink)]/80">
            Мы всегда открыты к сотрудничеству, обратной связи и новым темам. Напишите нам — мы
            обязательно ответим.
          </p>
          <ButtonLink href="/contacts">Связаться с редакцией</ButtonLink>
        </Card>
      </section>
    </div>
  );
}
