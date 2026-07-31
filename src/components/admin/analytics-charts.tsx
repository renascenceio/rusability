"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

export const CHART_COLORS = {
  primary: "var(--primary)",
  gold: "var(--gold)",
  accent: "var(--accent)",
  success: "var(--success)",
  muted: "var(--muted-foreground)",
};

export const SLICE_PALETTE = [
  "var(--primary)",
  "var(--gold)",
  "var(--accent)",
  "var(--success)",
  "var(--muted-foreground)",
];

function useMeasure() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

function niceNum(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}
function niceCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(".", ",")}K`;
  return niceNum(n);
}

/** Tooltip card shared by all charts. */
function Tip({
  x,
  containerW,
  title,
  rows,
}: {
  x: number;
  containerW: number;
  title: string;
  rows: { label: string; value: string; color: string }[];
}) {
  const clampedLeft = Math.min(Math.max(x, 70), containerW - 70);
  return (
    <div
      className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-lg"
      style={{ left: clampedLeft, minWidth: 128 }}
    >
      <div className="mb-1 text-[11px] font-medium text-[var(--muted-foreground)]">{title}</div>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: r.color }} />
              {r.label}
            </span>
            <span className="font-semibold tabular-nums text-[var(--foreground)]">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Line / area chart (multi-series, hover crosshair)                   */
/* ------------------------------------------------------------------ */

export type LineSeries = { key: string; label: string; color: string; values: number[] };

export function LineChart({
  labels,
  series,
  height = 260,
  area = false,
  format = niceCompact,
}: {
  labels: string[];
  series: LineSeries[];
  height?: number;
  area?: boolean;
  format?: (n: number) => string;
}) {
  const { ref, width } = useMeasure();
  const [hover, setHover] = useState<number | null>(null);

  const padL = 44;
  const padR = 14;
  const padT = 14;
  const padB = 26;
  const plotW = Math.max(width - padL - padR, 10);
  const plotH = height - padT - padB;
  const n = labels.length;

  const max = useMemo(() => {
    const m = Math.max(1, ...series.flatMap((s) => s.values));
    return m * 1.12;
  }, [series]);

  const xFor = (i: number) => padL + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yFor = (v: number) => padT + (1 - v / max) * plotH;

  const ticks = [0, 0.25, 0.5, 0.75, 1];

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - rect.left - padL) / plotW;
    const idx = Math.round(fx * (n - 1));
    setHover(Math.min(Math.max(idx, 0), n - 1));
  }

  // Show a subset of x labels to avoid overlap.
  const labelEvery = Math.max(1, Math.ceil(n / 8));

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      <svg
        width={width}
        height={height}
        className="block touch-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {/* gridlines + y labels */}
        {ticks.map((t) => {
          const y = padT + t * plotH;
          const val = max * (1 - t);
          return (
            <g key={t}>
              <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 5" />
              <text x={padL - 8} y={y + 4} textAnchor="end" style={{ fontSize: 10 }} className="fill-[var(--muted-foreground)]">
                {format(val)}
              </text>
            </g>
          );
        })}

        {/* area fill for the first series */}
        {area && series[0] && n > 1 && (
          <path
            d={
              series[0].values.map((v, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(v)}`).join(" ") +
              ` L${xFor(n - 1)},${padT + plotH} L${xFor(0)},${padT + plotH} Z`
            }
            fill={series[0].color}
            opacity={0.12}
          />
        )}

        {/* lines */}
        {series.map((s) => (
          <path
            key={s.key}
            d={s.values.map((v, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(v)}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* x labels */}
        {labels.map((l, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <text key={i} x={xFor(i)} y={height - 8} textAnchor="middle" style={{ fontSize: 10 }} className="fill-[var(--muted-foreground)]">
              {l}
            </text>
          ) : null,
        )}

        {/* crosshair + points */}
        {hover !== null && (
          <>
            <line x1={xFor(hover)} x2={xFor(hover)} y1={padT} y2={padT + plotH} stroke="var(--muted-foreground)" strokeOpacity={0.4} />
            {series.map((s) => (
              <circle
                key={s.key}
                cx={xFor(hover)}
                cy={yFor(s.values[hover] ?? 0)}
                r={4}
                fill="var(--surface)"
                stroke={s.color}
                strokeWidth={2.5}
              />
            ))}
          </>
        )}
      </svg>

      {hover !== null && (
        <Tip
          x={xFor(hover)}
          containerW={width}
          title={labels[hover] ?? ""}
          rows={series.map((s) => ({ label: s.label, value: format(s.values[hover] ?? 0), color: s.color }))}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stacked bar chart (e.g. publications: articles + news)              */
/* ------------------------------------------------------------------ */

export function StackedBarChart({
  labels,
  series,
  height = 240,
  format = niceNum,
}: {
  labels: string[];
  series: LineSeries[];
  height?: number;
  format?: (n: number) => string;
}) {
  const { ref, width } = useMeasure();
  const [hover, setHover] = useState<number | null>(null);

  const padL = 40;
  const padR = 12;
  const padT = 12;
  const padB = 26;
  const plotW = Math.max(width - padL - padR, 10);
  const plotH = height - padT - padB;
  const n = labels.length;

  const totals = labels.map((_, i) => series.reduce((s, ser) => s + (ser.values[i] ?? 0), 0));
  const max = Math.max(1, ...totals) * 1.12;
  const slot = plotW / Math.max(n, 1);
  const barW = Math.max(2, Math.min(slot * 0.7, 26));
  const yFor = (v: number) => (v / max) * plotH;
  const labelEvery = Math.max(1, Math.ceil(n / 8));
  const ticks = [0, 0.5, 1];

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const idx = Math.floor(((e.clientX - rect.left - padL) / plotW) * n);
    setHover(Math.min(Math.max(idx, 0), n - 1));
  }

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      <svg width={width} height={height} className="block touch-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {ticks.map((t) => {
          const y = padT + t * plotH;
          return (
            <g key={t}>
              <line x1={padL} x2={width - padR} y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 5" />
              <text x={padL - 8} y={y + 4} textAnchor="end" style={{ fontSize: 10 }} className="fill-[var(--muted-foreground)]">
                {format(max * (1 - t))}
              </text>
            </g>
          );
        })}
        {labels.map((_, i) => {
          const cx = padL + i * slot + slot / 2;
          let acc = 0;
          return (
            <g key={i}>
              {series.map((s) => {
                const v = s.values[i] ?? 0;
                const barH = yFor(v);
                const y = padT + plotH - acc - barH;
                acc += barH;
                return (
                  <rect
                    key={s.key}
                    x={cx - barW / 2}
                    y={y}
                    width={barW}
                    height={Math.max(0, barH)}
                    fill={s.color}
                    opacity={hover === null || hover === i ? 1 : 0.4}
                    rx={1.5}
                  />
                );
              })}
            </g>
          );
        })}
        {labels.map((l, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <text key={i} x={padL + i * slot + slot / 2} y={height - 8} textAnchor="middle" style={{ fontSize: 10 }} className="fill-[var(--muted-foreground)]">
              {l}
            </text>
          ) : null,
        )}
      </svg>
      {hover !== null && (
        <Tip
          x={padL + hover * slot + slot / 2}
          containerW={width}
          title={labels[hover] ?? ""}
          rows={[
            ...series.map((s) => ({ label: s.label, value: format(s.values[hover] ?? 0), color: s.color })),
            { label: "Всего", value: format(totals[hover] ?? 0), color: "var(--foreground)" },
          ]}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donut with hover                                                    */
/* ------------------------------------------------------------------ */

export function DonutChart({
  data,
  size = 200,
  unit = "",
}: {
  data: { key: string; label: string; value: number }[];
  size?: number;
  unit?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 78;
  const c = 2 * Math.PI * r;
  let offset = 0;

  const active = hover !== null ? data[hover] : null;
  const centerTop = active ? niceCompact(active.value) + unit : niceCompact(total) + unit;
  const centerBottom = active ? active.label : "всего";

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 200 200" style={{ width: size, height: size }} className="shrink-0">
        <g transform="rotate(-90 100 100)">
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = frac * c;
            const seg = (
              <circle
                key={d.key}
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke={SLICE_PALETTE[i % SLICE_PALETTE.length]}
                strokeWidth={hover === i ? 30 : 24}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                opacity={hover === null || hover === i ? 1 : 0.45}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ transition: "stroke-width .12s, opacity .12s", cursor: "pointer" }}
              />
            );
            offset += dash;
            return seg;
          })}
        </g>
        <text x="100" y="96" textAnchor="middle" className="fill-[var(--foreground)]" style={{ fontSize: 27, fontWeight: 700 }}>
          {centerTop}
        </text>
        <text x="100" y="118" textAnchor="middle" className="fill-[var(--muted-foreground)]" style={{ fontSize: 11 }}>
          {centerBottom}
        </text>
      </svg>
      <ul className="min-w-[160px] flex-1 space-y-2">
        {data.map((d, i) => {
          const pct = Math.round((d.value / total) * 100);
          return (
            <li
              key={d.key}
              className="flex items-center gap-2 text-sm"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: SLICE_PALETTE[i % SLICE_PALETTE.length] }} />
              <span className="flex-1 text-[var(--muted-foreground)]">{d.label}</span>
              <span className="font-semibold tabular-nums text-[var(--foreground)]">{niceNum(d.value)}</span>
              <span className="w-10 text-right tabular-nums text-[var(--muted-foreground)]">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Horizontal bar list                                                 */
/* ------------------------------------------------------------------ */

export function HBarList({
  data,
  color = "var(--primary)",
  format = niceNum,
}: {
  data: { key: string; label: string; value: number; sub?: string }[];
  color?: string;
  format?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.key} className="group">
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-[var(--foreground)]">{d.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-[var(--foreground)]">
              {format(d.value)}
              {d.sub && <span className="ml-1 font-normal text-[var(--muted-foreground)]">{d.sub}</span>}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(d.value / max) * 100}%`, background: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
