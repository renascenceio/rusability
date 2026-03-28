import { ARTICLES, Article, UserProfile, INDUSTRY_NEWS, NewsItem } from "./data";

/**
 * Calculates a relevance score for an article based on user interests.
 */
export function getRelevanceScore(article: Article, user: UserProfile): number {
  let score = 0;

  // Base score on category match
  if (user.interests.some(interest =>
    article.category.toLowerCase().includes(interest.toLowerCase()) ||
    interest.toLowerCase().includes(article.category.toLowerCase())
  )) {
    score += 10;
  }

  // Bonus for title/excerpt matches
  user.interests.forEach(interest => {
    const regex = new RegExp(interest, 'gi');
    const titleMatches = (article.title.match(regex) || []).length;
    const excerptMatches = (article.excerpt.match(regex) || []).length;
    score += (titleMatches * 5) + (excerptMatches * 2);
  });

  // Small bonus for engagement if available
  if (article.engagement) {
    score += (article.engagement / 10);
  }

  // Random variance to simulate "AI discovery"
  score += Math.random() * 2;

  return score;
}

/**
 * Returns a personalized feed of articles for a user.
 */
export function getPersonalizedFeed(user: UserProfile, limit: number = 6): Article[] {
  return [...ARTICLES]
    .sort((a, b) => getRelevanceScore(b, user) - getRelevanceScore(a, user))
    .slice(0, limit);
}

/**
 * Returns personalized news items for a user.
 */
export function getPersonalizedNews(user: UserProfile, limit: number = 5): NewsItem[] {
  return [...INDUSTRY_NEWS]
    .sort((a, b) => {
      const aMatch = user.interests.some(i => a.category.toLowerCase().includes(i.toLowerCase())) ? 10 : 0;
      const bMatch = user.interests.some(i => b.category.toLowerCase().includes(i.toLowerCase())) ? 10 : 0;
      return bMatch - aMatch;
    })
    .slice(0, limit);
}
