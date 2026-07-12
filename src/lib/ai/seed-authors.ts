import "server-only";
import { db } from "@/lib/db";
import { authors, aiAuthors, aiRequirements, newsbotSources, contentSettings } from "@/lib/db/schema";
import { AUTHOR_ARCHETYPES } from "./author-archetypes";
import { DEFAULT_REQUIREMENTS } from "./requirements-defaults";
import { DEFAULT_NEWS_SOURCES } from "./news-sources";
import { sql } from "drizzle-orm";

/**
 * Seed the 20 Russian AI author archetypes into BOTH `authors` (public byline)
 * and `ai_authors` (generation config), sharing the same id so article joins
 * keep working. Idempotent via upsert on primary key.
 */
export async function seedAiAuthors(): Promise<{ authors: number; aiAuthors: number }> {
  let authorCount = 0;
  let aiCount = 0;

  for (const a of AUTHOR_ARCHETYPES) {
    await db
      .insert(authors)
      .values({
        id: a.id,
        username: a.username,
        name: a.name,
        role: "ai",
        avatar: "",
        bio: a.bio,
        archetype: a.archetype,
        followers: 0,
        articlesCount: 0,
        elite: false,
        socials: {},
      })
      .onConflictDoUpdate({
        target: authors.id,
        set: { name: a.name, bio: a.bio, archetype: a.archetype, role: "ai", username: a.username },
      });
    authorCount++;

    await db
      .insert(aiAuthors)
      .values({
        id: a.id,
        name: a.name,
        avatar: "",
        archetype: a.archetype,
        topics: a.topics,
        active: true,
        schedule: "daily",
        bio: a.bio,
        tone: a.tone,
        approach: a.approach,
        stylePrompt: a.stylePrompt,
        category: a.category,
      })
      .onConflictDoUpdate({
        target: aiAuthors.id,
        set: {
          name: a.name,
          archetype: a.archetype,
          topics: a.topics,
          bio: a.bio,
          tone: a.tone,
          approach: a.approach,
          stylePrompt: a.stylePrompt,
          category: a.category,
        },
      });
    aiCount++;
  }

  // Seed default AI Requirements (only if absent — never clobber edits).
  for (const r of DEFAULT_REQUIREMENTS) {
    await db
      .insert(aiRequirements)
      .values({ key: r.key, title: r.title, content: r.content })
      .onConflictDoNothing({ target: aiRequirements.key });
  }

  return { authors: authorCount, aiAuthors: aiCount };
}

/** Seed default Russian news sources + the single content_settings row. */
export async function seedNewsAndSettings(): Promise<{ sources: number }> {
  for (const s of DEFAULT_NEWS_SOURCES) {
    await db
      .insert(newsbotSources)
      .values({ id: s.id, name: s.name, url: s.url, active: true, category: s.category, lang: "ru" })
      .onConflictDoUpdate({ target: newsbotSources.id, set: { name: s.name, url: s.url, category: s.category } });
  }
  await db
    .insert(contentSettings)
    .values({ id: 1 })
    .onConflictDoNothing({ target: contentSettings.id });
  return { sources: DEFAULT_NEWS_SOURCES.length };
}

/** Sync the public `authors.articles_count` from real published articles. */
export async function syncAuthorArticleCounts(): Promise<void> {
  await db.execute(sql`
    UPDATE authors a SET articles_count = (
      SELECT count(*) FROM articles ar
      WHERE ar.author_id = a.id AND ar.status = 'published'
    )
  `);
}
