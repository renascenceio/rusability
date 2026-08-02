import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Send, Globe, Crown, ArrowLeft } from "lucide-react";
import { getAuthorByUsername } from "@/lib/data/authors";
import { articlesByAuthor } from "@/lib/data/articles";
import { ArticleCard } from "@/components/site/ArticleCard";
import { AnalyticsBeacon } from "@/components/site/AnalyticsBeacon";
import { AuthorSky } from "@/components/site/AuthorSky";
import { Avatar, Badge } from "@/components/ui/kit";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const author = await getAuthorByUsername(username);
  if (!author) return {};
  return { title: author.name, description: author.bio };
}

export default async function AuthorPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const author = await getAuthorByUsername(username);
  if (!author) notFound();

  const articles = (await articlesByAuthor(author.id)).filter(
    (a) => a.status === "published",
  );

  return (
    <div>
      <AnalyticsBeacon kind="author" contentId={author.id} authorId={author.id} />
      {/* Hero with interactive, theme-aware night sky (stars + aurora) */}
      <section className="relative overflow-hidden">
        <AuthorSky seed={skySeed(username)} className="absolute inset-0 z-0" />
        {/* Gentle fade into the page background just above the details splitter */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-b from-transparent to-[var(--background)]"
        />

        <div className="relative z-10 container-editorial pb-6 pt-4">
          <Link
            href="/authors"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={16} /> Все авторы
          </Link>

          {/* Header — avatar sits cleanly on the sky, nothing overlapping it */}
          <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
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
        </div>
      </section>

      {/* Articles */}
      <div className="container-editorial">
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

/** Stable small integer seed from the username so each author gets a distinct sky. */
function skySeed(username: string): number {
  let h = 2166136261;
  for (let i = 0; i < username.length; i++) {
    h ^= username.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (Math.abs(h) % 100000) + 1;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-2xl font-bold text-[var(--foreground)]">{value}</div>
      <div className="text-sm text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}
