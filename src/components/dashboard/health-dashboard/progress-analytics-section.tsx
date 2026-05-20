"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, BarChart3, Droplets, Flame, Loader2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildNutritionTargets } from "@/lib/meal-recommendations/nutrition-from-metrics";
import type { Database } from "@/lib/supabase/types";
import { createClient } from "@/utils/supabase/client";
import { CHART_AXIS, CHART_GRID, CHART_TOOLTIP, MUTED_LINE, NEON } from "./analytics/chart-styles";

type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];
type FoodLog = Database["public"]["Tables"]["food_logs"]["Row"];
type HydrationLog = Database["public"]["Tables"]["hydration_logs"]["Row"];

type Props = {
  metrics: MetricsRow | null;
};

type AnalyticsMode = 7 | 30;

type DayRow = {
  dateKey: string;
  label: string;
  calories: number;
  proteinG: number;
  waterMl: number;
  calorieTarget: number | null;
  proteinTargetG: number | null;
  waterTargetMl: number | null;
};

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysAgoKey(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function labelForDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function buildRows(args: {
  foodLogs: FoodLog[];
  hydrationLogs: HydrationLog[];
  metrics: MetricsRow | null;
}) {
  const targets = buildNutritionTargets(args.metrics);
  const byDate = new Map<string, { calories: number; proteinG: number; waterMl: number }>();

  for (const log of args.foodLogs) {
    const row = byDate.get(log.logged_on) ?? { calories: 0, proteinG: 0, waterMl: 0 };
    row.calories += log.calories;
    row.proteinG += Number(log.protein_g);
    byDate.set(log.logged_on, row);
  }

  for (const log of args.hydrationLogs) {
    const row = byDate.get(log.logged_on) ?? { calories: 0, proteinG: 0, waterMl: 0 };
    row.waterMl = log.water_ml;
    byDate.set(log.logged_on, row);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, row]): DayRow => ({
      dateKey,
      label: labelForDate(dateKey),
      calories: row.calories,
      proteinG: round1(row.proteinG),
      waterMl: row.waterMl,
      calorieTarget: targets.dailyCalories,
      proteinTargetG: targets.dailyProteinG,
      waterTargetMl: targets.hydrationMl,
    }));
}

function adherencePercent(rows: DayRow[]) {
  const meaningful = rows.filter(
    (row) => row.calories > 0 || row.proteinG > 0 || row.waterMl > 0,
  );
  if (meaningful.length === 0) return null;

  const scores = meaningful.map((row) => {
    let checks = 0;
    let passed = 0;

    if (row.calorieTarget && row.calories > 0) {
      checks += 1;
      if (row.calories >= row.calorieTarget * 0.8 && row.calories <= row.calorieTarget * 1.12) {
        passed += 1;
      }
    }
    if (row.proteinTargetG && row.proteinG > 0) {
      checks += 1;
      if (row.proteinG >= row.proteinTargetG * 0.7) passed += 1;
    }
    if (row.waterTargetMl && row.waterMl > 0) {
      checks += 1;
      if (row.waterMl >= row.waterTargetMl * 0.7) passed += 1;
    }

    return checks > 0 ? passed / checks : 0;
  });

  return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100);
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
            {label}
          </p>
          <p className="mt-3 text-2xl font-black tabular-nums text-white">{value}</p>
          <p className="mt-1 text-xs text-white/38">{detail}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
          <Icon className="h-5 w-5" />
        </div>
      </div>
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
  children: React.ReactNode;
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

function LoadingState() {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-lg border border-white/[0.07] bg-white/[0.03] p-4"
        >
          <div className="h-3 w-32 rounded bg-white/[0.08]" />
          <div className="mt-8 h-40 rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

export function ProgressAnalyticsSection({ metrics }: Props) {
  const [mode, setMode] = useState<AnalyticsMode>(7);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [hydrationLogs, setHydrationLogs] = useState<HydrationLog[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const targets = useMemo(() => buildNutritionTargets(metrics), [metrics]);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoadState("loading");
      setError(null);
      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error("Sign in again to load progress analytics.");

      const start = daysAgoKey(mode - 1);
      const end = todayKey();
      const [{ data: food, error: foodErr }, { data: hydration, error: hydrationErr }] =
        await Promise.all([
          supabase
            .from("food_logs")
            .select("*")
            .eq("user_id", user.id)
            .gte("logged_on", start)
            .lte("logged_on", end)
            .order("logged_on", { ascending: true }),
          supabase
            .from("hydration_logs")
            .select("*")
            .eq("user_id", user.id)
            .gte("logged_on", start)
            .lte("logged_on", end)
            .order("logged_on", { ascending: true }),
        ]);

      if (foodErr) throw foodErr;
      if (hydrationErr) throw hydrationErr;
      setFoodLogs(food ?? []);
      setHydrationLogs(hydration ?? []);
      setLoadState("ready");
    } catch (e) {
      console.error("Progress analytics database error", e);
      setError(e instanceof Error ? e.message : "Progress analytics could not load.");
      setLoadState("error");
    }
  }, [mode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAnalytics();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAnalytics]);

  useEffect(() => {
    const handleChanged = () => {
      void loadAnalytics();
    };

    window.addEventListener("food-log:changed", handleChanged);
    window.addEventListener("hydration-log:changed", handleChanged);
    return () => {
      window.removeEventListener("food-log:changed", handleChanged);
      window.removeEventListener("hydration-log:changed", handleChanged);
    };
  }, [loadAnalytics]);

  const rows = useMemo(
    () => buildRows({ foodLogs, hydrationLogs, metrics }),
    [foodLogs, hydrationLogs, metrics],
  );
  const todayRow = rows.find((row) => row.dateKey === todayKey()) ?? rows[rows.length - 1];
  const adherence = useMemo(() => adherencePercent(rows), [rows]);
  const hasChartData = rows.length > 0;

  return (
    <section className="glass rounded-lg border border-white/[0.08] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
                Progress analytics
              </p>
              <h3 className="mt-2 text-xl font-black text-white">Real tracked trends</h3>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/52">
            Charts use only saved food logs, hydration logs, and current profile targets.
            Missing days stay missing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.04] p-1">
            {[7, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setMode(days as AnalyticsMode)}
                className={
                  mode === days
                    ? "h-8 rounded-md bg-brand-neon px-3 text-xs font-black text-black"
                    : "h-8 rounded-md px-3 text-xs font-bold text-white/52 hover:bg-white/[0.06] hover:text-white"
                }
              >
                {days} days
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-10 shrink-0"
            disabled={loadState === "loading"}
            onClick={loadAnalytics}
          >
            {loadState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Refresh
          </Button>
        </div>
      </div>

      {loadState === "loading" ? (
        <LoadingState />
      ) : loadState === "error" ? (
        <div className="mt-6 rounded-lg border border-red-300/15 bg-red-400/[0.06] p-4">
          <p className="text-sm font-semibold text-red-100">
            {error ?? "Progress analytics could not load."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Tracked days"
              value={`${rows.length}`}
              detail={`Actual days in the last ${mode} days`}
              icon={Activity}
            />
            <SummaryCard
              label="Calories"
              value={`${todayRow?.calories ?? 0}`}
              detail={
                targets.dailyCalories != null
                  ? `Target ${targets.dailyCalories} kcal`
                  : "Complete profile for target"
              }
              icon={Flame}
            />
            <SummaryCard
              label="Protein"
              value={`${todayRow?.proteinG ? round1(todayRow.proteinG) : 0} g`}
              detail={
                targets.dailyProteinG != null
                  ? `Target ${targets.dailyProteinG} g`
                  : "Complete profile for target"
              }
              icon={Scale}
            />
            <SummaryCard
              label="Adherence"
              value={adherence == null ? "-" : `${adherence}%`}
              detail="Only from days with saved logs"
              icon={Droplets}
            />
          </div>

          {!hasChartData ? (
            <div className="rounded-lg border border-dashed border-white/[0.14] bg-white/[0.02] px-5 py-10 text-center">
              <p className="text-base font-black text-white">Not enough data yet</p>
              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/45">
                Add a food entry or hydration entry. Once a real row exists in Supabase,
                it will appear here after refresh.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard title="Calorie intake" hint="Only dates with saved food logs">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
                      <YAxis {...CHART_AXIS} tickLine={false} width={44} />
                      <Tooltip {...CHART_TOOLTIP} formatter={(value: unknown) => [`${value ?? 0} kcal`, "Calories"]} />
                      <Bar dataKey="calories" fill={NEON} radius={[4, 4, 0, 0]} opacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Protein intake" hint="Only dates with saved protein values">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" />
                      <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
                      <YAxis {...CHART_AXIS} tickLine={false} width={44} />
                      <Tooltip {...CHART_TOOLTIP} formatter={(value: unknown) => [`${value ?? 0} g`, "Protein"]} />
                      <Line type="monotone" dataKey="proteinG" stroke={NEON} strokeWidth={2} dot={{ r: 2, fill: NEON }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Hydration" hint="Only dates with saved hydration logs">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
                      <YAxis {...CHART_AXIS} tickLine={false} width={44} />
                      <Tooltip {...CHART_TOOLTIP} formatter={(value: unknown) => [`${value ?? 0} ml`, "Water"]} />
                      <Bar dataKey="waterMl" fill={MUTED_LINE} radius={[4, 4, 0, 0]} opacity={0.9} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Daily target match" hint="Calculated from actual logged days">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={rows.map((row) => ({
                        label: row.label,
                        adherence: adherencePercent([row]) ?? 0,
                      }))}
                      margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                    >
                      <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
                      <YAxis {...CHART_AXIS} tickLine={false} width={44} domain={[0, 100]} />
                      <Tooltip {...CHART_TOOLTIP} formatter={(value: unknown) => [`${value ?? 0}%`, "Match"]} />
                      <Bar dataKey="adherence" fill={NEON} radius={[4, 4, 0, 0]} opacity={0.75} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
