import { ARTICLES } from "@/lib/mock/articles";
import { NEWS } from "@/lib/mock/news";
import { APPS } from "@/lib/mock/apps";
import { UPCOMING_EVENTS } from "@/lib/mock/events";
import { categoryName } from "@/lib/mock/categories";
import { getAuthor } from "@/lib/mock/authors";
import { formatDate } from "@/lib/utils";

const CAT_GRADIENT: Record<string, string> = {
  design: "linear-gradient(135deg, #b5533a, #e8a88a)",
  marketing: "linear-gradient(135deg, #1b2f5e, #3a5ba8)",
  pr: "linear-gradient(135deg, #1f3d24, #3f7048)",
  analytics: "linear-gradient(135deg, #4a3410, #8a6a2e)",
  seo: "linear-gradient(135deg, #24452b, #4d8058)",
  ux: "linear-gradient(135deg, #5a4410, #c99a3e)",
  ai: "linear-gradient(135deg, #2a2150, #5a4d9e)",
  default: "linear-gradient(135deg, #2a2320, #6a5a4a)",
};

function grad(cat: string) {
  return CAT_GRADIENT[cat] ?? CAT_GRADIENT.default;
}

export function NewsletterDigest() {
  const hero = ARTICLES[0];
  const heroAuthor = getAuthor(hero.authorId);
  const secondary = ARTICLES.slice(1, 4);
  const news = NEWS.slice(0, 3);
  const app = APPS[0];
  const event = UPCOMING_EVENTS[0];

  return (
    <div className="mx-auto w-full max-w-[640px] overflow-hidden rounded-2xl bg-[#0f0d0b] shadow-2xl">
      {/* Mac window bar */}
      <div className="flex items-center gap-2 bg-[#161310] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="flex-1 text-center text-xs text-white/40">
          Rusability.ru · Дайджест дизайна — пятничный
        </span>
      </div>

      {/* From / to */}
      <div className="flex items-center justify-between bg-[#161310] px-6 py-3 text-xs">
        <div className="text-white/70">
          <span className="font-semibold text-white/90">От:</span> Rusability.ru
          &lt;digest@rusability.ru&gt;
          <br />
          <span className="font-semibold text-white/90">Кому:</span> anna.sokolova@mail.ru
        </div>
        <div className="text-right text-white/40">Пт, 4 июля 2026 · 09:00</div>
      </div>

      {/* Email body (light) */}
      <div className="bg-white">
        {/* Brand header */}
        <div className="bg-[#0d0b09] px-6 py-8 text-center">
          <div className="text-2xl font-extrabold uppercase tracking-wide text-white">
            Rus<span className="text-[#4d5aff]">a</span>bility
          </div>
          <p className="mt-1 text-xs text-white/50">
            Еженедельный дайджест дизайна · 4 июля 2026
          </p>
        </div>

        <div className="px-6 py-8">
          {/* Greeting */}
          <p className="text-lg font-semibold text-[#1a1410]">Привет, Анна</p>
          <p className="mt-1 text-sm leading-relaxed text-[#5a4a3e]">
            Лучшие материалы недели по теме <strong>Дизайн и UX</strong> — специально для вас.
          </p>

          <hr className="my-6 border-black/8" />

          {/* Hero article */}
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#4d5aff]">
            Главная статья недели
          </p>
          <div className="overflow-hidden rounded-xl border border-black/8">
            <div className="h-40 w-full" style={{ background: grad(hero.category) }} />
            <div className="p-5">
              <span
                className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-white"
                style={{ background: grad(hero.category) }}
              >
                {categoryName(hero.category)}
              </span>
              <h2 className="mt-3 font-serif text-xl font-bold leading-snug text-[#1a1410]">
                {hero.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5a4a3e]">{hero.excerpt}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-full bg-[#c4523b]" />
                  <div className="text-xs">
                    <div className="font-semibold text-[#1a1410]">{heroAuthor?.name}</div>
                    <div className="text-[#8a7060]">
                      {formatDate(hero.publishedAt)} · {hero.readingMinutes} мин
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-[#4d5aff] px-4 py-2 text-xs font-semibold text-white">
                  Читать →
                </span>
              </div>
            </div>
          </div>

          {/* Secondary */}
          <p className="mb-3 mt-8 text-[11px] font-bold uppercase tracking-wider text-[#8a7060]">
            Ещё из этой недели
          </p>
          <div className="space-y-4">
            {secondary.map((a) => {
              const au = getAuthor(a.authorId);
              return (
                <div key={a.id} className="flex items-start gap-4">
                  <div
                    className="h-14 w-16 shrink-0 rounded-lg"
                    style={{ background: grad(a.category) }}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-[10px] font-bold uppercase"
                      style={{ color: "#8a7060" }}
                    >
                      {categoryName(a.category)}
                    </div>
                    <div className="font-serif text-base font-bold leading-snug text-[#1a1410]">
                      {a.title}
                    </div>
                    <div className="mt-1 text-xs text-[#8a7060]">
                      {au?.name} · {a.readingMinutes} мин
                    </div>
                  </div>
                  <span className="shrink-0 self-center text-xs font-semibold text-[#4d5aff]">
                    Читать →
                  </span>
                </div>
              );
            })}
          </div>

          {/* News */}
          <p className="mb-3 mt-8 text-[11px] font-bold uppercase tracking-wider text-[#8a7060]">
            Новости недели
          </p>
          <ul className="space-y-2.5">
            {news.map((n) => (
              <li key={n.id} className="flex items-start gap-2.5 text-sm text-[#3a2f28]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4d5aff]" />
                {n.title}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm font-semibold text-[#4d5aff]">Все новости недели →</p>

          {/* App of the week */}
          <div className="mt-8 flex items-center gap-4 rounded-xl bg-[#eef0ff] p-5">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-[#5b67ff] to-[#3d49e6]" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#4d5aff]">
                Приложение недели
              </div>
              <div className="font-bold text-[#1a1410]">{app.name}</div>
              <div className="text-xs text-[#5a4a3e]">{app.tagline}</div>
            </div>
            <span className="shrink-0 rounded-full bg-[#4d5aff] px-4 py-2 text-xs font-semibold text-white">
              Попробовать
            </span>
          </div>

          {/* Event */}
          <div className="mt-4 flex items-center gap-4 rounded-xl border-l-4 border-[#4d5aff] bg-[#f7f5f2] p-4">
            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-[#4d5aff] text-white">
              <span className="text-sm font-bold leading-none">
                {new Date(event.date).getDate()}
              </span>
              <span className="text-[9px] uppercase">июл</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-[#1a1410]">{event.title}</div>
              <div className="text-xs text-[#8a7060]">
                {event.city} · {event.venue}
              </div>
            </div>
            <span className="shrink-0 text-xs font-semibold text-[#4d5aff]">Зарег. →</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-black/8 px-6 py-8 text-center">
          <div className="text-lg font-extrabold uppercase tracking-wide text-[#1a1410]">
            Rus<span className="text-[#4d5aff]">a</span>bility
          </div>
          <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-[#8a7060]">
            Вы получаете этот дайджест, потому что подписались на рассылку по теме «Дизайн» на
            Rusability.ru
          </p>
          <div className="mt-4 flex justify-center gap-4 text-xs font-medium text-[#4d5aff]">
            <span>Настройки рассылки</span>
            <span className="text-[#8a7060]">·</span>
            <span>Отписаться</span>
            <span className="text-[#8a7060]">·</span>
            <span>Посмотреть в браузере</span>
          </div>
          <p className="mt-4 text-[11px] text-[#b0a291]">
            © 2026 Rusability.ru · Москва, Россия
          </p>
        </div>
      </div>
    </div>
  );
}
