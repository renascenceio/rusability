import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Send, Globe, Crown, Sparkles, ArrowLeft } from "lucide-react";
import { getAuthorByUsername } from "@/lib/data/authors";
import { articlesByAuthor } from "@/lib/data/articles";
import { ArticleCard } from "@/components/site/ArticleCard";
import { SubscribeButton } from "@/components/site/SubscribeButton";
import { Avatar, Badge } from "@/components/ui/kit";
import { getCurrentUser } from "@/lib/auth-helpers";
import { isSubscribed } from "@/app/actions/subscriptions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const author = await getAuthorByUsername(username);
  if (!author) return {};
  return { title: `${author.name} — Rusability`, description: author.bio };
}

export default async function AuthorPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const author = await getAuthorByUsername(username);
  if (!author) notFound();

  const articles = (await articlesByAuthor(author.id)).filter(
    (a) => a.status === "published",
  );

  const [currentUser, subscribed] = await Promise.all([
    getCurrentUser(),
    isSubscribed(author.id),
  ]);

  return (
    <div>
      {/* Banner */}
      <div className="relative h-44 w-full overflow-hidden md:h-60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/covers/author-banner.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      <div className="container-editorial">
        <Link
          href="/authors"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} /> Все авторы
        </Link>

        {/* Header */}
        <div className="-mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <Avatar
              src={author.avatar}
              alt={author.name}
              size={112}
              className="ring-4 ring-[var(--background)]"
            />
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">
                  {author.name}
                </h1>
                {author.elite && (
                  <Badge tone="gold">
                    <Crown className="h-3.5 w-3.5" /> Elite
                  </Badge>
                )}
                {author.role === "ai" && (
                  <Badge tone="primary">
                    <Sparkles className="h-3.5 w-3.5" /> ИИ-автор
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
                {author.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {author.location}
                  </span>
                )}
                {author.socials?.telegram && (
                  <span className="inline-flex items-center gap-1">
                    <Send className="h-4 w-4" /> {author.socials.telegram}
                  </span>
                )}
                {author.socials?.site && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-4 w-4" /> {author.socials.site}
                  </span>
                )}
              </div>
            </div>
          </div>
          <SubscribeButton
            authorId={author.id}
            initialSubscribed={subscribed}
            authed={Boolean(currentUser)}
            className="self-start md:self-auto"
          />
        </div>

        {/* Manifesto + bio */}
        <div className="mt-6 grid gap-6 border-y border-[var(--border)] py-6 md:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            {author.manifesto && (
              <p className="font-serif text-xl italic leading-relaxed text-[var(--foreground)] text-pretty">
                {author.manifesto}
              </p>
            )}
            <p className="mt-3 text-base leading-relaxed text-[var(--muted-foreground)]">
              {author.bio}
            </p>
          </div>
          <div className="flex gap-8">
            <Stat value={String(author.articlesCount)} label="Материалы" />
          </div>
        </div>

        {/* Articles */}
        <section className="py-10">
          <h2 className="mb-6 font-serif text-2xl font-bold text-[var(--foreground)]">
            Материалы автора
          </h2>
          {articles.length === 0 ? (
            <p className="text-[var(--muted-foreground)]">Пока нет опубликованных материалов.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-2xl font-bold text-[var(--foreground)]">{value}</div>
      <div className="text-sm text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}
