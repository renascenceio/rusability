import { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = ARTICLES.map((post) => ({
    url: `https://rusability.vercel.app/posts/${post.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://rusability.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://rusability.vercel.app/news',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://rusability.vercel.app/tools',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://rusability.vercel.app/events',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    ...posts,
  ];
}
