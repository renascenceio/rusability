/*
  Static taxonomy — categories are a fixed editorial taxonomy, not user
  content, so they live here as client-safe config (importable from both
  server and client components) rather than in the database.
*/
import type { Category, NewsCategory } from "@/lib/types";

export const CATEGORIES: Category[] = [
  { slug: "design", name: "Дизайн", short: "Дизайн", accent: "accent" },
  { slug: "marketing", name: "Маркетинг", short: "Маркетинг", accent: "primary" },
  { slug: "pr", name: "PR", short: "PR", accent: "gold" },
  { slug: "seo", name: "SEO", short: "SEO", accent: "success" },
  { slug: "analytics", name: "Аналитика", short: "Аналитика", accent: "primary" },
  { slug: "ai", name: "Нейросети", short: "Нейросети", accent: "primary" },
  { slug: "ux", name: "UX/UI", short: "UX/UI", accent: "gold" },
  { slug: "business", name: "Бизнес", short: "Бизнес", accent: "success" },
  { slug: "smm", name: "SMM", short: "SMM", accent: "accent" },
  { slug: "media", name: "Медиа", short: "Медиа", accent: "primary" },
  { slug: "tech", name: "Технологии", short: "Технологии", accent: "accent" },
  { slug: "ecommerce", name: "E-commerce", short: "E-commerce", accent: "success" },
  { slug: "behavioral", name: "Поведенческая экономика", short: "Поведенческая", accent: "gold" },
  { slug: "cx", name: "Клиентский опыт", short: "CX", accent: "accent" },
  { slug: "startups", name: "Стартапы", short: "Стартапы", accent: "success" },
  { slug: "science", name: "Наука", short: "Наука", accent: "primary" },
];

export const NEWS_CATEGORIES: { slug: NewsCategory; name: string }[] = [
  { slug: "tech", name: "Технологии" },
  { slug: "ai", name: "Нейросети" },
  { slug: "business", name: "Бизнес" },
  { slug: "marketing", name: "Маркетинг" },
  { slug: "fintech", name: "Финтех" },
  { slug: "biotech", name: "Биотех" },
  { slug: "startups", name: "Стартапы" },
  { slug: "ecommerce", name: "E-commerce" },
  { slug: "science", name: "Наука" },
];

export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function categoryAccent(slug: string): Category["accent"] {
  return CATEGORIES.find((c) => c.slug === slug)?.accent ?? "primary";
}

export function newsCategoryName(slug: string): string {
  return NEWS_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}
