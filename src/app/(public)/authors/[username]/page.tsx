import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Send, Globe, Crown, ArrowLeft } from "lucide-react";
import { getAuthorByUsername } from "@/lib/data/authors";
import { articlesByAuthor } from "@/lib/data/articles";
import { ArticleCard } from "@/components/site/ArticleCard";
import { AnalyticsBeacon } from "@/components/site/AnalyticsBeacon";
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
      {/* Starry aurora header band */}
      <div className="relative h-28 w-full overflow-hidden md:h-36">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/covers/author-aurora.png"
          alt=""
          className="h-full w-full object-cover"
        />
        {/* Fade the starfield down into the page background for a seamless blend */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--background)]"
        />
        <div className="absolute inset-x-0 top-0">
          <div className="container-editorial pt-4">
            <Link
              href="/authors"
              className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/55"
            >
              <ArrowLeft size={16} /> Все авторы
            </Link>
          </div>
        </div>
      </div>

      <div className="container-editorial">
        {/* Header — pulled up to overlap the aurora band */}
        <div className="-mt-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
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
