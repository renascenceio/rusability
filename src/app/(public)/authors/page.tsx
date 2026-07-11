import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";
import { AUTHORS } from "@/lib/mock/authors";
import { Avatar, Badge, Card } from "@/components/ui/kit";
import { formatNumber } from "@/lib/utils";

export const metadata = {
  title: "Авторы — Rusability",
  description: "Эксперты, исследователи и практики, которые пишут для Rusability.",
};

export default function AuthorsPage() {
  return (
    <div className="container-editorial py-10 md:py-14">
      <header className="mb-10 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
          Сообщество
        </span>
        <h1 className="mt-2 font-serif text-4xl font-bold text-[var(--foreground)] md:text-5xl">
          Авторы
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Практики и исследователи, которые делятся опытом. Подпишитесь на тех, кто вам близок.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {AUTHORS.map((a) => (
          <Link key={a.id} href={`/authors/${a.username}`}>
            <Card className="flex h-full flex-col items-center p-6 text-center transition-transform hover:-translate-y-1">
              <Avatar src={a.avatar} alt={a.name} size={80} />
              <div className="mt-4 flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[var(--foreground)]">{a.name}</h2>
                {a.elite && <Crown className="h-4 w-4 text-[var(--gold-ink)]" />}
                {a.role === "ai" && <Sparkles className="h-4 w-4 text-[var(--primary)]" />}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-foreground)]">{a.bio}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                <span>
                  <b className="text-[var(--foreground)]">{formatNumber(a.followers)}</b> подписчиков
                </span>
                <span>
                  <b className="text-[var(--foreground)]">{a.articlesCount}</b> статей
                </span>
              </div>
              {a.elite && (
                <Badge tone="gold" className="mt-4">
                  Elite-автор
                </Badge>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
