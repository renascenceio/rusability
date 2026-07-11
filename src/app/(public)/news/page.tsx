import { publishedNews, popularNews } from "@/lib/mock/news";
import { NewsBrowser } from "@/components/site/NewsBrowser";

export const metadata = {
  title: "Новости — Rusability",
  description: "Живая лента индустрии: технологии, маркетинг, бизнес и наука.",
};

export default function NewsPage() {
  const news = publishedNews();
  const popular = popularNews(5);

  return (
    <div className="container-editorial py-10">
      <NewsBrowser news={news} popular={popular} />
    </div>
  );
}
