"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
      <div className="rounded-lg border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-8 text-center text-sm text-white/45">
        Add height, weight, and age to unlock calorie, protein, BMI, and hydration
        baseline charts.
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
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Calorie trend (baseline)" hint="Goal-adjusted vs maintenance TDEE">
        <div className="h-52 w-full sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calorieRows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" />
              <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
              <YAxis {...CHART_AXIS} tickLine={false} width={44} />
              <Tooltip
                {...CHART_TOOLTIP}
                formatter={(value: unknown) => [`${value ?? "—"} kcal`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }} />
              <Line
                type="monotone"
                dataKey="goalAdjusted"
                name="Goal-adjusted"
                stroke={NEON}
                strokeWidth={2}
                dot={{ r: 2, fill: NEON }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="maintenance"
                name="Maintenance"
                stroke={MUTED_LINE}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Hydration target (daily)" hint="Weight-based ml/day — flat baseline">
        <div className="h-52 w-full sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hydrationRows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
              <YAxis {...CHART_AXIS} tickLine={false} width={44} />
              <Tooltip
                {...CHART_TOOLTIP}
                formatter={(value: unknown) => [`${value ?? "—"} ml`, "Target"]}
              />
              <Bar dataKey="targetMl" name="Target ml" fill={NEON} radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Protein consistency (planning)" hint="Stable target when profile is steady">
        <div className="h-52 w-full sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={proteinRows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" />
              <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
              <YAxis {...CHART_AXIS} tickLine={false} width={44} />
              <Tooltip
                {...CHART_TOOLTIP}
                formatter={(value: unknown) => [`${value ?? "—"} g`, ""]}
              />
              <Line
                type="monotone"
                dataKey="proteinG"
                name="Protein target"
                stroke={NEON}
                strokeWidth={2}
                dot={{ r: 2, fill: NEON }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="BMI snapshot" hint="Updates when weight/height change in profile">
        <div className="h-52 w-full sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bmiRows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" />
              <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
              <YAxis {...CHART_AXIS} tickLine={false} width={44} domain={["auto", "auto"]} />
              <Tooltip
                {...CHART_TOOLTIP}
                formatter={(value: unknown) => [
                  typeof value === "number" ? String(value) : "—",
                  "BMI",
                ]}
              />
              <Line
                type="monotone"
                dataKey="bmi"
                name="BMI"
                stroke={NEON}
                strokeWidth={2}
                dot={{ r: 2, fill: NEON }}
                connectNulls
              />
            </LineChart>
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
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="mb-2">
        <p className="text-xs font-black text-white">{title}</p>
        <p className="mt-0.5 text-[10px] text-white/35">{hint}</p>
      </div>
      {children}
    </div>
  );
}
