"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChefHat,
  Sparkles,
  Loader2,
  IndianRupee,
  Leaf,
  Drumstick,
  Save,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  AFFORDABILITY_OPTIONS,
  DIET_GOALS,
  type Affordability,
  type DietFilter,
  type DietGoal,
  type PreferredFoodKey,
} from "@/lib/diet-planner/constants";
import { DietPlannerFoodPicker } from "./diet-planner-food-picker";
import type { DietPlannerSnapshot } from "@/lib/diet-planner/db";
import type { DailyDietPlan, MealMacros, MealPlanSlot, MealSlot } from "@/lib/diet-planner/types";

const MEAL_SLOTS: { key: MealSlot; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snacks", label: "Snacks" },
];

const LOAD_TIMEOUT_MS = 12_000;

function MacroPills({ slot }: { slot: MealMacros }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {[
        { label: "Cal", value: slot.calories, unit: "kcal" },
        { label: "P", value: slot.protein, unit: "g" },
        { label: "C", value: slot.carbs, unit: "g" },
        { label: "F", value: slot.fats, unit: "g" },
      ].map((m) => (
        <span
          key={m.label}
          className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-bold text-white/70"
        >
          <span className="text-brand-neon">{m.label}</span> {m.value}
          {m.unit}
        </span>
      ))}
    </div>
  );
}

function MealCard({ label, slot }: { label: string; slot: MealPlanSlot }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/25 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-brand-neon">
        {label}
      </p>
      <ul className="mt-2 space-y-1.5">
        {slot.items.map((item, i) => (
          <li key={i} className="text-sm text-white/85">
            <span className="font-semibold">{item.name}</span>
            <span className="text-white/40"> · {item.portion}</span>
          </li>
        ))}
      </ul>
      <MacroPills slot={slot} />
    </div>
  );
}

function applySnapshot(
  snapshot: DietPlannerSnapshot,
  setters: {
    setGoal: (g: DietGoal) => void;
    setPreferredFoods: (f: PreferredFoodKey[]) => void;
    setDietFilter: (d: DietFilter) => void;
    setIndianFoodPriority: (v: boolean) => void;
    setAffordability: (a: Affordability) => void;
    setPlan: (p: DailyDietPlan | null) => void;
    setPlanSource: (s: "ai" | "fallback" | null) => void;
  },
) {
  if (snapshot.preferences) {
    setters.setGoal(snapshot.preferences.goal);
    setters.setPreferredFoods(snapshot.preferences.preferredFoods);
    setters.setDietFilter(snapshot.preferences.dietFilter);
    setters.setIndianFoodPriority(snapshot.preferences.indianFoodPriority);
    setters.setAffordability(snapshot.preferences.affordability);
  }
  setters.setPlan(snapshot.plan);
  setters.setPlanSource(snapshot.planSource);
}

export function DietPlannerSection() {
  const { toast } = useToast();
  const [goal, setGoal] = useState<DietGoal>("maintenance");
  const [preferredFoods, setPreferredFoods] = useState<PreferredFoodKey[]>([]);
  const [dietFilter, setDietFilter] = useState<DietFilter>("veg");
  const [indianFoodPriority, setIndianFoodPriority] = useState(true);
  const [affordability, setAffordability] = useState<Affordability>("moderate");
  const [plan, setPlan] = useState<DailyDietPlan | null>(null);
  const [planSource, setPlanSource] = useState<"ai" | "fallback" | null>(null);

  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const loadRequestId = useRef(0);

  const loadPreferences = useCallback(async () => {
    const requestId = ++loadRequestId.current;
    setLoadState("loading");
    setLoadError(null);

    const timeout = window.setTimeout(() => {
      if (loadRequestId.current !== requestId) return;
      setLoadState("error");
      setLoadError("Loading timed out. Check your connection and retry.");
    }, LOAD_TIMEOUT_MS);

    try {
      const res = await fetch("/api/diet-planner/preferences", {
        method: "GET",
        cache: "no-store",
      });
      const data = (await res.json()) as DietPlannerSnapshot & { error?: string };

      if (loadRequestId.current !== requestId) return;
      if (!res.ok) throw new Error(data.error ?? "Failed to load diet planner.");

      applySnapshot(data, {
        setGoal,
        setPreferredFoods,
        setDietFilter,
        setIndianFoodPriority,
        setAffordability,
        setPlan,
        setPlanSource,
      });
      setLoadState("ready");
    } catch (e) {
      if (loadRequestId.current !== requestId) return;
      const msg =
        e instanceof Error ? e.message : "Failed to load diet preferences.";
      setLoadError(msg);
      setLoadState("error");
      toast({ title: "Diet planner", description: msg, variant: "error" });
    } finally {
      window.clearTimeout(timeout);
    }
  }, [toast]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (active) void loadPreferences();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
      loadRequestId.current += 1;
    };
  }, [loadPreferences]);

  const toggleFood = (key: PreferredFoodKey) => {
    setPreferredFoods((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
    );
  };

  const applyPreset = (keys: PreferredFoodKey[]) => {
    setPreferredFoods((prev) => {
      const next = new Set(prev);
      for (const k of keys) next.add(k);
      return [...next];
    });
  };

  const savePayload = () => ({
    goal,
    preferredFoods,
    dietFilter,
    indianFoodPriority,
    affordability,
  });

  const handleSavePreferences = async () => {
    if (preferredFoods.length === 0) {
      toast({
        title: "Select foods",
        description: "Pick at least one food you eat regularly.",
        variant: "error",
      });
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/diet-planner/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savePayload()),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed.");

      toast({
        title: "Preferences saved",
        description: "Your diet planner settings are stored in Supabase.",
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Save failed",
        description:
          e instanceof Error
            ? e.message
            : "Could not save preferences. Apply the diet planner migration in Supabase.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (preferredFoods.length === 0) {
      toast({
        title: "Select foods first",
        description: "Choose foods you prefer before generating a plan.",
        variant: "error",
      });
      return;
    }

    try {
      setIsGenerating(true);
      const res = await fetch("/api/diet-planner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savePayload()),
      });

      const data = (await res.json()) as {
        plan?: DailyDietPlan;
        source?: "ai" | "fallback";
        error?: string;
      };

      if (!res.ok) throw new Error(data.error ?? "Generation failed.");
      if (!data.plan) throw new Error("No meal plan returned. Please try again.");

      setPlan(data.plan);
      setPlanSource(data.source ?? null);

      toast({
        title: "Diet plan ready",
        description:
          data.source === "ai"
            ? "AI generated your personalized daily meal plan."
            : "Plan generated using your food database (AI unavailable).",
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Generation error",
        description: e instanceof Error ? e.message : "Could not generate plan.",
        variant: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isBusy = loadState === "loading" || isSaving || isGenerating;

  return (
    <section className="glass rounded-lg border border-white/[0.08] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
                Personalized Planner
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                AI Diet Planner
              </h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/52">
            Select your goal and everyday foods. We build a realistic Indian daily
            plan using only what you eat — with calories, protein, carbs, and fats
            per meal.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-10 shrink-0 self-start border border-white/10 sm:self-auto"
          disabled={isBusy}
          onClick={() => void loadPreferences()}
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {loadState === "loading" ? (
        <div className="mt-8 flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-neon" />
          <p className="mt-3 text-xs text-white/35">Loading your preferences…</p>
        </div>
      ) : loadState === "error" ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 py-12 text-center">
          <AlertCircle className="h-10 w-10 text-red-400/80" />
          <p className="mt-4 text-base font-black text-white">Could not load planner</p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/45">
            {loadError ??
              "Supabase tables may be missing. Run supabase/migrations/20260520160000_diet_planner_tables.sql in your project."}
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-6 h-10 gap-2"
            onClick={() => void loadPreferences()}
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
          <div className="space-y-5 rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="border-b border-white/5 pb-2 text-xs font-bold uppercase tracking-wider text-white/40">
              Goal
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {DIET_GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  disabled={isBusy}
                  onClick={() => setGoal(g.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left transition",
                    goal === g.value
                      ? "border-brand-neon/50 bg-brand-neon/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.06]",
                  )}
                >
                  <span className="text-xs font-bold">{g.label}</span>
                  <span className="mt-0.5 block text-[10px] text-white/40">
                    {g.description}
                  </span>
                </button>
              ))}
            </div>

            <p className="border-b border-white/5 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-white/40">
              Indian Food Library
            </p>
            <p className="text-[10px] leading-relaxed text-white/38">
              {preferredFoods.length} preference
              {preferredFoods.length === 1 ? "" : "s"} selected · macros shown per serving
            </p>
            <DietPlannerFoodPicker
              preferredFoods={preferredFoods}
              dietFilter={dietFilter}
              affordability={affordability}
              disabled={isBusy}
              onTogglePreferred={toggleFood}
              onApplyPreset={applyPreset}
            />

            <p className="border-b border-white/5 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-white/40">
              Filters &amp; Tags
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-white/70">
                Diet type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "veg" as const, label: "Vegetarian", icon: Leaf },
                    { value: "non_veg" as const, label: "Non-Veg", icon: Drumstick },
                  ] as const
                ).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    disabled={isBusy}
                    onClick={() => setDietFilter(value)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition border",
                      dietFilter === value
                        ? "border-brand-neon bg-brand-neon text-black"
                        : "border-white/10 bg-white/[0.04] text-white/60",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={isBusy}
              onClick={() => setIndianFoodPriority((v) => !v)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-xs font-bold transition",
                indianFoodPriority
                  ? "border-brand-neon/40 bg-brand-neon/10 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/55",
              )}
            >
              <span>Indian food prioritization</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px]",
                  indianFoodPriority ? "bg-brand-neon text-black" : "bg-white/10",
                )}
              >
                {indianFoodPriority ? "ON" : "OFF"}
              </span>
            </button>

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-white/70">
                <IndianRupee className="h-3.5 w-3.5" />
                Affordability
              </label>
              <div className="flex flex-col gap-1.5">
                {AFFORDABILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isBusy}
                    onClick={() => setAffordability(opt.value)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-4 py-2.5 text-left text-xs font-bold transition border",
                      affordability === opt.value
                        ? "border-brand-neon/40 bg-white/[0.08] text-brand-neon"
                        : "border-white/10 bg-white/[0.03] text-white/52",
                    )}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[10px] font-normal text-white/35">
                      {opt.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="h-10 w-full gap-2"
                onClick={() => void handleSavePreferences()}
                isLoading={isSaving}
                disabled={isGenerating}
              >
                <Save className="h-4 w-4" />
                Save Preferences
              </Button>
              <Button
                type="button"
                className="h-11 w-full bg-white font-extrabold text-black hover:bg-white/90"
                onClick={() => void handleGeneratePlan()}
                isLoading={isGenerating}
                disabled={isSaving}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Diet Plan
              </Button>
              <p className="text-center text-[10px] text-white/30">
                Uses only your selected foods · Saved to Supabase
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-brand-neon" />
                <p className="mt-4 text-sm font-bold text-white">Building your plan…</p>
                <p className="mt-1 text-xs text-white/40">This usually takes a few seconds</p>
              </div>
            ) : plan ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-neon">
                      Today&apos;s Plan
                    </p>
                    <h4 className="mt-1 text-base font-bold text-white capitalize">
                      {goal.replace("_", " ")}
                    </h4>
                  </div>
                  {planSource && (
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-bold text-white/50">
                      {planSource === "ai" ? "AI Generated" : "Smart Template"}
                    </span>
                  )}
                </div>

                {plan.notes && (
                  <p className="text-xs leading-relaxed text-white/45">{plan.notes}</p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  {MEAL_SLOTS.map(({ key, label }) => (
                    <MealCard key={key} label={label} slot={plan[key]} />
                  ))}
                </div>

                <div className="rounded-lg border border-brand-neon/20 bg-brand-neon/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-neon">
                    Daily totals
                  </p>
                  <MacroPills slot={plan.dailyTotals} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ChefHat className="h-10 w-10 text-white/20" />
                <p className="mt-4 text-base font-black text-white">
                  No meal plan yet
                </p>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-white/45">
                  Select your goal and preferred foods, save preferences, then tap
                  Generate AI Diet Plan for breakfast, lunch, dinner, and snacks
                  with full macros.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
