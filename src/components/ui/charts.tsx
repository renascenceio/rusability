"use client";

import { useId } from "react";
import type { MetricPoint } from "@/lib/types";

const PALETTE = [
  "var(--primary)",
  "var(--accent)",
  "var(--gold)",
  "var(--success)",
  "var(--muted-foreground)",
];

/* ---------------- Sparkline ---------------- */

export function Sparkline({ data, color = "var(--primary)" }: { data: number[]; color?: string }) {
  const w = 100;
  const h = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return [x, y] as const;
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------- Area chart ---------------- */

export function AreaChart({ data, height = 240 }: { data: MetricPoint[]; height?: number }) {
  const id = useId();
  const w = 600;
  const h = height;
  const pad = 24;
  const max = Math.max(...data.map((d) => d.value)) * 1.1;
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((d, i) => {
    const x = pad + i * step;
    const y = h - pad - (d.value / max) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={pad}
          x2={w - pad}
          y1={h - pad - f * (h - pad * 2)}
          y2={h - pad - f * (h - pad * 2)}
          stroke="var(--border)"
          strokeDasharray="3 5"
        />
      ))}
      <path d={area} fill={`url(#area-${id})`} />
      <path d={line} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill="var(--surface)" stroke="var(--primary)" strokeWidth={2} />
      ))}
      {data.map((d, i) => (
        <text
          key={d.label}
          x={pts[i][0]}
          y={h - 6}
          textAnchor="middle"
          className="fill-[var(--muted-foreground)]"
          style={{ fontSize: 11 }}
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}

/* ---------------- Bar chart ---------------- */

export function BarChart({ data, height = 240 }: { data: MetricPoint[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value)) * 1.1;
  return (
    <div className="flex items-end justify-between gap-3" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-lg bg-[var(--primary)] transition-all"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: 4 }}
            />
          </div>
          <span className="text-xs text-[var(--muted-foreground)]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Donut ---------------- */

export function Donut({ data, size = 180 }: { data: MetricPoint[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 70;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 180 180" style={{ width: size, height: size }} className="shrink-0">
        <g transform="rotate(-90 90 90)">
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = frac * c;
            const seg = (
              <circle
                key={d.label}
                cx="90"
                cy="90"
                r={r}
                fill="none"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={22}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return seg;
          })}
        </g>
        <text x="90" y="86" textAnchor="middle" className="fill-[var(--foreground)]" style={{ fontSize: 26, fontWeight: 700 }}>
          {total >= 1000 ? `${(total / 1000).toFixed(0)}K` : total}
        </text>
        <text x="90" y="106" textAnchor="middle" className="fill-[var(--muted-foreground)]" style={{ fontSize: 11 }}>
          всего
        </text>
      </svg>
      <ul className="space-y-2">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            <span className="text-[var(--muted-foreground)]">{d.label}</span>
            <span className="font-semibold text-[var(--foreground)]">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Score ring ---------------- */

export function ScoreRing({
  value,
  color = "var(--primary)",
  label,
  size = 64,
}: {
  value: number;
  color?: string;
  label?: string;
  size?: number;
}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" style={{ width: size, height: size }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth={7} />
        <g transform="rotate(-90 32 32)">
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
          />
        </g>
        <text
          x="32"
          y="37"
          textAnchor="middle"
          className="fill-[var(--foreground)]"
          style={{ fontSize: 15, fontWeight: 700 }}
        >
          {value}
        </text>
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
