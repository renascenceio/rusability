import "server-only";
import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import type { Comment } from "@/lib/types";

type Row = typeof comments.$inferSelect;

/** Build a nested comment tree (one level of replies) for an article. */
export async function commentsForArticle(articleId: string): Promise<Comment[]> {
  const rows = await db
    .select()
    .from(comments)
    .where(eq(comments.articleId, articleId))
    .orderBy(asc(comments.createdAt));
  return nest(rows);
}

function nest(rows: Row[]): Comment[] {
  const base = (r: Row): Comment => ({
    id: r.id,
    authorName: r.authorName,
    authorAvatar: r.authorAvatar,
    text: r.text,
    timeLabel: r.timeLabel,
    likes: r.likes,
    replies: [],
  });
  const map = new Map<string, Comment>();
  const roots: Comment[] = [];
  for (const r of rows) map.set(r.id, base(r));
  for (const r of rows) {
    const node = map.get(r.id)!;
    if (r.parentId && map.has(r.parentId)) {
      map.get(r.parentId)!.replies!.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
