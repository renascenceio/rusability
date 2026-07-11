import type { Category, NewsCategory } from "@/lib/types";

export const CATEGORIES: Category[] = [
  { slug: "design", name: "Дизайн", short: "Дизайн", accent: "accent" },
  { slug: "marketing", name: "Маркетинг", short: "Маркетинг", accent: "primary" },
  { slug: "ux", name: "UX", short: "UX", accent: "gold" },
  { slug: "business", name: "Бизнес", short: "Бизнес", accent: "success" },
  { slug: "ai", name: "Искусственный интеллект", short: "ИИ", accent: "primary" },
  { slug: "tech", name: "Технологии", short: "Технологии", accent: "accent" },
];

export const NEWS_CATEGORIES: { slug: NewsCategory; name: string }[] = [
  { slug: "tech", name: "Технологии" },
  { slug: "marketing", name: "Маркетинг" },
  { slug: "business", name: "Бизнес" },
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
