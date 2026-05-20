"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Dumbbell, Sparkles, Loader2, Calendar, MapPin, HelpCircle, Check } from "lucide-react";
import type { Json } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { WORKOUT_TEMPLATES, type WeeklySchedule } from "@/lib/workout/workout-templates";

type Difficulty = "beginner" | "intermediate" | "advanced";
type Mode = "home" | "gym";

interface WorkoutPlan {
  difficulty: Difficulty;
  mode: Mode;
  weekly_schedule: WeeklySchedule;
}

const DAYS_OF_WEEK = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

function getTodayDayName(): string {
  const d = new Date().getDay();
  // Sunday is 0, Monday is 1, etc.
  return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][d];
}

export function WorkoutPlannerSection() {
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [mode, setMode] = useState<Mode>("gym");
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [isSaving, setIsSaving] = useState(false);
  
  // Set default active day to today
  const [selectedDay, setSelectedDay] = useState<string>(() => getTodayDayName());

  const loadPlan = useCallback(async () => {
    try {
      setLoadState("loading");
      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error("Sign in to load workout schedule.");

      const { data, error: planErr } = await supabase
        .from("workout_plans")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (planErr) throw planErr;

      if (data) {
        setActivePlan({
          difficulty: data.difficulty as Difficulty,
          mode: data.mode as Mode,
          weekly_schedule: data.weekly_schedule as unknown as WeeklySchedule,
        });
        setDifficulty(data.difficulty as Difficulty);
        setMode(data.mode as Mode);
      } else {
        setActivePlan(null);
      }
      setLoadState("ready");
    } catch (e) {
      console.error("Error loading workout plan", e);
      const msg = e && typeof e === "object" && "message" in e && typeof e.message === "string"
        ? e.message
        : (e instanceof Error ? e.message : "Failed to load workout details.");
      toast({
        title: "Workout planner error",
        description: msg,
        variant: "error",
      });
      setActivePlan(null);
      setLoadState("ready");
    }
  }, [toast]);

  useEffect(() => {
    let active = true;
    const fetchPlan = async () => {
      await Promise.resolve();
      if (active) {
        void loadPlan();
      }
    };
    void fetchPlan();
    return () => {
      active = false;
    };
  }, [loadPlan]);

  const handleGeneratePlan = async () => {
    try {
      setIsSaving(true);
      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error("Please log in again.");

      const key = `${mode}-${difficulty}`;
      const schedule = WORKOUT_TEMPLATES[key];

      if (!schedule) {
        throw new Error("Could not find a workout template matching these preferences.");
      }

      const { error: upsertErr } = await supabase
        .from("workout_plans")
        .upsert({
          user_id: user.id,
          difficulty,
          mode,
          weekly_schedule: schedule as unknown as Json,
          updated_at: new Date().toISOString(),
        });

      if (upsertErr) throw upsertErr;

      setActivePlan({
        difficulty,
        mode,
        weekly_schedule: schedule,
      });

      toast({
        title: "Workout Generated!",
        description: `Successfully loaded your weekly ${difficulty} ${mode} plan!`,
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Generation error",
        description: e instanceof Error ? e.message : "Failed to save plan.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentDayRoutine = useMemo(() => {
    if (!activePlan || !activePlan.weekly_schedule) return null;
    return activePlan.weekly_schedule[selectedDay] || null;
  }, [activePlan, selectedDay]);

  const [isLoggingWorkout, setIsLoggingWorkout] = useState(false);

  const handleLogWorkoutCompleted = async () => {
    if (!currentDayRoutine) return;
    try {
      setIsLoggingWorkout(true);
      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error("Sign in to log workout.");

      const today = new Date().toISOString().split("T")[0];
      const duration = currentDayRoutine.exercises.length * 10;
      const calories = currentDayRoutine.exercises.length * 75;

      const { error: insertErr } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: user.id,
          logged_on: today,
          workout_name: `${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}: ${currentDayRoutine.focus}`,
          duration_minutes: duration,
          calories_burned: calories
        });

      if (insertErr) throw insertErr;

      toast({
        title: "Workout logged!",
        description: `Successfully logged "${currentDayRoutine.focus}" as completed today.`,
        variant: "success",
      });
    } catch (e: unknown) {
      console.error(e);
      toast({
        title: "Failed to log workout",
        description: e instanceof Error ? e.message : "An error occurred.",
        variant: "error",
      });
    } finally {
      setIsLoggingWorkout(false);
    }
  };

  const activePlanTitle = activePlan
    ? `${activePlan.difficulty.charAt(0).toUpperCase() + activePlan.difficulty.slice(1)} · ${activePlan.mode.charAt(0).toUpperCase() + activePlan.mode.slice(1)} Routine`
    : "Customize Schedule";

  return (
    <section className="glass rounded-lg border border-white/[0.08] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
                Workout Plan
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                {activePlan ? activePlanTitle : "Weekly Workout Planner"}
              </h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/52">
            Stay active with structural exercises customized to your skill level. Track exercises, sets, reps, and cues tailored to your environment.
          </p>
        </div>
        
        {activePlan && (
          <Button
            type="button"
            variant="ghost"
            className="h-10 shrink-0 self-start sm:self-auto border border-white/10"
            disabled={loadState === "loading"}
            onClick={loadPlan}
          >
            Refresh
          </Button>
        )}
      </div>

      {loadState === "loading" ? (
        <div className="mt-8 flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-neon" />
          <p className="mt-3 text-xs text-white/35">Loading workout planner...</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.8fr]">
          {/* Preferences & Generation Panel */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4 flex flex-col justify-between">
            <div className="space-y-5">
              <p className="text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/5 pb-2">
                Preferences
              </p>

              {/* Mode Selectors */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/70 uppercase">
                  Location Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["home", "gym"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition border border-white/10",
                        mode === m
                          ? "bg-brand-neon text-black font-extrabold border-brand-neon"
                          : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
                      )}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {m.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/70 uppercase">
                  Training Experience
                </label>
                <div className="flex flex-col gap-1.5">
                  {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-4 py-2.5 text-left text-xs font-bold transition border border-white/10",
                        difficulty === diff
                          ? "bg-white/[0.08] text-brand-neon border-brand-neon/40 shadow-inner"
                          : "bg-white/[0.03] text-white/52 hover:bg-white/[0.06]"
                      )}
                    >
                      <span>{diff.charAt(0).toUpperCase() + diff.slice(1)}</span>
                      {difficulty === diff && (
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-neon" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5">
              <Button
                type="button"
                className="w-full h-11 bg-white hover:bg-white/90 text-black font-extrabold"
                onClick={handleGeneratePlan}
                isLoading={isSaving}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {activePlan ? "Regenerate Plan" : "Generate & Save Plan"}
              </Button>
              <p className="mt-2 text-[10px] text-center text-white/30">
                Saves directly to your profile.
              </p>
            </div>
          </div>

          {/* Weekly Schedule Viewer */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
            {activePlan ? (
              <div className="space-y-4">
                {/* 7 Days selector bar */}
                <div className="grid grid-cols-7 gap-1 border-b border-white/5 pb-3">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDay === day.value;
                    const isToday = getTodayDayName() === day.value;
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => setSelectedDay(day.value)}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-lg py-2 transition relative",
                          isSelected
                            ? "bg-white/[0.08] text-white"
                            : "text-white/45 hover:bg-white/[0.03] hover:text-white/80"
                        )}
                      >
                        <span className="text-[10px] font-bold tracking-wider">{day.label}</span>
                        {isToday && (
                          <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-brand-neon" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Day Workout Focus details */}
                {currentDayRoutine ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-brand-neon uppercase">
                          {selectedDay} Routine
                        </p>
                        <h4 className="mt-1 text-base font-bold text-white">
                          {currentDayRoutine.focus}
                        </h4>
                      </div>
                      <span className="rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-xs font-bold text-white/60">
                        {currentDayRoutine.exercises.length} activities
                      </span>
                    </div>

                    {/* Exercises Grid */}
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {currentDayRoutine.exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-lg border border-white/[0.05] bg-black/20 p-3 hover:border-white/[0.1] transition"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-xs font-black text-white/70">
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <p className="text-sm font-bold text-white">{ex.name}</p>
                              <span className="rounded bg-brand-neon/10 border border-brand-neon/20 px-2 py-0.5 text-[10px] font-black text-brand-neon">
                                {ex.sets} sets x {ex.reps}
                              </span>
                            </div>
                            {ex.notes && (
                              <p className="mt-1.5 text-xs leading-relaxed text-white/38">
                                {ex.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Log Completion Button */}
                    <div className="pt-3 border-t border-white/[0.05]">
                      <Button
                        onClick={handleLogWorkoutCompleted}
                        disabled={isLoggingWorkout}
                        className="w-full text-xs h-9.5 gap-2"
                        variant="secondary"
                      >
                        {isLoggingWorkout ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 text-brand-neon" />
                            Log Completion Today
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <HelpCircle className="h-8 w-8 text-white/20" />
                    <p className="mt-2 text-sm font-bold text-white/60">No routine scheduled</p>
                    <p className="mt-1 text-xs text-white/30">Select another day of the week.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <Calendar className="h-10 w-10 text-white/20" />
                <p className="mt-4 text-base font-black text-white">No Active Workout Plan</p>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-white/45">
                  Choose a location (Home or Gym) and your current training level on the left, then click Generate to initialize your weekly plan!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
