import { ARTICLES, INDUSTRY_NEWS, type Article } from "@/lib/data";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import PostClient from "@/components/PostClient";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = ARTICLES.find(a => a.id.toString() === slug);

  const title = article ? `${article.title} | Rusability Magazine` : 'The Future of Marketing | Rusability Magazine';
  const description = article ? article.excerpt : 'Exploring the next frontier of digital marketing.';
  const image = article ? article.image : 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const article = ARTICLES.find(a => a.id.toString() === slug);

  if (!article && slug !== "future-of-marketing-ai") {
    notFound();
  }

  const displayData: Article = article || {
    id: 0,
    title: "The Future of Marketing: How AI is Redefining Personalization",
    excerpt: "Exploring the next frontier of digital marketing.",
    category: "Search Strategy",
    time: "8 min read",
    author: "Elena Rossi",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
    isProAuthor: true
  };

  const authorArticles = ARTICLES.filter(a => a.author === displayData.author && a.id !== displayData.id);
  const relatedNews = INDUSTRY_NEWS.slice(0, 3);

  return (
    <PostClient
      displayData={displayData}
      authorArticles={authorArticles}
      relatedNews={relatedNews}
    />
  );
}
