"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklyAnalyticsModel } from "@/lib/weekly-analytics/types";
import { CHART_AXIS, CHART_GRID, CHART_TOOLTIP, MUTED_LINE, NEON } from "./chart-styles";

type Props = {
  model: WeeklyAnalyticsModel;
  hasTargets: boolean;
};

export function WeeklyTrendCharts({ model, hasTargets }: Props) {
  if (!hasTargets) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.01] px-6 py-12 text-center shadow-lg backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.03] text-lg text-white/50">
          📊
        </div>
        <p className="text-sm font-semibold text-white/80">Metrics baseline locked</p>
        <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-white/40">
          Complete your profile by adding height, weight, and age in your profile settings to unlock personalized calories, protein, BMI, and hydration charts.
        </p>
      </div>
    );
  }

  const calorieRows = model.days.map((d) => ({
    label: d.label,
    goalAdjusted: d.calorieTarget,
    maintenance: d.maintenanceCalories,
  }));

  const hydrationRows = model.days.map((d) => ({
    label: d.label,
    targetMl: d.hydrationTargetMl,
  }));

  const proteinRows = model.days.map((d) => ({
    label: d.label,
    proteinG: d.proteinTargetG,
  }));

  const bmiRows = model.days.map((d) => ({
    label: d.label,
    bmi: d.bmi != null ? Math.round(d.bmi * 10) / 10 : null,
  }));

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <ChartCard title="Calorie trend (baseline)" hint="Goal-adjusted vs maintenance TDEE">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={calorieRows} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCalorieGoal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={NEON} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={NEON} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...CHART_GRID} />
              <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
              <YAxis {...CHART_AXIS} tickLine={false} width={44} />
              <Tooltip
                {...CHART_TOOLTIP}
                formatter={(value: unknown) => [`${value ?? "—"} kcal`, ""]}
              />
              <Legend 
                wrapperStyle={{ 
                  fontSize: "10px", 
                  paddingTop: "12px",
                  color: "rgba(255,255,255,0.4)" 
                }} 
              />
              <Area
                type="monotone"
                dataKey="goalAdjusted"
                name="Goal-adjusted"
                stroke={NEON}
                strokeWidth={2}
                fill="url(#colorCalorieGoal)"
                activeDot={{ r: 5, stroke: "#0f0f14", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="maintenance"
                name="Maintenance"
                stroke={MUTED_LINE}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Hydration target (daily)" hint="Weight-based ml/day — flat baseline">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hydrationRows} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHydration" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0.15} />
                </linearGradient>
              </defs>
              <CartesianGrid {...CHART_GRID} vertical={false} />
              <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
              <YAxis {...CHART_AXIS} tickLine={false} width={44} />
              <Tooltip
                {...CHART_TOOLTIP}
                formatter={(value: unknown) => [`${value ?? "—"} ml`, "Target"]}
              />
              <Bar 
                dataKey="targetMl" 
                name="Target ml" 
                fill="url(#colorHydration)" 
                radius={[6, 6, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Protein consistency (planning)" hint="Stable target when profile is steady">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={proteinRows} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...CHART_GRID} />
              <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
              <YAxis {...CHART_AXIS} tickLine={false} width={44} />
              <Tooltip
                {...CHART_TOOLTIP}
                formatter={(value: unknown) => [`${value ?? "—"} g`, ""]}
              />
              <Area
                type="monotone"
                dataKey="proteinG"
                name="Protein target"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#colorProtein)"
                activeDot={{ r: 5, stroke: "#0f0f14", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="BMI snapshot" hint="Updates when weight/height change in profile">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={bmiRows} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...CHART_GRID} />
              <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
              <YAxis {...CHART_AXIS} tickLine={false} width={44} domain={["auto", "auto"]} />
              <Tooltip
                {...CHART_TOOLTIP}
                formatter={(value: unknown) => [
                  typeof value === "number" ? String(value) : "—",
                  "BMI",
                ]}
              />
              <Area
                type="monotone"
                dataKey="bmi"
                name="BMI"
                stroke="#F59E0B"
                strokeWidth={2}
                fill="url(#colorBmi)"
                activeDot={{ r: 5, stroke: "#0f0f14", strokeWidth: 2 }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-md p-5 shadow-xl transition-all duration-300 hover:border-white/[0.12] hover:bg-gradient-to-br hover:from-white/[0.07] hover:to-white/[0.02]">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-white/80">{title}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-white/40">{hint}</p>
      </div>
      {children}
    </div>
  );
}

