export const metadata = { title: "Профиль — Rusability" };

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <input
        defaultValue={value}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
      />
      {hint && <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{hint}</span>}
    </label>
  );
}

export default function AuthorProfilePage() {
  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-black text-[var(--foreground)]">Профиль</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Как вас видят читатели на публичной странице
        </p>
      </header>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] text-xl font-bold text-[var(--primary-foreground)]">
            А
          </div>
          <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)]">
            Загрузить фото
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Имя" value="Анна Соколова" />
          <Field label="Никнейм" value="anna_sokolova" hint="rusability.ru/author/anna_sokolova" />
          <Field label="Специализация" value="UX-дизайн, продуктовое мышление" />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">О себе</span>
            <textarea
              rows={4}
              defaultValue="Пишу о том, как интерфейсы формируют поведение. 8 лет в продуктовом дизайне."
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="rounded-full bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
