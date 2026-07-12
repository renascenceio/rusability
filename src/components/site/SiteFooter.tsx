import Link from "next/link";

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Разделы",
    links: [
      { href: "/articles", label: "Статьи" },
      { href: "/news", label: "Новости" },
      { href: "/authors", label: "Авторы" },
      { href: "/search", label: "Поиск" },
    ],
  },
  {
    title: "Проект",
    links: [
      { href: "/about", label: "О нас" },
      { href: "/author", label: "Авторам" },
      { href: "/contacts", label: "Контакты" },
    ],
  },
  {
    title: "Правовое",
    links: [
      { href: "/privacy", label: "Конфиденциальность" },
      { href: "/terms", label: "Условия" },
      { href: "/cookies", label: "Cookie" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <span className="font-serif text-xl font-extrabold text-[var(--foreground)]">
              Rusability
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--muted-foreground)]">
              Издание о дизайне, маркетинге, технологиях и продуктах. Пишем для тех, кто создаёт
              цифровые продукты.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] pt-6 text-xs text-[var(--muted-foreground)] sm:flex-row">
          <p>© 2026 Rusability. Все права защищены.</p>
          <p>Сделано с вниманием к деталям</p>
        </div>
      </div>
    </footer>
  );
}
