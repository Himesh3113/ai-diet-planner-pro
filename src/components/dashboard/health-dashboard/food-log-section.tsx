"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Apple, Flame, Loader2, Plus, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { buildNutritionTargets } from "@/lib/meal-recommendations/nutrition-from-metrics";
import type { Database } from "@/lib/supabase/types";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/toast";

type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];
type FoodEntry = Database["public"]["Tables"]["food_logs"]["Row"];
type MealType = FoodEntry["meal_type"];

type Props = {
  metrics: MetricsRow | null;
};

const MEALS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snacks", label: "Snacks" },
];

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function formatProtein(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function ProgressCard({
  label,
  icon,
  consumed,
  target,
  unit,
}: {
  label: string;
  icon: "calories" | "protein";
  consumed: number;
  target: number | null;
  unit: string;
}) {
  const pct = target ? clamp((consumed / target) * 100, 0, 100) : 0;
  const Icon = icon === "calories" ? Flame : Apple;

  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
            Today
          </p>
          <p className="mt-2 text-sm font-black text-white">{label}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-black tabular-nums text-white">
        {unit === "g" ? formatProtein(consumed) : Math.round(consumed)}
        <span className="ml-1 text-sm text-white/35">{unit}</span>
      </p>
      <p className="mt-1 text-xs text-white/38">
        {target != null
          ? `Target ${target}${unit === "g" ? " g" : " kcal"}`
          : "Target appears after profile metrics are complete"}
      </p>
      <div
        className="mt-3 h-2 rounded-full bg-white/[0.06]"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <div
          className="h-full rounded-full bg-brand-neon transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RemainingCaloriesCard({
  consumed,
  target,
}: {
  consumed: number;
  target: number | null;
}) {
  const remaining = target == null ? null : target - consumed;
  const pct = target ? clamp((consumed / target) * 100, 0, 100) : 0;

  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
            Target balance
          </p>
          <p className="mt-2 text-sm font-black text-white">Calories remaining</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
          <Flame className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-black tabular-nums text-white">
        {remaining == null ? "—" : Math.abs(Math.round(remaining))}
        {remaining != null ? <span className="ml-1 text-sm text-white/35">kcal</span> : null}
      </p>
      <p className="mt-1 text-xs text-white/38">
        {remaining == null
          ? "Complete profile metrics to calculate remaining calories"
          : remaining >= 0
            ? `${Math.round(consumed)} of ${target} kcal consumed`
            : `${Math.abs(Math.round(remaining))} kcal over target`}
      </p>
      <div
        className="mt-3 h-2 rounded-full bg-white/[0.06]"
        role="progressbar"
        aria-label="Consumed calories against target"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <div
          className="h-full rounded-full bg-brand-neon transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function EntriesSkeleton() {
  return (
    <div className="grid gap-3 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-white/[0.07] bg-white/[0.03] p-4"
        >
          <div className="h-3 w-24 rounded bg-white/[0.08]" />
          <div className="mt-4 h-16 rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

export function FoodLogSection({ metrics }: Props) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [calories, setCalories] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const logDate = useMemo(() => todayKey(), []);

  const targets = useMemo(() => buildNutritionTargets(metrics), [metrics]);
  const consumed = useMemo(
    () =>
      entries.reduce(
        (acc, entry) => ({
          calories: acc.calories + entry.calories,
          proteinG: acc.proteinG + Number(entry.protein_g),
        }),
        { calories: 0, proteinG: 0 },
      ),
    [entries],
  );

  const entriesByMeal = useMemo(() => {
    const grouped: Record<MealType, FoodEntry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };
    for (const entry of entries) {
      grouped[entry.meal_type].push(entry);
    }
    return grouped;
  }, [entries]);

  const loadEntries = useCallback(async () => {
    try {
      setLoadState("loading");
      setError(null);
      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error("Sign in again to load food entries.");

      // Load food entries with graceful error handling
      const { data, error: logErr } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("logged_on", logDate);
      if (logErr) throw logErr;
      setEntries(data ?? []);
      setLoadState("ready");
    } catch (e) {
      console.error("Food log load database error", e);
      const message = e instanceof Error ? e.message : "Food log could not load.";
      setError(message);
      toast({
        title: "Food log unavailable",
        description: "Food logs could not load. Check the database migration and RLS policies.",
        variant: "error",
      });
      setLoadState("error");
    }
  }, [logDate, toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEntries();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadEntries]);

  async function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = foodName.trim();
    const serving = quantity.trim();
    const caloriesValue = Math.round(Number(calories));
    const proteinValue = Number(proteinG || 0);

    if (!name || !Number.isFinite(caloriesValue) || caloriesValue < 0) {
      setError("Add a food name and valid calories.");
      return;
    }
    if (!serving) {
      setError("Add a quantity or serving size.");
      return;
    }
    if (!Number.isFinite(proteinValue) || proteinValue < 0) {
      setError("Protein must be zero or higher.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error("Sign in again to add food entries.");

      const { data, error: insertErr } = await supabase
        .from("food_logs")
        .insert({
          user_id: user.id,
          meal_type: mealType,
          food_name: name,
          quantity: serving,
          calories: caloriesValue,
          protein_g: proteinValue,
          logged_on: logDate,
        })
        .select("*")
        .single();

      if (insertErr) throw insertErr;
      if (!data) throw new Error("Food entry was saved but no row was returned.");
      setEntries((current) => [data, ...current]);
      setFoodName("");
      setQuantity("");
      setCalories("");
      setProteinG("");
      setLoadState("ready");
      window.dispatchEvent(new CustomEvent("food-log:changed"));
      toast({
        title: "Food added",
        description: `${name} is saved for today.`,
        variant: "success",
      });
    } catch (e) {
      console.error("Food log insert database error", e);
      const message = e instanceof Error ? e.message : "Food entry could not be saved.";
      setError(message);
      toast({
        title: "Could not add food",
        description: "The entry was not saved. Check food_logs insert permissions.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function removeEntry(entryId: string) {
    try {
      setDeletingId(entryId);
      setError(null);
      const supabase = createClient();
      const { error: deleteErr } = await supabase
        .from("food_logs")
        .delete()
        .eq("id", entryId);

      if (deleteErr) throw deleteErr;
      setEntries((current) => current.filter((entry) => entry.id !== entryId));
      window.dispatchEvent(new CustomEvent("food-log:changed"));
      toast({
        title: "Food removed",
        description: "Today's totals were updated.",
        variant: "success",
      });
    } catch (e) {
      console.error("Food log delete database error", e);
      const message = e instanceof Error ? e.message : "Food entry could not be removed.";
      setError(message);
      toast({
        title: "Could not remove food",
        description: "The entry was not deleted. Check food_logs delete permissions.",
        variant: "error",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="glass rounded-lg border border-white/[0.08] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
                Food log
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                Today&apos;s intake
              </h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/52">
            Track breakfast, lunch, dinner, and snacks against your daily calorie
            and protein targets.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-10 shrink-0 self-start sm:self-auto"
          disabled={loadState === "loading"}
          onClick={loadEntries}
        >
          {loadState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProgressCard
          label="Calories consumed"
          icon="calories"
          consumed={consumed.calories}
          target={targets.dailyCalories}
          unit="kcal"
        />
        <ProgressCard
          label="Protein consumed"
          icon="protein"
          consumed={consumed.proteinG}
          target={targets.dailyProteinG}
          unit="g"
        />
        <RemainingCaloriesCard
          consumed={consumed.calories}
          target={targets.dailyCalories}
        />
      </div>

      <form
        onSubmit={addEntry}
        className="mt-6 rounded-lg border border-white/[0.07] bg-white/[0.03] p-4"
      >
        <div className="grid gap-3 md:grid-cols-[0.9fr_1.2fr_1fr_0.75fr_0.75fr_auto] md:items-end">
          <div className="space-y-2">
            <label
              htmlFor="food-meal-type"
              className="block text-sm font-medium text-white/78"
            >
              Meal
            </label>
            <select
              id="food-meal-type"
              value={mealType}
              onChange={(event) => setMealType(event.target.value as MealType)}
              className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.055] px-4 text-sm text-white shadow-inner shadow-black/20 transition focus-ring"
            >
              {MEALS.map((meal) => (
                <option key={meal.value} value={meal.value} className="bg-zinc-950">
                  {meal.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            id="food-name"
            label="Food"
            value={foodName}
            onChange={(event) => setFoodName(event.target.value)}
            placeholder="Greek yogurt bowl"
          />
          <Input
            id="food-quantity"
            label="Quantity"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="1 bowl"
          />
          <Input
            id="food-calories"
            label="Calories"
            inputMode="numeric"
            min={0}
            type="number"
            value={calories}
            onChange={(event) => setCalories(event.target.value)}
            placeholder="320"
          />
          <Input
            id="food-protein"
            label="Protein (g)"
            inputMode="decimal"
            min={0}
            step="0.1"
            type="number"
            value={proteinG}
            onChange={(event) => setProteinG(event.target.value)}
            placeholder="24"
          />
          <Button type="submit" className="h-12" isLoading={isSaving}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </form>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-300/15 bg-red-400/[0.06] px-4 py-3 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-6">
        {loadState === "loading" ? (
          <EntriesSkeleton />
        ) : loadState === "error" ? (
          <div className="rounded-lg border border-dashed border-white/[0.14] bg-white/[0.02] px-5 py-10 text-center">
            <p className="text-sm font-black text-white">Food log unavailable</p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/45">
              Check the Supabase food_logs table and try refreshing.
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/[0.14] bg-white/[0.02] px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
              <Apple className="h-6 w-6" />
            </div>
            <p className="mt-4 text-base font-black text-white">
              No food logged today
            </p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/45">
              Add your first item above and it will be grouped by meal here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-4">
            {MEALS.map((meal) => {
              const mealEntries = entriesByMeal[meal.value];
              const mealCalories = mealEntries.reduce(
                (sum, entry) => sum + entry.calories,
                0,
              );
              const mealProtein = mealEntries.reduce(
                (sum, entry) => sum + Number(entry.protein_g),
                0,
              );

              return (
                <div
                  key={meal.value}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-white">{meal.label}</p>
                      <p className="mt-1 text-[11px] text-white/35">
                        {mealCalories} kcal · {formatProtein(mealProtein)} g protein
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold text-white/40">
                      {mealEntries.length}
                    </span>
                  </div>

                  {mealEntries.length === 0 ? (
                    <p className="mt-4 text-xs leading-relaxed text-white/32">
                      Nothing logged yet.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-2">
                      {mealEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start justify-between gap-3 rounded-lg border border-white/[0.06] bg-black/10 p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white/85">
                              {entry.food_name}
                            </p>
                            <p className="mt-1 text-[11px] text-white/38">
                              {entry.quantity} · {entry.calories} kcal ·{" "}
                              {formatProtein(Number(entry.protein_g))} g
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label={`Remove ${entry.food_name}`}
                            disabled={deletingId === entry.id}
                            onClick={() => removeEntry(entry.id)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-red-500/10 hover:text-red-200 disabled:opacity-50"
                          >
                            {deletingId === entry.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
