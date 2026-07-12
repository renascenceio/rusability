import { db } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { fetchCredits } from "@/app/editor/actions";
import { glyphAvatar } from "@/lib/avatar";
import { Sparkles, Crown } from "lucide-react";

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

export default async function AuthorProfilePage() {
  const user = await getCurrentUser();
  const rows = user
    ? await db.select().from(authors).where(eq(authors.userId, user.id)).limit(1)
    : [];
  const author = rows[0];
  const credits = await fetchCredits();

  const name = author?.name ?? user?.name ?? "Автор";
  const username = author?.username ?? user?.email?.split("@")[0] ?? "author";
  const elite = author?.elite ?? false;
  const avatar = author?.avatar && author.avatar.trim() ? author.avatar : glyphAvatar(name, { elite });

  return (
    <div className="max-w-2xl">
      {/* Rusability logo header */}
      <div className="mb-6 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/rusability-logo-black.png"
          alt="Rusability"
          className="h-6 w-auto dark:hidden"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/rusability-logo-white.png"
          alt="Rusability"
          className="hidden h-6 w-auto dark:block"
        />
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
          Профиль автора
        </span>
      </div>

      <header className="mb-6">
        <h1 className="font-serif text-3xl font-black text-[var(--foreground)]">Профиль</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Как вас видят читатели на публичной странице
        </p>
      </header>

      {/* AI credits card */}
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--accent-soft,rgba(212,162,78,0.15))] text-[var(--accent)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">ИИ-кредиты</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              1 кредит = 1 генерация статьи или изображения
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-serif text-2xl font-black text-[var(--foreground)]">
            {credits.unlimited ? "Безлимит" : `${credits.remaining} / ${credits.limit}`}
          </p>
          {!credits.unlimited && (
            <p className="text-xs text-[var(--muted-foreground)]">осталось в этом месяце</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-6 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt={name}
            className="h-16 w-16 rounded-full object-cover"
          />
          <div className="flex flex-col gap-2">
            <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)]">
              Загрузить фото
            </button>
            {elite && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                <Crown className="h-3.5 w-3.5" /> Elite-автор
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Field label="Имя" value={name} />
          <Field label="Никнейм" value={username} hint={`rusability.ru/author/${username}`} />
          <Field label="Специализация" value={author?.archetype ?? ""} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">О себе</span>
            <textarea
              rows={4}
              defaultValue={author?.bio ?? ""}
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
