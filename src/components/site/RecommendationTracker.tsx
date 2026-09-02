"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  trackRecommendationEvent,
  type RecommendationKind,
  type RecommendationSurface,
} from "@/app/actions/track";
import { getSessionId, getVisitorId } from "@/components/site/AnalyticsBeacon";

export function RecommendationTracker({
  children,
  surface,
  sourceKind,
  sourceContentId,
  targetKind,
  targetContentId,
}: {
  children: ReactNode;
  surface: RecommendationSurface;
  sourceKind: RecommendationKind;
  sourceContentId: number;
  targetKind: RecommendationKind;
  targetContentId: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const impressed = useRef(false);
  const clicked = useRef(false);

  const send = (eventType: "impression" | "click") =>
    trackRecommendationEvent({
      eventType,
      surface,
      sourceKind,
      sourceContentId,
      targetKind,
      targetContentId,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
    }).catch(() => {});

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.5 || impressed.current) return;
        impressed.current = true;
        void send("impression");
        observer.disconnect();
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [surface, sourceKind, sourceContentId, targetKind, targetContentId]);

  return (
    <div
      ref={ref}
      className="min-w-0"
      onClick={(event) => {
        if (clicked.current || !(event.target as Element).closest("a")) return;
        clicked.current = true;
        void send("click");
      }}
    >
      {children}
    </div>
  );
}
