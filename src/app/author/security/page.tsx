import { ShieldCheck, Smartphone, LogOut } from "lucide-react";

export const metadata = { title: "Безопасность — Rusability" };

export default function AuthorSecurityPage() {
  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-black text-[var(--foreground)]">Безопасность</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Пароль, вход и активные сессии
        </p>
      </header>

      <div className="space-y-5">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-4 font-serif text-lg font-bold text-[var(--foreground)]">Смена пароля</h2>
          <div className="space-y-3">
            {["Текущий пароль", "Новый пароль", "Повторите новый пароль"].map((l) => (
              <input
                key={l}
                type="password"
                placeholder={l}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              />
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button className="rounded-full bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]">
              Обновить пароль
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-[var(--success)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Двухфакторная аутентификация</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Дополнительный код при входе через приложение
                </p>
              </div>
            </div>
            <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)]">
              Включить
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-4 font-serif text-lg font-bold text-[var(--foreground)]">Активные сессии</h2>
          <div className="space-y-3">
            {[
              { device: "MacBook Pro · Chrome", loc: "Москва · сейчас", current: true },
              { device: "iPhone 15 · Safari", loc: "Москва · 2 часа назад", current: false },
            ].map((s) => (
              <div
                key={s.device}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{s.device}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{s.loc}</p>
                  </div>
                </div>
                {s.current ? (
                  <span className="rounded-full bg-[var(--success-soft)] px-3 py-1 text-xs font-semibold text-[var(--success)]">
                    Текущая
                  </span>
                ) : (
                  <button className="flex items-center gap-1.5 text-xs font-medium text-[var(--danger)]">
                    <LogOut className="h-3.5 w-3.5" /> Выйти
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
