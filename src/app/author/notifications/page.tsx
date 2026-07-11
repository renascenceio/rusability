export const metadata = { title: "Уведомления — Rusability" };

const SETTINGS = [
  { title: "Новые комментарии", desc: "Когда кто-то отвечает на ваши статьи", on: true },
  { title: "Новые подписчики", desc: "Когда читатель подписывается на вас", on: true },
  { title: "Упоминания", desc: "Когда вас упоминают в комментариях", on: true },
  { title: "Еженедельная сводка", desc: "Статистика ваших публикаций за неделю", on: false },
  { title: "Выплаты", desc: "Уведомления о начислениях и выводах", on: true },
  { title: "Модерация РКН", desc: "Если материал отправлен на проверку", on: true },
];

export default function AuthorNotificationsPage() {
  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-black text-[var(--foreground)]">Уведомления</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Выберите, о чём мы будем вам сообщать
        </p>
      </header>

      <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {SETTINGS.map((s) => (
          <div key={s.title} className="flex items-center justify-between gap-4 px-5 py-4">
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
    </div>
  );
}
