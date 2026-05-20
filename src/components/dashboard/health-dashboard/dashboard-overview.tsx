"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Apple,
  ArrowUpRight,
  ChefHat,
  ChevronRight,
  Droplets,
  Dumbbell,
  Flame,
  Loader2,
  Moon,
  Scale,
  TrendingUp,
} from "lucide-react";
import { buildNutritionTargets } from "@/lib/meal-recommendations/nutrition-from-metrics";
import { buildDailyRoutine } from "@/lib/daily-routine";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { AIAssistantWidget } from "./ai-assistant-widget";
import { ProblemsTracker } from "./problems-tracker";

export type MetricsRow = {
  id: string;
  user_id: string;
  age: number | null;
  gender: "male" | "female" | "other" | null;
  height: number | null;
  weight: number | null;
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active" | null;
  goal:
    | "bulking"
    | "cutting"
    | "diabetic_diet"
    | "fat_loss"
    | "healthy_lifestyle"
    | "lean_bulk"
    | "maintenance"
    | "maintenance_diet"
    | "muscle_building"
    | "strength_training"
    | "weight_gain"
    | "weight_loss"
    | null;
  training_preference: "gym" | "non_gym" | null;
  training_type: "gym" | "home" | "none" | null;
  gym_category:
    | "bulking"
    | "cutting"
    | "fat_loss"
    | "lean_bulk"
    | "muscle_building"
    | "strength_training"
    | null;
  non_gym_category:
    | "diabetic_diet"
    | "healthy_lifestyle"
    | "maintenance_diet"
    | "weight_gain"
    | "weight_loss"
    | null;
  diet_type: "non_veg" | "veg" | null;
  allergies: string[] | null;
  food_preferences: string[] | null;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: string;
  onboarding_completed: boolean;
};

export type FoodLog = {
  id?: string;
  user_id?: string;
  logged_on: string;
  calories: number;
  protein_g: number | string;
};

export type HydrationLog = {
  id?: string;
  user_id?: string;
  logged_on: string;
  water_ml: number;
  weight_kg?: number | null;
};

export type SleepLog = {
  id?: string;
  user_id?: string;
  logged_on: string;
};

type DashboardOverviewProps = {
  user: { id: string; email?: string };
  metrics: MetricsRow | null;
  profile: ProfileRow | null;
  initialFoodLogs: FoodLog[];
  initialHydrationLogs: HydrationLog[];
  initialSleepLogs: SleepLog[];
  recentHydration: HydrationLog[];
  recentFood: FoodLog[];
};

export function DashboardOverview({
  user,
  metrics,
  profile,
  initialFoodLogs,
  initialHydrationLogs,
  recentHydration: initialRecentHydration,
  recentFood: initialRecentFood,
}: DashboardOverviewProps) {
  const foodLogs = initialFoodLogs;
  const recentFood = initialRecentFood;
  const [hydrationLogs, setHydrationLogs] = useState<HydrationLog[]>(initialHydrationLogs);
  const [recentHydration, setRecentHydration] = useState<HydrationLog[]>(initialRecentHydration);

  const [waterMl, setWaterMl] = useState(() => hydrationLogs?.[0]?.water_ml ?? 0);
  const [waterBusy, setWaterBusy] = useState(false);
  const [adherence, setAdherence] = useState(0);

  const targets = useMemo(() => buildNutritionTargets(metrics), [metrics]);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Consumed calculations
  const consumedCalories = useMemo(() => {
    return foodLogs.reduce((sum, entry) => sum + (entry.calories ?? 0), 0);
  }, [foodLogs]);

  const consumedProtein = useMemo(() => {
    return foodLogs.reduce((sum, entry) => sum + (Number(entry.protein_g) ?? 0), 0);
  }, [foodLogs]);

  // Checklist adherence scoring
  const routine = useMemo(() => buildDailyRoutine(metrics), [metrics]);
  
  useEffect(() => {
    if (!user?.id || routine.checklist.length === 0) return;
    const uid = user.id;
    const key = `dailyRoutine:${uid}:${today}`;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, boolean>;
        const checkedCount = routine.checklist.filter((item) => parsed[item.id] === true).length;
        const pct = Math.round((checkedCount / routine.checklist.length) * 100);
        const timer = setTimeout(() => {
          setAdherence(pct);
        }, 0);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, [routine.checklist, today, user?.id]);

  const saveWater = useCallback(
    async (nextWaterMl: number) => {
      const targetWater = Math.max(0, nextWaterMl);
      setWaterMl(targetWater); // optimistic update
      try {
        setWaterBusy(true);
        const supabase = createClient();
        
        const currentBmi = targets.bmi;
        const currentWeight = metrics?.weight ?? null;

        const { data, error } = await supabase
          .from("hydration_logs")
          .upsert(
            {
              user_id: user.id,
              logged_on: today,
              weight_kg: currentWeight,
              bmi: currentBmi != null ? Math.round(currentBmi * 10) / 10 : null,
              water_ml: targetWater,
            },
            { onConflict: "user_id,logged_on" }
          )
          .select("*")
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setHydrationLogs([data]);
          // Sync recent trends list
          setRecentHydration((prev) => {
            const filtered = prev.filter((item) => item.logged_on !== today);
            return [...filtered, data].sort((a, b) => a.logged_on.localeCompare(b.logged_on));
          });
        }
      } catch (err) {
        console.error("Failed to update water intake:", err);
      } finally {
        setWaterBusy(false);
      }
    },
    [metrics, targets.bmi, today, user.id]
  );

  // Sparkline data preparation (4 days)
  const sparklineData = useMemo(() => {
    // Generate last 4 days keys
    const dates: string[] = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    return dates.map((date) => {
      const waterLog = recentHydration.find((log) => log.logged_on === date);
      const dayFoods = recentFood.filter((log) => log.logged_on === date);
      const calories = dayFoods.reduce((sum, entry) => sum + (entry.calories ?? 0), 0);
      const d = new Date(date);
      const label = d.toLocaleDateString(undefined, { weekday: "short" });

      return {
        date,
        label,
        calories,
        waterMl: waterLog?.water_ml ?? 0,
        weightKg: waterLog?.water_ml != null ? (metrics?.weight ?? null) : (metrics?.weight ?? null),
      };
    });
  }, [recentHydration, recentFood, metrics]);

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = profile?.full_name?.split(" ")?.[0] ?? "Member";
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  }, [profile]);

  return (
    <div className="space-y-8">
      {/* Header and Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white sm:text-3xl tracking-tight">{greeting}</h2>
          <p className="mt-1.5 text-sm text-white/52">
            Here&apos;s your wellness status for today. Focus on consistency.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-bold text-white/60">
          <span className="h-2 w-2 rounded-full bg-brand-neon animate-pulse shadow-[0_0_8px_#39ff14]" />
          Platform Streak: Active
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2 Blocks Wide */}
        <div className="space-y-6 lg:col-span-2">
          {/* Daily Status Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Calorie Tile */}
            <div className="glass rounded-xl border border-white/[0.08] p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Calorie Balance</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{consumedCalories} <span className="text-xs text-white/40 font-medium">kcal</span></h3>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-neon/10 text-brand-neon">
                  <Flame className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-xs text-white/45 mb-1.5">
                  <span>Target: {targets.dailyCalories ?? 2000} kcal</span>
                  <span>{targets.dailyCalories ? Math.max(0, targets.dailyCalories - consumedCalories) : 0} left</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-neon transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        targets.dailyCalories ? (consumedCalories / targets.dailyCalories) * 100 : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Protein Tile */}
            <div className="glass rounded-xl border border-white/[0.08] p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Protein Tracker</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{consumedProtein} <span className="text-xs text-white/40 font-medium">g</span></h3>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-neon/10 text-brand-neon">
                  <Scale className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-xs text-white/45 mb-1.5">
                  <span>Target: {targets.dailyProteinG ?? 150} g</span>
                  <span>{targets.dailyProteinG ? Math.max(0, targets.dailyProteinG - consumedProtein) : 0} g left</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-neon transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        targets.dailyProteinG ? (consumedProtein / targets.dailyProteinG) * 100 : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Hydration Tracker Card */}
            <div className="glass rounded-xl border border-white/[0.08] p-5 sm:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <Droplets className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Hydration</p>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {waterMl} <span className="text-xs text-white/40 font-medium">/ {targets.hydrationMl ?? 2500} ml</span>
                    </h3>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => void saveWater(waterMl + 250)}
                    disabled={waterBusy}
                    variant="secondary"
                    className="h-8.5 text-xs px-2.5"
                  >
                    {waterBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "+ 250ml"}
                  </Button>
                  <Button
                    onClick={() => void saveWater(Math.max(0, waterMl - 250))}
                    disabled={waterBusy || waterMl <= 0}
                    variant="ghost"
                    className="h-8.5 text-xs px-2.5"
                  >
                    - 250ml
                  </Button>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, targets.hydrationMl ? (waterMl / targets.hydrationMl) * 100 : 0)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sparkline Trends Previews */}
          <div className="glass rounded-xl border border-white/[0.08] p-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/40 mb-4">4-Day Trend Previews</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Weight Spark */}
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Weight Snap</p>
                  <p className="text-lg font-black text-white mt-1">
                    {metrics?.weight ? `${metrics.weight} kg` : "No log"}
                  </p>
                </div>
                <div className="mt-4 flex items-end gap-1.5 h-6.5 justify-between">
                  {sparklineData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-brand-neon/60 rounded-t-sm"
                        style={{
                          height: d.weightKg ? `${Math.min(100, Math.max(15, (d.weightKg / (metrics?.weight ?? 100)) * 70))}%` : "15%",
                        }}
                      />
                      <span className="text-[8px] text-white/30 font-bold mt-1 uppercase">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calories Spark */}
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Calories log</p>
                  <p className="text-lg font-black text-white mt-1">{consumedCalories} kcal</p>
                </div>
                <div className="mt-4 flex items-end gap-1.5 h-6.5 justify-between">
                  {sparklineData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-brand-neon/80 rounded-t-sm"
                        style={{
                          height: `${Math.min(100, Math.max(10, (d.calories / (targets.dailyCalories ?? 2500)) * 70))}%`,
                        }}
                      />
                      <span className="text-[8px] text-white/30 font-bold mt-1 uppercase">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Water Spark */}
              <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Water Trend</p>
                  <p className="text-lg font-black text-white mt-1">{waterMl} ml</p>
                </div>
                <div className="mt-4 flex items-end gap-1.5 h-6.5 justify-between">
                  {sparklineData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-blue-400/80 rounded-t-sm"
                        style={{
                          height: `${Math.min(100, Math.max(10, (d.waterMl / (targets.hydrationMl ?? 2500)) * 70))}%`,
                        }}
                      />
                      <span className="text-[8px] text-white/30 font-bold mt-1 uppercase">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="glass rounded-xl border border-white/[0.08] p-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/40 mb-4">Quick Actions</h4>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              <Link
                href="/dashboard/nutrition"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center hover:bg-white/[0.06] hover:border-white/[0.1] hover:scale-102 transition group"
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-brand-neon/10 text-brand-neon mb-2 group-hover:scale-110 transition">
                  <Apple className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-white">Log Meal</span>
              </Link>

              <Link
                href="/dashboard/diet-planner"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center hover:bg-white/[0.06] hover:border-white/[0.1] hover:scale-102 transition group"
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-brand-neon/10 text-brand-neon mb-2 group-hover:scale-110 transition">
                  <ChefHat className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-white">Diet Planner</span>
              </Link>

              <Link
                href="/dashboard/workout"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center hover:bg-white/[0.06] hover:border-white/[0.1] hover:scale-102 transition group"
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-brand-neon/10 text-brand-neon mb-2 group-hover:scale-110 transition">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-white">Start Workout</span>
              </Link>

              <Link
                href="/dashboard/sleep"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center hover:bg-white/[0.06] hover:border-white/[0.1] hover:scale-102 transition group"
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-brand-neon/10 text-brand-neon mb-2 group-hover:scale-110 transition">
                  <Moon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-white">Track Sleep</span>
              </Link>

              <Link
                href="/dashboard/analytics"
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center hover:bg-white/[0.06] hover:border-white/[0.1] hover:scale-102 transition group"
              >
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-brand-neon/10 text-brand-neon mb-2 group-hover:scale-110 transition">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-white">Analytics Hub</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - Side Panels */}
        <div className="space-y-6 lg:col-span-1">
          {/* Adherence Circle Card */}
          <div className="glass rounded-xl border border-white/[0.08] p-5 text-center flex flex-col items-center justify-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 self-start">Routine Adherence</p>
            <div className="relative flex items-center justify-center h-28 w-28 mt-4">
              <svg className="absolute transform -rotate-90 w-full h-full">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-white/[0.06]"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-brand-neon drop-shadow-[0_0_8px_#39ff14]"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - adherence / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white">{adherence}%</span>
                <span className="text-[9px] text-white/40 uppercase font-black tracking-wider">Completed</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-white/52">
              Based on today&apos;s routine checklist items.
            </p>
            <Link
              href="/dashboard/schedule"
              className="mt-4 flex items-center gap-1 text-[11px] font-black uppercase text-brand-neon hover:underline"
            >
              Update Routine Checklist <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Training Categories Overview */}
          <div className="glass rounded-xl border border-white/[0.08] p-5 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Profile Snapshot</p>
            
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-sm">
              <span className="text-white/45">Goal</span>
              <span className="font-bold text-white capitalize">
                {metrics?.goal?.replace("_", " ") ?? "Complete onboarding"}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-sm">
              <span className="text-white/45">Training Preference</span>
              <span className="font-bold text-white">
                {metrics?.training_preference === "gym" ? "Gym Training" : "Home Workout"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-white/45">Diet Style</span>
              <span className="font-bold text-white capitalize">
                {metrics?.diet_type?.replace("_", " ") ?? "Standard"}
              </span>
            </div>

            <Link href="/dashboard/profile">
              <Button variant="ghost" className="w-full text-xs h-9 mt-1 justify-between">
                <span>Edit Profile Metrics</span>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Side-by-side or Nesting AI Coach Assistant */}
      <AIAssistantWidget />

      {/* Problems Tracker (Rendered bottom, but gated internally to devMode only) */}
      <ProblemsTracker />
    </div>
  );
}
