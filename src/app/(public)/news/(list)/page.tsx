import { publishedNews, popularNews } from "@/lib/data/news";
import { activeCta } from "@/lib/data/ctas";
import { NewsBrowser } from "@/components/site/NewsBrowser";

export const metadata = {
  title: "Новости",
  description: "Живая лента индустрии: технологии, маркетинг, бизнес и наука.",
};

// Reads live published news from the DB — render at request time.
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const [allNews, popular, cta] = await Promise.all([
    publishedNews(),
    popularNews(5),
    activeCta("news"),
  ]);

  // The browser only ever renders ~19 items per view and filters client-side;
  // it never shows deep history. Cap the shipped payload to the most recent
  // window (still ample for category filtering + search) and pass the true
  // aggregates the header needs, so the page transfers a fraction of before.
  const total = allNews.length;
  const now = new Date();
  const todayCount = allNews.filter((n) => {
    const d = new Date(n.publishedAt);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }).length;
  const news = allNews.slice(0, 400);

  return (
    <div className="container-editorial py-9 md:py-12">
      <div className="mx-auto max-w-5xl">
        <NewsBrowser
          news={news}
          popular={popular}
          cta={cta}
          total={total}
          todayCount={todayCount}
        />
      </div>
    </div>
  );
}
