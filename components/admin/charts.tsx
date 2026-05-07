"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/* ---------- Shared types ---------- */

export interface SeriesPoint {
  label: string; // x-axis label (e.g. "Jan 12")
  value: number;
}

export interface MultiSeries {
  name: string;
  color: string; // tailwind hex or var
  data: SeriesPoint[];
}

/* ---------- Helpers ---------- */

function niceMax(n: number): number {
  if (n <= 0) return 10;
  const exp = Math.pow(10, Math.floor(Math.log10(n)));
  const f = n / exp;
  let nf: number;
  if (f <= 1) nf = 1;
  else if (f <= 2) nf = 2;
  else if (f <= 5) nf = 5;
  else nf = 10;
  return nf * exp;
}

/* ---------- Line / Area Chart ---------- */

interface LineChartProps {
  series: MultiSeries[];
  height?: number;
  area?: boolean;
  yTicks?: number;
  className?: string;
}

export function LineChart({
  series,
  height = 240,
  area = false,
  yTicks = 4,
  className,
}: LineChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  const { padding, innerW, innerH, max, points, xLabels } = useMemo(() => {
    const width = 800;
    const padding = { top: 16, right: 16, bottom: 28, left: 40 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const allValues = series.flatMap((s) => s.data.map((d) => d.value));
    const max = niceMax(Math.max(1, ...allValues));
    const len = series[0]?.data.length || 0;
    const xStep = len > 1 ? innerW / (len - 1) : 0;

    const points = series.map((s) =>
      s.data.map((d, i) => ({
        x: padding.left + i * xStep,
        y: padding.top + innerH - (d.value / max) * innerH,
        v: d.value,
        label: d.label,
      }))
    );
    const xLabels = series[0]?.data.map((d) => d.label) || [];
    return { padding, innerW, innerH, max, points, xLabels };
  }, [series, height]);

  const len = xLabels.length;
  const labelStride = Math.max(1, Math.ceil(len / 8));

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 800 ${height}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          {series.map((s, i) => (
            <linearGradient
              key={i}
              id={`area-grad-${i}-${s.name.replace(/\s/g, "")}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Y grid */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const y = padding.top + (innerH * i) / yTicks;
          const v = Math.round(max - (max * i) / yTicks);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={800 - padding.right}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize="10"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {xLabels.map((lbl, i) => {
          if (i % labelStride !== 0 && i !== len - 1) return null;
          const x =
            padding.left + (len > 1 ? (innerW * i) / (len - 1) : innerW / 2);
          return (
            <text
              key={i}
              x={x}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="10"
            >
              {lbl}
            </text>
          );
        })}

        {/* Areas */}
        {area &&
          points.map((pts, i) => {
            const d =
              `M ${pts[0]?.x ?? 0} ${padding.top + innerH} ` +
              pts.map((p) => `L ${p.x} ${p.y}`).join(" ") +
              ` L ${pts[pts.length - 1]?.x ?? 0} ${padding.top + innerH} Z`;
            return (
              <path
                key={`a-${i}`}
                d={d}
                fill={`url(#area-grad-${i}-${series[i].name.replace(/\s/g, "")})`}
              />
            );
          })}

        {/* Lines */}
        {points.map((pts, i) => {
          const d = pts.map((p, j) => (j === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
          return (
            <path
              key={`l-${i}`}
              d={d}
              fill="none"
              stroke={series[i].color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Hover overlay columns */}
        {Array.from({ length: len }).map((_, i) => {
          const x =
            padding.left + (len > 1 ? (innerW * i) / (len - 1) : innerW / 2);
          const colW = len > 1 ? innerW / (len - 1) : innerW;
          return (
            <rect
              key={i}
              x={x - colW / 2}
              y={padding.top}
              width={colW}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          );
        })}

        {/* Hover indicator */}
        {hover !== null && (
          <g>
            <line
              x1={points[0]?.[hover]?.x}
              x2={points[0]?.[hover]?.x}
              y1={padding.top}
              y2={padding.top + innerH}
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeDasharray="2 2"
            />
            {points.map((pts, i) => (
              <circle
                key={i}
                cx={pts[hover]?.x}
                cy={pts[hover]?.y}
                r="4"
                fill={series[i].color}
                stroke="white"
                strokeWidth="2"
              />
            ))}
          </g>
        )}
      </svg>

      {/* Tooltip + Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.name}
            </div>
          ))}
        </div>
        {hover !== null && (
          <div className="rounded-md border bg-popover px-3 py-1.5 text-xs shadow-sm">
            <span className="font-medium">{xLabels[hover]}</span>
            {series.map((s) => (
              <span key={s.name} className="ml-3 text-muted-foreground">
                <span
                  className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
                  style={{ backgroundColor: s.color }}
                />
                {s.name}: <span className="font-medium text-foreground">{s.data[hover]?.value ?? 0}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Bar Chart ---------- */

interface BarChartProps {
  data: SeriesPoint[];
  height?: number;
  color?: string;
  className?: string;
}

export function BarChart({
  data,
  height = 220,
  color = "var(--primary)",
  className,
}: BarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 800;
  const padding = { top: 16, right: 12, bottom: 28, left: 40 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = niceMax(Math.max(1, ...data.map((d) => d.value)));
  const barW = (innerW / Math.max(1, data.length)) * 0.7;
  const gap = (innerW / Math.max(1, data.length)) * 0.3;
  const labelStride = Math.max(1, Math.ceil(data.length / 10));

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onMouseLeave={() => setHover(null)}
      >
        {/* Grid */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding.top + (innerH * i) / 4;
          const v = Math.round(max - (max * i) / 4);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize="10"
              >
                {v}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const h = (d.value / max) * innerH;
          const x = padding.left + i * (barW + gap) + gap / 2;
          const y = padding.top + innerH - h;
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx="3"
                fill={color}
                opacity={hover === null || hover === i ? 1 : 0.5}
                style={{ transition: "opacity 0.15s" }}
              />
              {(i % labelStride === 0 || i === data.length - 1) && (
                <text
                  x={x + barW / 2}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize="10"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hover !== null && (
        <div className="mt-2 inline-flex rounded-md border bg-popover px-3 py-1.5 text-xs shadow-sm">
          <span className="font-medium">{data[hover].label}</span>
          <span className="ml-3 text-muted-foreground">
            Value: <span className="font-medium text-foreground">{data[hover].value}</span>
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------- Pie / Donut Chart ---------- */

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  className?: string;
}

export function DonutChart({ data, size = 200, className }: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = size / 2;
  const inner = radius * 0.62;
  const cx = radius;
  const cy = radius;

  // Build segments without mutation: precompute running totals first.
  const runningTotals = data.reduce<number[]>((acc, d, i) => {
    acc.push((acc[i - 1] ?? 0) + d.value);
    return acc;
  }, []);

  const segments = data.map((d, i) => {
    const startVal = runningTotals[i - 1] ?? 0;
    const endVal = runningTotals[i];
    const start = (startVal / total) * Math.PI * 2 - Math.PI / 2;
    const end = (endVal / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;

    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);

    const xi1 = cx + inner * Math.cos(end);
    const yi1 = cy + inner * Math.sin(end);
    const xi2 = cx + inner * Math.cos(start);
    const yi2 = cy + inner * Math.sin(start);

    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`,
      `L ${xi1} ${yi1}`,
      `A ${inner} ${inner} 0 ${large} 0 ${xi2} ${yi2}`,
      "Z",
    ].join(" ");
    return { ...d, path, pct: (d.value / total) * 100 };
  });

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((s, i) => (
          <path key={i} d={s.path} fill={s.color}>
            <title>{`${s.label}: ${s.value} (${s.pct.toFixed(1)}%)`}</title>
          </path>
        ))}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="fill-foreground"
          fontSize="22"
          fontWeight="600"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="10"
        >
          Total
        </text>
      </svg>
      <div className="flex-1 space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-muted-foreground">{s.label}</span>
            </div>
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="font-medium">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.pct.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Sparkline ---------- */

export function Sparkline({
  data,
  color = "currentColor",
  height = 32,
  width = 100,
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : 0;
  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
