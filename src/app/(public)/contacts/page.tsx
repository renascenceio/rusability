import { Mail, MessageSquare, Newspaper } from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata = {
  title: "Контакты — Rusability",
  description:
    "Свяжитесь с редакцией Rusability: вопросы, предложения о сотрудничестве, темы для материалов и обратная связь.",
};

const REASONS = [
  {
    icon: Newspaper,
    title: "Редакция",
    text: "Предложить тему, поделиться новостью или прислать экспертный комментарий.",
  },
  {
    icon: MessageSquare,
    title: "Сотрудничество",
    text: "Партнёрство, спецпроекты и совместные материалы.",
  },
  {
    icon: Mail,
    title: "Общие вопросы",
    text: "Обратная связь, работа сайта и любые другие обращения.",
  },
];

export default function ContactsPage() {
  return (
    <div className="container-editorial py-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
            Контакты
          </span>
          <h1 className="mt-2 text-balance font-serif text-4xl font-bold text-[var(--foreground)] md:text-5xl">
            Напишите нам
          </h1>
          <p className="mt-3 text-pretty text-lg leading-relaxed text-[var(--muted-foreground)]">
            Мы открыты к вопросам, идеям и предложениям. Заполните форму — обращение попадёт прямо в
            редакцию, и мы ответим на указанный адрес.
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          {/* Reasons */}
          <div className="flex flex-col gap-5">
            {REASONS.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                    <Icon className="h-5 w-5 text-[var(--primary)]" />
                  </span>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[var(--foreground)]">
                      {r.title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                      {r.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
