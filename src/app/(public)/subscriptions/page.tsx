import Link from "next/link";
import { Crown, Sparkles, Heart } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { mySubscriptions } from "@/app/actions/subscriptions";
import { SubscribeButton } from "@/components/site/SubscribeButton";
import { Avatar, Badge, Card, ButtonLink } from "@/components/ui/kit";
import { formatNumber } from "@/lib/utils";

export const metadata = {
  title: "Мои подписки — Rusability",
  description: "Авторы, на которых вы подписаны.",
};

export default async function SubscriptionsPage() {
  await requireUser("/subscriptions");
  const authors = await mySubscriptions();

  return (
    <div className="container-editorial py-10 md:py-14">
      <header className="mb-10 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
          Профиль
        </span>
        <h1 className="mt-2 font-serif text-4xl font-bold text-[var(--foreground)] md:text-5xl">
          Мои подписки
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          {authors.length > 0
            ? `Вы подписаны на ${formatNumber(authors.length)} ${plural(authors.length)}.`
            : "Здесь появятся авторы, на которых вы подпишетесь."}
        </p>
      </header>

      {authors.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-soft)]">
            <Heart className="h-6 w-6 text-[var(--primary)]" />
          </span>
          <div>
            <p className="font-serif text-xl font-bold text-[var(--foreground)]">
              Пока нет подписок
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Подпишитесь на авторов, чтобы следить за их новыми материалами.
            </p>
          </div>
          <ButtonLink href="/authors">Смотреть авторов</ButtonLink>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((a) => (
            <Card key={a.id} className="flex h-full flex-col items-center p-6 text-center">
              <Link href={`/authors/${a.username}`} className="flex flex-col items-center">
                <Avatar src={a.avatar} alt={a.name} size={80} />
                <div className="mt-4 flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold text-[var(--foreground)]">
                    {a.name}
                  </h2>
                  {a.elite && <Crown className="h-4 w-4 text-[var(--gold-ink)]" />}
                  {a.role === "ai" && <Sparkles className="h-4 w-4 text-[var(--primary)]" />}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-foreground)]">{a.bio}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                  <span>
                    <b className="text-[var(--foreground)]">{formatNumber(a.followers)}</b>{" "}
                    подписчиков
                  </span>
                  <span>
                    <b className="text-[var(--foreground)]">{a.articlesCount}</b> статей
                  </span>
                </div>
              </Link>
              <div className="mt-5">
                <SubscribeButton
                  authorId={a.id}
                  initialSubscribed
                  authed
                  size="sm"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function plural(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "автора";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "авторов";
  return "авторов";
}
