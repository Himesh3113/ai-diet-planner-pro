"use client";

import { Activity, Droplets, Flame, RefreshCcw } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { useEffect, useMemo, useState } from "react";

type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];

type Props = {
  metrics: MetricsRow | null;
  /** When true, shows placeholder skeletons (e.g. client fetch in progress). */
  isLoading?: boolean;
};

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function round(n: number, digits = 0) {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

function activityMultiplier(level: MetricsRow["activity_level"]) {
  switch (level) {
    case "sedentary":
      return 1.2;
    case "light":
      return 1.375;
    case "moderate":
      return 1.55;
    case "active":
      return 1.725;
    case "very_active":
      return 1.9;
    default:
      return 1.55;
  }
}

function goalCaloriesDelta(goal: MetricsRow["goal"]) {
  // kcal/day adjustments (heuristic)
  switch (goal) {
    case "bulking":
    case "lean_bulk":
    case "muscle_building":
    case "weight_gain":
      return 300;
    case "cutting":
    case "fat_loss":
    case "weight_loss":
      return -300;
    case "strength_training":
    case "maintenance":
    case "healthy_lifestyle":
    case "maintenance_diet":
    case "diabetic_diet":
    default:
      return 0;
  }
}

function genderFactor(gender: MetricsRow["gender"]) {
  // Mifflin-St Jeor uses sex-specific constants
  // male: +5, female: -161
  switch (gender) {
    case "female":
      return -161;
    case "male":
    default:
      return 5;
  }
}

function bmiKgM2(weightKg: number, heightCm: number) {
  const hM = heightCm / 100;
  if (hM <= 0) return null;
  return weightKg / (hM * hM);
}

function dailyCalories({
  age,
  gender,
  heightCm,
  weightKg,
  activityLevel,
  goal,
}: {
  age: number;
  gender: MetricsRow["gender"];
  heightCm: number;
  weightKg: number;
  activityLevel: MetricsRow["activity_level"];
  goal: MetricsRow["goal"];
}) {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + genderFactor(gender);
  const tdee = bmr * activityMultiplier(activityLevel);
  const delta = goalCaloriesDelta(goal);
  return Math.max(1200, Math.round(tdee + delta));
}

function proteinTargetGrams({
  weightKg,
  goal,
}: {
  weightKg: number;
  goal: MetricsRow["goal"];
}) {
  const perKg = (() => {
    switch (goal) {
      case "muscle_building":
      case "lean_bulk":
      case "bulking":
        return 1.6;
      case "fat_loss":
      case "cutting":
      case "weight_loss":
        return 1.8;
      case "strength_training":
        return 1.5;
      default:
        return 1.2;
    }
  })();

  return Math.round(weightKg * perKg);
}

function waterIntakeMlTarget({
  weightKg,
}: {
  weightKg: number;
}) {
  // Common heuristic: 35 ml/kg/day, bounded.
  return Math.round(clamp(weightKg * 35, 1500, 4500));
}

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function OverviewHeaderSkeleton() {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="h-3 w-36 animate-pulse rounded bg-white/[0.08]" />
        <div className="h-7 w-52 animate-pulse rounded bg-white/[0.06]" />
      </div>
      <div className="hidden h-3 w-40 animate-pulse rounded bg-white/[0.06] sm:block" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-2.5 w-16 animate-pulse rounded bg-white/[0.08]" />
          <div className="h-4 w-28 animate-pulse rounded bg-white/[0.07]" />
        </div>
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-white/[0.06]" />
      </div>
      <div className="mt-3 h-6 w-24 animate-pulse rounded bg-white/[0.07]" />
      <div className="mt-2 h-3 w-32 animate-pulse rounded bg-white/[0.06]" />
    </div>
  );
}

function HydrationIntakeCardSkeleton() {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-2.5 w-16 animate-pulse rounded bg-white/[0.08]" />
          <div className="h-4 w-36 animate-pulse rounded bg-white/[0.07]" />
        </div>
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-white/[0.06]" />
      </div>
      <div className="mt-3 h-3 w-40 animate-pulse rounded bg-white/[0.06]" />
      <div className="mt-3 h-2 animate-pulse rounded-full bg-white/[0.07]" />
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="h-9 w-20 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="h-9 w-20 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-white/[0.06]" />
      </div>
      <div className="mt-3 h-10 w-full animate-pulse rounded bg-white/[0.05]" />
    </div>
  );
}

function MetricsEmptyState({ hasMetricsRow }: { hasMetricsRow: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-white/[0.14] bg-white/[0.02] px-5 py-10 text-center sm:px-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
        <Droplets className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-4 text-base font-black text-white">
        Nutrition targets need more profile data
      </p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/45">
        {hasMetricsRow
          ? "Add your height, weight, and age so we can estimate calories, protein, and hydration from your physiology."
          : "Complete onboarding with height, weight, and age to unlock calories, protein, and hydration estimates."}
      </p>
    </div>
  );
}

export function NutritionOverviewCards({ metrics, isLoading = false }: Props) {
  const [hydrationMl, setHydrationMl] = useState(0);

  const hydrationStorageKey = useMemo(() => {
    const userId = metrics?.user_id ?? "unknown";
    return `hydration:${userId}:${todayKey()}`;
  }, [metrics?.user_id]);

  const targets = useMemo(() => {
    const heightCm = metrics?.height ?? null;
    const weightKg = metrics?.weight ?? null;
    const age = metrics?.age ?? null;

    if (!heightCm || !weightKg || !age) {
      return {
        bmi: null as number | null,
        calories: null as number | null,
        proteinG: null as number | null,
        waterMl: null as number | null,
      };
    }

    const bmi = bmiKgM2(weightKg, heightCm);
    const calories = dailyCalories({
      age,
      gender: metrics?.gender ?? null,
      heightCm,
      weightKg,
      activityLevel: metrics?.activity_level ?? null,
      goal: metrics?.goal ?? null,
    });

    const proteinG = proteinTargetGrams({
      weightKg,
      goal: metrics?.goal ?? null,
    });

    const waterMl = waterIntakeMlTarget({ weightKg });

    return { bmi, calories, proteinG, waterMl };
  }, [metrics]);

  useEffect(() => {
    let next = 0;
    try {
      const raw = window.localStorage.getItem(hydrationStorageKey);
      const parsed = raw ? Number(raw) : 0;
      next = Number.isFinite(parsed) ? parsed : 0;
    } catch {
      // ignore
    }

    setTimeout(() => {
      setHydrationMl(next);
    }, 0);
  }, [hydrationStorageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(hydrationStorageKey, String(hydrationMl));
    } catch {
      // ignore
    }
  }, [hydrationMl, hydrationStorageKey]);

  const hydrationPct = useMemo(() => {
    if (!targets.waterMl) return 0;
    return clamp((hydrationMl / targets.waterMl) * 100, 0, 100);
  }, [hydrationMl, targets.waterMl]);

  const canCompute =
    targets.calories != null && targets.proteinG != null && targets.waterMl != null;

  const showGrid = !isLoading && canCompute;
  const showEmpty = !isLoading && !canCompute;

  const hydrationTip =
    "Sip water steadily across the day. Increase fluids in heat, illness, or intense training—this estimate scales with weight (~35 ml per kg, within safe bounds).";

  return (
    <section
      className="glass rounded-lg border border-white/[0.08] p-5 sm:p-6"
      aria-busy={isLoading}
      aria-live="polite"
    >
      {isLoading ? (
        <OverviewHeaderSkeleton />
      ) : (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
              Nutrition overview
            </p>
            <h3 className="mt-2 text-xl font-black text-white">
              {showEmpty ? "Daily targets" : "Your daily targets"}
            </h3>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/32">
            <span className="h-2 w-2 rounded-full bg-brand-neon" />
            {showEmpty ? "Awaiting profile inputs" : "Calculated from your profile"}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <HydrationIntakeCardSkeleton />
          <CardSkeleton />
        </div>
      ) : showGrid ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                  Nutrition
                </p>
                <p className="mt-2 text-sm font-black text-white">Calories target</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
                <Flame className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm font-bold text-white/60">
              {targets.calories != null ? `${targets.calories} kcal` : "—"}
            </p>
            <p className="mt-2 text-xs text-white/35">
              {targets.bmi != null ? `BMI: ${round(targets.bmi, 1)}` : null}
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                  Nutrition
                </p>
                <p className="mt-2 text-sm font-black text-white">Protein target</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
                <Flame className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm font-bold text-white/60">
              {targets.proteinG != null ? `${targets.proteinG} g` : "—"}
            </p>
            <p className="mt-2 text-xs text-white/35">
              {canCompute ? "Based on your goal and body weight" : null}
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                  Hydration
                </p>
                <p className="mt-2 text-sm font-black text-white">Hydration target</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
                <Droplets className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm font-bold text-white/60">
              {targets.waterMl != null ? `${targets.waterMl} ml / day` : "—"}
            </p>
            <p className="mt-2 text-xs text-white/35">
              Derived from body weight (~35 ml/kg), capped between 1.5–4.5 L for practicality.
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                  Hydration
                </p>
                <p className="mt-2 text-sm font-black text-white">Daily water intake</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
                <Droplets className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs text-white/35">
              Logged today:{" "}
              <span className="font-bold text-white/60">{hydrationMl} ml</span>
              {targets.waterMl != null ? (
                <span className="text-white/28">
                  {" "}
                  · Goal {targets.waterMl} ml
                </span>
              ) : null}
            </p>

            <div
              className="mt-3 h-2 rounded-full bg-white/[0.06]"
              role="progressbar"
              aria-valuenow={Math.round(hydrationPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${Math.round(hydrationPct)} percent of daily hydration goal`}
              aria-label="Hydration progress toward daily goal"
            >
              <div
                className="h-full rounded-full bg-brand-neon transition-all"
                style={{ width: `${hydrationPct}%` }}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!targets.waterMl}
                onClick={() => setHydrationMl((v) => v + 250)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/[0.07] disabled:opacity-50"
              >
                +250 ml
              </button>
              <button
                type="button"
                disabled={!targets.waterMl}
                onClick={() => setHydrationMl((v) => Math.max(0, v - 250))}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/[0.07] disabled:opacity-50"
              >
                −250 ml
              </button>
              <button
                type="button"
                disabled={!targets.waterMl}
                onClick={() => setHydrationMl(0)}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/[0.07] disabled:opacity-50"
              >
                <RefreshCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-white/38">{hydrationTip}</p>
          </div>

          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                  Nutrition
                </p>
                <p className="mt-2 text-sm font-black text-white">Carb balance</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
                <Activity className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-sm font-bold text-white/60">
              {canCompute ? "Set by AI (soon)" : "—"}
            </p>
            <p className="mt-2 text-xs text-white/35">
              Targets for calories, protein, and hydration are enabled.
            </p>
          </div>
        </div>
      ) : (
        <MetricsEmptyState hasMetricsRow={metrics != null} />
      )}
    </section>
  );
}
