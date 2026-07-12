import { publishedNews, popularNews } from "@/lib/data/news";
import { activeCta } from "@/lib/data/ctas";
import { NewsBrowser } from "@/components/site/NewsBrowser";

export const metadata = {
  title: "Новости — Rusability",
  description: "Живая лента индустрии: технологии, маркетинг, бизнес и наука.",
};

export default async function NewsPage() {
  const [news, popular, cta] = await Promise.all([
    publishedNews(),
    popularNews(5),
    activeCta("news"),
  ]);

  return (
    <div className="container-editorial py-9 md:py-12">
      <div className="mx-auto max-w-5xl">
        <NewsBrowser news={news} popular={popular} cta={cta} />
      </div>
    </div>
  );
}
