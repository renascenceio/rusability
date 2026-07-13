/**
 * Source attribution line for a news item. Share / like / comment are handled
 * by ArticleEngagement; this only credits the original source with a nofollow
 * link. Server component — no client state needed.
 */
export function NewsSource({ source, sourceUrl }: { source: string; sourceUrl?: string | null }) {
  return (
    <p className="mt-8 border-t border-border pt-5 text-[13px] text-muted-foreground">
      Источник:{" "}
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="font-medium text-foreground hover:underline"
        >
          {source}
        </a>
      ) : (
        <span className="font-medium text-foreground">{source}</span>
      )}{" "}
      · Rusability ИИ
    </p>
  );
}
