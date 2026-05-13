"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChefHat, Droplets, RefreshCw, Scale, UtensilsCrossed } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { buildMealPlan } from "@/lib/meal-recommendations/engine";
import type { MealPlanResult, MealSlot } from "@/lib/meal-recommendations/types";
import { createClient } from "@/utils/supabase/client";

type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];

type HealthNotesRow = {
  user_id: string;
  acne: string | null;
  migraine: string | null;
  knee_pain: string | null;
  hair_fall: string | null;
};

const SLOT_ORDER: MealSlot[] = ["breakfast", "lunch", "dinner", "snack"];

const SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function optionalNotesUnavailable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === "42P01" ||
    maybeError.code === "PGRST205" ||
    (typeof maybeError.message === "string" &&
      maybeError.message.toLowerCase().includes("health_condition_notes"))
  );
}

export function MealRecommendationsSection() {
  const [metrics, setMetrics] = useState<MetricsRow | null>(null);
  const [notes, setNotes] = useState<HealthNotesRow | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoadState("loading");
        setError(null);
        const supabase = createClient();
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        if (!user) throw new Error("Not authenticated");

        const [{ data: m, error: mErr }, { data: n, error: nErr }] =
          await Promise.all([
            supabase
              .from("user_metrics")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle<MetricsRow>(),
            supabase
              .from("health_condition_notes")
              .select("user_id, acne, migraine, knee_pain, hair_fall")
              .eq("user_id", user.id)
              .maybeSingle<HealthNotesRow>(),
          ]);

        if (mErr) throw mErr;
        if (cancelled) return;
        setMetrics(m ?? null);
        setNotes(nErr && optionalNotesUnavailable(nErr) ? null : (n ?? null));
        if (nErr && !optionalNotesUnavailable(nErr)) {
          setError(
            "Health notes could not be loaded, so meal ideas are using profile metrics only.",
          );
        }
        setLoadState("ready");
      } catch (e) {
        if (cancelled) return;
        const message =
          e instanceof Error ? e.message : "Profile metrics could not be loaded.";
        if (message === "Not authenticated") {
          setError("Sign in again to load meal ideas.");
          setLoadState("error");
          return;
        }
        setMetrics(null);
        setNotes(null);
        setError(`Using default meal ideas because profile metrics failed: ${message}`);
        setLoadState("ready");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const plan: MealPlanResult | null = useMemo(() => {
    if (loadState !== "ready") return null;
    return buildMealPlan({
      metrics,
      healthNotes: notes,
      shuffleSeed,
      suggestionsPerSlot: 2,
    });
  }, [loadState, metrics, notes, shuffleSeed]);

  const reshuffle = useCallback(() => {
    setShuffleSeed((s) => s + 1);
  }, []);

  return (
    <section className="glass rounded-lg border border-white/[0.08] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
                Meal ideas
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                Local recommendation engine
              </h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/52">
            Rule-based meals from your metrics and health notes—no external APIs.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-10 shrink-0 gap-2 self-start sm:self-auto"
          disabled={loadState !== "ready"}
          onClick={reshuffle}
        >
          <RefreshCw className="h-4 w-4" />
          Shuffle
        </Button>
      </div>

      {loadState === "loading" ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
      ) : loadState === "error" ? (
        <div className="mt-6 rounded-lg border border-red-300/15 bg-red-400/[0.06] p-4">
          <p className="text-sm font-semibold text-red-100">
            {error ?? "Meal ideas could not load."}
          </p>
        </div>
      ) : plan ? (
        <div className="mt-6 space-y-6">
          {error ? (
            <div className="rounded-lg border border-amber-300/15 bg-amber-300/[0.05] px-4 py-3 text-xs leading-relaxed text-amber-100/85">
              {error}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3 rounded-lg border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-xs text-white/50">
            <span className="inline-flex items-center gap-1.5 font-bold text-white/70">
              <ChefHat className="h-3.5 w-3.5 text-brand-neon" />
              {plan.targets.dailyCalories != null
                ? `${plan.targets.dailyCalories} kcal / day`
                : "~2000 kcal / day (default)"}
            </span>
            <span className="text-white/25">·</span>
            <span>
              Protein{" "}
              {plan.targets.dailyProteinG != null
                ? `~${plan.targets.dailyProteinG} g`
                : "~90 g (default)"}
            </span>
            <span className="text-white/25">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-brand-neon" />
              {plan.targets.hydrationMl != null
                ? `${plan.targets.hydrationMl} ml fluids`
                : "—"}
            </span>
            <span className="text-white/25">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-brand-neon" />
              {plan.targets.bmi != null
                ? `BMI ${round1(plan.targets.bmi)}`
                : "BMI when height/weight set"}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-white/40">{plan.summaryLine}</p>

          {(plan.signals.diabetesPriority ||
            plan.signals.acnePriority ||
            plan.signals.jointPriority ||
            plan.signals.hairPriority) && (
            <div className="flex flex-wrap gap-2">
              {plan.signals.diabetesPriority ? (
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-neon">
                  Diabetes-friendly
                </span>
              ) : null}
              {plan.signals.acnePriority ? (
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/55">
                  Acne-aware
                </span>
              ) : null}
              {plan.signals.jointPriority ? (
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/55">
                  Joint support
                </span>
              ) : null}
              {plan.signals.hairPriority ? (
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/55">
                  Hair health
                </span>
              ) : null}
            </div>
          )}

          <div className="space-y-8">
            {SLOT_ORDER.map((slot) => (
              <div key={slot}>
                <h4 className="text-sm font-black uppercase tracking-[0.14em] text-white/45">
                  {SLOT_LABEL[slot]}
                </h4>
                <p className="mt-1 text-[11px] text-white/32">
                  Target ~{plan.slotTargets[slot].kcal} kcal · ~
                  {plan.slotTargets[slot].proteinG} g protein this meal
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {plan.meals[slot].length === 0 ? (
                    <p className="text-sm text-white/45">
                      No templates matched your filters—relax allergies or diet in
                      profile.
                    </p>
                  ) : (
                    plan.meals[slot].map((m) => (
                      <article
                        key={m.id}
                        className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4"
                      >
                        <p className="text-sm font-bold text-white">{m.title}</p>
                        <p className="mt-2 text-xs font-semibold text-white/55">
                          ~{m.estimatedKcal} kcal · ~{m.estimatedProteinG} g protein
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-white/38">
                          {m.healthExplanation}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
