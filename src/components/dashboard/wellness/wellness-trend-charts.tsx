"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WellnessTrendPoint } from "@/lib/wellness/types";

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(8,8,12,0.92)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 11,
};

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

export function WellnessTrendCharts({
  hydration,
  sleep,
  recovery,
  energy,
}: {
  hydration: WellnessTrendPoint[];
  sleep: WellnessTrendPoint[];
  recovery: WellnessTrendPoint[];
  energy: WellnessTrendPoint[];
}) {
  const charts = [
    { title: "Hydration", data: hydration, color: "#39FF14", unit: "ml" },
    { title: "Sleep", data: sleep, color: "#60a5fa", unit: "h" },
    { title: "Recovery", data: recovery, color: "#f472b6", unit: "%" },
    { title: "Energy", data: energy, color: "#fbbf24", unit: "%" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {charts.map(({ title, data, color, unit }) => (
        <div
          key={title}
          className="rounded-lg border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-4"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{title}</p>
          <div className="mt-3 h-32">
            {data.length === 0 ? (
              <p className="flex h-full items-center justify-center text-xs text-white/30">
                No trend data yet
              </p>
            ) : title === "Hydration" ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v) => [`${Number(v ?? 0)} ${unit}`, title]}
                    labelFormatter={(label) => formatDate(String(label ?? ""))}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    fill={`url(#grad-${title})`}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v) => [`${Number(v ?? 0)}${unit === "h" ? "h" : "%"}`, title]}
                    labelFormatter={(label) => formatDate(String(label ?? ""))}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 2, fill: color }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
