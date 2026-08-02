"use client";

import { useMemo } from "react";

/**
 * Interactive, theme-aware night sky rendered in pure CSS (no image).
 * Stars use `currentColor` so they follow the theme foreground token —
 * light stars on the dark theme, dark stars on the light theme — and twinkle
 * subtly. A restrained aurora borealis drifts behind them. Deterministic
 * (seeded) layout so server and client markup match exactly (no hydration flash).
 */

// Small deterministic PRNG (mulberry32) — stable output for a given seed.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = {
  left: number;
  top: number;
  size: number;
  min: number;
  max: number;
  dur: number;
  delay: number;
};

export function AuthorSky({
  seed = 1,
  count = 60,
  className = "",
}: {
  seed?: number;
  count?: number;
  className?: string;
}) {
  const stars = useMemo<Star[]>(() => {
    const rand = mulberry32(seed * 2654435761);
    return Array.from({ length: count }, () => {
      const size = 1 + rand() * 2.2; // 1–3.2px, mostly small
      return {
        left: rand() * 100,
        top: rand() * 100,
        size,
        min: 0.08 + rand() * 0.15, // dim baseline
        max: 0.55 + rand() * 0.4, // subtle but visible peak
        dur: 3 + rand() * 5, // 3–8s
        delay: rand() * 6, // staggered
      };
    });
  }, [seed, count]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none overflow-hidden text-[var(--foreground)] ${className}`}
    >
      {/* Aurora borealis — soft, drifting, restrained */}
      <div
        className="author-aurora absolute -inset-x-10 top-0 h-2/3"
        style={{
          animation: "sky-aurora 16s ease-in-out infinite",
          background:
            "radial-gradient(60% 80% at 25% 10%, color-mix(in srgb, #35e0b0 45%, transparent), transparent 70%)," +
            "radial-gradient(55% 75% at 70% 0%, color-mix(in srgb, #4f8cff 38%, transparent), transparent 72%)," +
            "radial-gradient(45% 70% at 90% 20%, color-mix(in srgb, #a78bfa 30%, transparent), transparent 74%)",
          filter: "blur(38px)",
          opacity: 0.55,
        }}
      />
      {/* Second, slower aurora ribbon for depth */}
      <div
        className="author-aurora absolute -inset-x-10 top-0 h-1/2"
        style={{
          animation: "sky-aurora 24s ease-in-out -8s infinite",
          background:
            "radial-gradient(50% 70% at 55% 5%, color-mix(in srgb, #2dd4bf 30%, transparent), transparent 72%)",
          filter: "blur(46px)",
          opacity: 0.4,
        }}
      />
      {/* Stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="author-star"
          style={
            {
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              "--star-min": s.min,
              "--star-max": s.max,
              "--dur": `${s.dur}s`,
              "--delay": `${s.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
