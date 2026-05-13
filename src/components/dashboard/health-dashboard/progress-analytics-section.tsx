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
import {
  CHART_AXIS,
  CHART_GRID,
  CHART_TOOLTIP,
  MUTED_LINE,
  NEON,
} from "./analytics/chart-styles";

type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];
type FoodEntry = Database["public"]["Tables"]["food_entries"]["Row"];
type ProgressLog = Database["public"]["Tables"]["daily_progress_logs"]["Row"];
type AnalyticsMode = 7 | 30;

type Props = {
  metrics: MetricsRow | null;
};

type DayRow = {
  dateKey: string;
  label: string;
  calories: number;
  proteinG: number;
  waterMl: number;
  weightKg: number | null;
  bmi: number | null;
  calorieTarget: number | null;
  proteinTargetG: number | null;
  waterTargetMl: number | null;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dateKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dayKeys(count: number, now = new Date()) {
  const today = startOfDay(now);
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(dateKey(d));
  }
  return out;
}

function labelForDate(key: string, mode: AnalyticsMode) {
  const d = parseDateKey(key);
  if (mode === 7) {
    return d.toLocaleDateString(undefined, { weekday: "short" });
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function bmiFromMetrics(metrics: MetricsRow | null) {
  const weight = metrics?.weight ?? null;
  const height = metrics?.height ?? null;
  if (weight == null || height == null || weight <= 0 || height <= 0) return null;
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

function aggregateFood(entries: FoodEntry[]) {
  const byDate = new Map<string, { calories: number; proteinG: number }>();
  for (const entry of entries) {
    const current = byDate.get(entry.logged_on) ?? { calories: 0, proteinG: 0 };
    current.calories += entry.calories;
    current.proteinG += Number(entry.protein_g);
    byDate.set(entry.logged_on, current);
  }
  return byDate;
}

function buildRows(args: {
  mode: AnalyticsMode;
  metrics: MetricsRow | null;
  foodEntries: FoodEntry[];
  progressLogs: ProgressLog[];
}) {
  const targets = buildNutritionTargets(args.metrics);
  const foodByDate = aggregateFood(args.foodEntries);
  const progressByDate = new Map(args.progressLogs.map((log) => [log.logged_on, log]));

  return dayKeys(args.mode).map((key): DayRow => {
    const food = foodByDate.get(key);
    const progress = progressByDate.get(key);
    return {
      dateKey: key,
      label: labelForDate(key, args.mode),
      calories: food?.calories ?? 0,
      proteinG: food?.proteinG ?? 0,
      waterMl: progress?.water_ml ?? 0,
      weightKg: progress?.weight_kg ?? null,
      bmi: progress?.bmi ?? null,
      calorieTarget: targets.dailyCalories,
      proteinTargetG: targets.dailyProteinG,
      waterTargetMl: targets.hydrationMl,
    };
  });
}

function adherencePercent(rows: DayRow[]) {
  const trackable = rows.filter((row) => row.calorieTarget || row.proteinTargetG || row.waterTargetMl);
  if (trackable.length === 0) return null;

  const scores = trackable.map((row) => {
    let checks = 0;
    let passed = 0;

    if (row.calorieTarget) {
      checks += 1;
      const lower = row.calorieTarget * 0.8;
      const upper = row.calorieTarget * 1.1;
      if (row.calories >= lower && row.calories <= upper) passed += 1;
    }
    if (row.proteinTargetG) {
      checks += 1;
      if (row.proteinG >= row.proteinTargetG * 0.7) passed += 1;
    }
    if (row.waterTargetMl) {
      checks += 1;
      if (row.waterMl >= row.waterTargetMl * 0.7) passed += 1;
    }

    return checks > 0 ? passed / checks : 0;
  });

  return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100);
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
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [waterBusy, setWaterBusy] = useState(false);

  const today = useMemo(() => dateKey(new Date()), []);
  const targets = useMemo(() => buildNutritionTargets(metrics), [metrics]);
  const currentBmi = useMemo(() => bmiFromMetrics(metrics), [metrics]);
  const currentWeight = metrics?.weight ?? null;

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

      const keys = dayKeys(30);
      const start = keys[0];
      const end = keys[keys.length - 1];

      const [{ data: food, error: foodErr }, { data: progress, error: progressErr }] =
        await Promise.all([
          supabase
            .from("food_entries")
            .select("*")
            .eq("user_id", user.id)
            .gte("logged_on", start)
            .lte("logged_on", end),
          supabase
            .from("daily_progress_logs")
            .select("*")
            .eq("user_id", user.id)
            .gte("logged_on", start)
            .lte("logged_on", end)
            .order("logged_on", { ascending: true }),
        ]);

      if (foodErr) throw foodErr;
      if (progressErr) throw progressErr;

      const todayLog = (progress ?? []).find((log) => log.logged_on === today);
      const snapshot = {
        user_id: user.id,
        logged_on: today,
        weight_kg: currentWeight,
        bmi: currentBmi != null ? round1(currentBmi) : null,
        water_ml: todayLog?.water_ml ?? 0,
      };

      const { data: savedToday, error: snapshotErr } = await supabase
        .from("daily_progress_logs")
        .upsert(snapshot, { onConflict: "user_id,logged_on" })
        .select("*")
        .single();

      if (snapshotErr) throw snapshotErr;

      const mergedProgress = [
        ...(progress ?? []).filter((log) => log.logged_on !== today),
        savedToday,
      ].sort((a, b) => a.logged_on.localeCompare(b.logged_on));

      setFoodEntries(food ?? []);
      setProgressLogs(mergedProgress);
      setLoadState("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Progress analytics could not load.");
      setLoadState("error");
    }
  }, [currentBmi, currentWeight, today]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAnalytics();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAnalytics]);

  const rows = useMemo(
    () => buildRows({ mode, metrics, foodEntries, progressLogs }),
    [foodEntries, metrics, mode, progressLogs],
  );

  const todayRow = rows[rows.length - 1];
  const adherence = useMemo(() => adherencePercent(rows), [rows]);
  const populatedDays = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.calories > 0 ||
          row.proteinG > 0 ||
          row.waterMl > 0 ||
          row.weightKg != null ||
          row.bmi != null,
      ).length,
    [rows],
  );

  const chartRows = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        weightKg: row.weightKg != null ? round1(row.weightKg) : null,
        bmi: row.bmi != null ? round1(row.bmi) : null,
        proteinG: round1(row.proteinG),
      })),
    [rows],
  );

  const saveWater = useCallback(
    async (nextWaterMl: number) => {
      try {
        setWaterBusy(true);
        setError(null);
        const supabase = createClient();
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        if (!user) throw new Error("Sign in again to update water intake.");

        const { data, error: saveErr } = await supabase
          .from("daily_progress_logs")
          .upsert(
            {
              user_id: user.id,
              logged_on: today,
              weight_kg: currentWeight,
              bmi: currentBmi != null ? round1(currentBmi) : null,
              water_ml: Math.max(0, nextWaterMl),
            },
            { onConflict: "user_id,logged_on" },
          )
          .select("*")
          .single();

        if (saveErr) throw saveErr;
        setProgressLogs((current) => [
          ...current.filter((log) => log.logged_on !== today),
          data,
        ].sort((a, b) => a.logged_on.localeCompare(b.logged_on)));
        setLoadState("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Water intake could not be saved.");
      } finally {
        setWaterBusy(false);
      }
    },
    [currentBmi, currentWeight, today],
  );

  const hasChartData = populatedDays > 0;
  const todayWater = todayRow?.waterMl ?? 0;

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
              <h3 className="mt-2 text-xl font-black text-white">
                Long-term health trends
              </h3>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/52">
            Visual progress from your profile metrics, Supabase food log, and daily
            water snapshots.
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
          {error ? (
            <div className="rounded-lg border border-red-300/15 bg-red-400/[0.06] px-4 py-3 text-sm font-semibold text-red-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Adherence"
              value={adherence == null ? "-" : `${adherence}%`}
              detail={`${mode}-day target consistency`}
              icon={Activity}
            />
            <SummaryCard
              label="Calories"
              value={`${todayRow?.calories ?? 0}`}
              detail={
                targets.dailyCalories != null
                  ? `${Math.max(0, targets.dailyCalories - (todayRow?.calories ?? 0))} kcal remaining today`
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
              label="Water"
              value={`${todayWater} ml`}
              detail={
                targets.hydrationMl != null
                  ? `Target ${targets.hydrationMl} ml`
                  : "Complete profile for target"
              }
              icon={Droplets}
            />
          </div>

          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black text-white">Water intake</p>
                <p className="mt-0.5 text-[10px] text-white/35">
                  Saved to Supabase for the trend chart.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 px-3 text-xs"
                  isLoading={waterBusy}
                  onClick={() => saveWater(todayWater + 250)}
                >
                  +250 ml
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 px-3 text-xs"
                  disabled={waterBusy}
                  onClick={() => saveWater(Math.max(0, todayWater - 250))}
                >
                  -250 ml
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 px-3 text-xs"
                  disabled={waterBusy}
                  onClick={() => saveWater(0)}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {!hasChartData ? (
            <div className="rounded-lg border border-dashed border-white/[0.14] bg-white/[0.02] px-5 py-10 text-center">
              <p className="text-base font-black text-white">
                No progress data yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/45">
                Log food, update profile metrics, or save water intake to start filling
                these charts.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard title="Weight progress" hint="Daily weight snapshots from profile metrics">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartRows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" />
                      <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
                      <YAxis {...CHART_AXIS} tickLine={false} width={44} domain={["auto", "auto"]} />
                      <Tooltip
                        {...CHART_TOOLTIP}
                        formatter={(value: unknown) => [
                          typeof value === "number" ? `${value} kg` : "-",
                          "Weight",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="weightKg"
                        stroke={NEON}
                        strokeWidth={2}
                        dot={{ r: 2, fill: NEON }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Calorie intake trend" hint="Daily consumed calories from food log">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartRows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
                      <YAxis {...CHART_AXIS} tickLine={false} width={44} />
                      <Tooltip
                        {...CHART_TOOLTIP}
                        formatter={(value: unknown) => [`${value ?? 0} kcal`, "Calories"]}
                      />
                      <Bar dataKey="calories" fill={NEON} radius={[4, 4, 0, 0]} opacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Protein intake trend" hint="Daily consumed protein from food log">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartRows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" />
                      <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
                      <YAxis {...CHART_AXIS} tickLine={false} width={44} />
                      <Tooltip
                        {...CHART_TOOLTIP}
                        formatter={(value: unknown) => [`${value ?? 0} g`, "Protein"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="proteinG"
                        stroke={NEON}
                        strokeWidth={2}
                        dot={{ r: 2, fill: NEON }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Water intake trend" hint="Daily water ml saved in progress logs">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartRows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
                      <YAxis {...CHART_AXIS} tickLine={false} width={44} />
                      <Tooltip
                        {...CHART_TOOLTIP}
                        formatter={(value: unknown) => [`${value ?? 0} ml`, "Water"]}
                      />
                      <Bar dataKey="waterMl" fill={MUTED_LINE} radius={[4, 4, 0, 0]} opacity={0.9} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="BMI trend" hint="Computed from saved weight and current height">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartRows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" />
                      <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
                      <YAxis {...CHART_AXIS} tickLine={false} width={44} domain={["auto", "auto"]} />
                      <Tooltip
                        {...CHART_TOOLTIP}
                        formatter={(value: unknown) => [
                          typeof value === "number" ? String(value) : "-",
                          "BMI",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="bmi"
                        stroke={NEON}
                        strokeWidth={2}
                        dot={{ r: 2, fill: NEON }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Adherence by day" hint="Calories, protein, and water target checks">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartRows.map((row) => ({
                        label: row.label,
                        adherence: adherencePercent([row]) ?? 0,
                      }))}
                      margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                    >
                      <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
                      <YAxis {...CHART_AXIS} tickLine={false} width={44} domain={[0, 100]} />
                      <Tooltip
                        {...CHART_TOOLTIP}
                        formatter={(value: unknown) => [`${value ?? 0}%`, "Adherence"]}
                      />
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
