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
import { Apple, BarChart3, Droplets, Flame, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildNutritionTargets } from "@/lib/meal-recommendations/nutrition-from-metrics";
import type { Database } from "@/lib/supabase/types";
import { createClient } from "@/utils/supabase/client";
import { CHART_AXIS, CHART_GRID, CHART_TOOLTIP, MUTED_LINE, NEON } from "./analytics/chart-styles";

type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];
type FoodLog = Database["public"]["Tables"]["food_logs"]["Row"];
type HydrationLog = Database["public"]["Tables"]["hydration_logs"]["Row"];

type DayRow = {
  dateKey: string;
  label: string;
  calories: number;
  proteinG: number;
  waterMl: number;
};

function daysAgoKey(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function labelForDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function buildRows(foodLogs: FoodLog[], hydrationLogs: HydrationLog[]) {
  const byDate = new Map<string, DayRow>();
  for (const log of foodLogs) {
    const row = byDate.get(log.logged_on) ?? {
      dateKey: log.logged_on,
      label: labelForDate(log.logged_on),
      calories: 0,
      proteinG: 0,
      waterMl: 0,
    };
    row.calories += log.calories;
    row.proteinG += Number(log.protein_g);
    byDate.set(log.logged_on, row);
  }
  for (const log of hydrationLogs) {
    const row = byDate.get(log.logged_on) ?? {
      dateKey: log.logged_on,
      label: labelForDate(log.logged_on),
      calories: 0,
      proteinG: 0,
      waterMl: 0,
    };
    row.waterMl = log.water_ml;
    byDate.set(log.logged_on, row);
  }
  return [...byDate.values()]
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .map((row) => ({ ...row, proteinG: round1(row.proteinG) }));
}

function StatPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Flame;
}) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black tabular-nums text-white">{value}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function WeeklyAnalyticsSection() {
  const [metrics, setMetrics] = useState<MetricsRow | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [hydrationLogs, setHydrationLogs] = useState<HydrationLog[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoadState("loading");
      setError(null);
      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error("Sign in again to load weekly analytics.");

      const start = daysAgoKey(6);
      const end = todayKey();
      const [{ data: metricsData, error: metricsErr }, { data: foods, error: foodsErr }, { data: hydration, error: hydrationErr }] =
        await Promise.all([
          supabase
            .from("user_metrics")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle<MetricsRow>(),
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

      if (metricsErr) throw metricsErr;
      if (foodsErr) throw foodsErr;
      if (hydrationErr) throw hydrationErr;
      setMetrics(metricsData ?? null);
      setFoodLogs(foods ?? []);
      setHydrationLogs(hydration ?? []);
      setLoadState("ready");
    } catch (e) {
      console.error("Weekly analytics database error", e);
      setError(e instanceof Error ? e.message : "Weekly analytics could not load.");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const handleChanged = () => {
      void load();
    };
    window.addEventListener("food-log:changed", handleChanged);
    window.addEventListener("hydration-log:changed", handleChanged);
    return () => {
      window.removeEventListener("food-log:changed", handleChanged);
      window.removeEventListener("hydration-log:changed", handleChanged);
    };
  }, [load]);

  const rows = useMemo(() => buildRows(foodLogs, hydrationLogs), [foodLogs, hydrationLogs]);
  const targets = useMemo(() => buildNutritionTargets(metrics), [metrics]);
  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          calories: acc.calories + row.calories,
          proteinG: acc.proteinG + row.proteinG,
          waterMl: acc.waterMl + row.waterMl,
        }),
        { calories: 0, proteinG: 0, waterMl: 0 },
      ),
    [rows],
  );

  return (
    <section className="glass rounded-lg border border-white/[0.08] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
                Weekly analytics
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                Actual tracked days only
              </h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/52">
            This section does not fabricate missing history. One tracked day means one
            chart point.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-10 shrink-0 gap-2 self-start sm:self-auto"
          disabled={loadState === "loading"}
          onClick={load}
        >
          {loadState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {loadState === "loading" ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border border-white/[0.07] bg-white/[0.03]" />
          ))}
        </div>
      ) : loadState === "error" ? (
        <div className="mt-6 rounded-lg border border-red-300/15 bg-red-400/[0.06] p-4">
          <p className="text-sm font-semibold text-red-100">
            {error ?? "Weekly analytics could not load."}
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-white/[0.14] bg-white/[0.02] px-5 py-10 text-center">
          <p className="text-base font-black text-white">Not enough data yet</p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/45">
            Add food or hydration logs. Weekly analytics will start once real rows
            exist in Supabase.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatPill label="Tracked days" value={String(rows.length)} icon={BarChart3} />
            <StatPill label="Calories" value={`${totals.calories} kcal`} icon={Flame} />
            <StatPill label="Protein" value={`${round1(totals.proteinG)} g`} icon={Apple} />
            <StatPill label="Water" value={`${totals.waterMl} ml`} icon={Droplets} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
              <p className="text-xs font-black text-white">Calories by tracked day</p>
              <p className="mt-0.5 text-[10px] text-white/35">
                Target: {targets.dailyCalories ?? "-"} kcal/day
              </p>
              <div className="mt-3 h-56 w-full">
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
            </div>

            <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
              <p className="text-xs font-black text-white">Protein and hydration</p>
              <p className="mt-0.5 text-[10px] text-white/35">
                Targets: {targets.dailyProteinG ?? "-"} g protein · {targets.hydrationMl ?? "-"} ml water
              </p>
              <div className="mt-3 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid {...CHART_GRID} strokeDasharray="3 3" />
                    <XAxis dataKey="label" {...CHART_AXIS} tickLine={false} />
                    <YAxis {...CHART_AXIS} tickLine={false} width={44} />
                    <Tooltip {...CHART_TOOLTIP} />
                    <Line type="monotone" dataKey="proteinG" name="Protein g" stroke={NEON} strokeWidth={2} dot={{ r: 2, fill: NEON }} />
                    <Line type="monotone" dataKey="waterMl" name="Water ml" stroke={MUTED_LINE} strokeWidth={2} dot={{ r: 2, fill: MUTED_LINE }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
