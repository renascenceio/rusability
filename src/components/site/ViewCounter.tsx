"use client";

import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { formatCount } from "@/components/ui/kit";
import { recordView, type ContentKind } from "@/app/actions/engagement";

function viewedKey(kind: ContentKind, id: string) {
  return `rusability:viewed:${kind}:${id}`;
}

/**
 * Displays a live view count and records the view once per browser session.
 * Works even though article/news pages are statically prerendered: it fetches
 * the true current count on mount (incrementing on the first session visit,
 * peeking on repeats).
 */
export function ViewCounter({
  kind,
  contentId,
  initialViews,
  className,
}: {
  kind: ContentKind;
  contentId: string;
  initialViews: number;
  className?: string;
}) {
  const [views, setViews] = useState(initialViews);
  const done = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode's double-invoke in dev.
    if (done.current) return;
    done.current = true;

    let alreadyViewed = false;
    try {
      alreadyViewed = !!sessionStorage.getItem(viewedKey(kind, contentId));
    } catch {}

    recordView({ kind, contentId, peek: alreadyViewed }).then((res) => {
      if (res.ok) setViews(res.views);
      if (!alreadyViewed) {
        try {
          sessionStorage.setItem(viewedKey(kind, contentId), "1");
        } catch {}
      }
    });
  }, [kind, contentId]);

  return (
    <span className={className ?? "inline-flex items-center gap-1"}>
      <Eye className="h-4 w-4" /> {formatCount(views)}
    </span>
  );
}
