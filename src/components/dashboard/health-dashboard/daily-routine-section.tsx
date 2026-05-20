"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlarmClock, ClipboardList, Sun } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { buildDailyRoutine } from "@/lib/daily-routine";
import type { RoutineChecklistId } from "@/lib/daily-routine/types";
import { createClient } from "@/utils/supabase/client";
import { DailyRoutineProgress } from "./daily-routine/daily-routine-progress";
import { RoutineInsightCard } from "./daily-routine/routine-insight-card";
import { RoutineTimeline } from "./daily-routine/routine-timeline";

type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyChecklistState(
  ids: RoutineChecklistId[],
): Record<RoutineChecklistId, boolean> {
  return Object.fromEntries(ids.map((id) => [id, false])) as Record<
    RoutineChecklistId,
    boolean
  >;
}

function mergeChecklistState(
  ids: RoutineChecklistId[],
  source: unknown,
): Record<RoutineChecklistId, boolean> {
  const next = emptyChecklistState(ids);
  if (!source || typeof source !== "object") return next;
  const parsed = source as Record<string, unknown>;
  for (const id of ids) {
    if (typeof parsed[id] === "boolean") {
      next[id] = parsed[id];
    }
  }
  return next;
}

export function DailyRoutineSection() {
  const [metrics, setMetrics] = useState<MetricsRow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<RoutineChecklistId, boolean>>(
    () => ({} as Record<RoutineChecklistId, boolean>),
  );
  const skipNextPersistRef = useRef(false);

  const storageKey = useMemo(() => {
    const uid = userId ?? "pending";
    return `dailyRoutine:${uid}:${todayKey()}`;
  }, [userId]);

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
        setUserId(user.id);

        const { data, error: qErr } = await supabase
          .from("user_metrics")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle<MetricsRow>();

        if (qErr) throw qErr;
        if (cancelled) return;
        setMetrics(data ?? null);
        setLoadState("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load");
        setLoadState("error");
        setMetrics(null);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const plan = useMemo(() => buildDailyRoutine(metrics), [metrics]);

  useEffect(() => {
    if (loadState !== "ready" || !userId) return;
    const ids = plan.checklist.map((c) => c.id);
    const supabase = createClient();

    async function loadChecklist() {
      let next = emptyChecklistState(ids);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any;
        const { data, error: dbErr } = await db
          .from("routine_checklist_logs")
          .select("state")
          .eq("user_id", userId)
          .eq("logged_on", todayKey())
          .maybeSingle();

        if (!dbErr && data?.state) {
          next = mergeChecklistState(ids, data.state);
        } else {
          const raw = window.localStorage.getItem(storageKey);
          if (raw) {
            next = mergeChecklistState(ids, JSON.parse(raw));
          }
        }
      } catch {
        try {
          const raw = window.localStorage.getItem(storageKey);
          if (raw) {
            next = mergeChecklistState(ids, JSON.parse(raw));
          }
        } catch {
          // ignore parse/storage failures
        }
      }

      skipNextPersistRef.current = true;
      queueMicrotask(() => {
        setChecklist(next);
      });
    }

    void loadChecklist();
  }, [loadState, userId, storageKey, plan.checklist]);

  useEffect(() => {
    if (loadState !== "ready" || !userId || plan.checklist.length === 0) return;
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    const supabase = createClient();

    async function persistChecklist() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any;
        await db.from("routine_checklist_logs").upsert(
          {
            user_id: userId,
            logged_on: todayKey(),
            state: checklist,
          },
          { onConflict: "user_id,logged_on" },
        );
      } catch {
        // ignore; local fallback still preserves state on current device
      }
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(checklist));
      } catch {
        // ignore local storage failures
      }
    }

    void persistChecklist();
  }, [checklist, loadState, userId, storageKey, plan.checklist.length]);

  const onToggle = useCallback((id: RoutineChecklistId) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const goalLabel =
    plan.goalMode === "fat_loss"
      ? "Fat loss"
      : plan.goalMode === "muscle_gain"
        ? "Muscle gain"
        : "Maintenance";

  return (
    <section className="glass rounded-lg border border-white/[0.08] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
                Daily routine
              </p>
              <h3 className="mt-2 text-xl font-black text-white">{plan.headline}</h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/52">{plan.subline}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-neon" />
            Goal mode: {goalLabel}
          </div>
        </div>
      </div>

      {loadState === "loading" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
        <p className="mt-6 text-sm text-red-200/90">{error}</p>
      ) : (
        <div className="mt-6 space-y-8">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/40">
                <Sun className="h-4 w-4 text-brand-neon" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                  Morning flow
                </span>
              </div>
              <RoutineTimeline title="Start strong" blocks={plan.morning} />
            </div>
            <DailyRoutineProgress
              items={plan.checklist}
              state={checklist}
              onToggle={onToggle}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <RoutineTimeline title="Meal timing" blocks={plan.mealTiming} />
            <div className="space-y-4">
              <RoutineTimeline title="Water reminders" blocks={plan.hydration.reminders} />
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-white/40">
                {plan.hydration.tip}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <RoutineTimeline title="Workout / movement" blocks={plan.workout} />
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
              <div className="flex items-center gap-2">
                <AlarmClock className="h-4 w-4 text-brand-neon" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                  Sleep schedule
                </p>
              </div>
              <p className="mt-3 text-sm font-bold text-white">
                {plan.sleep.targetHours} target
              </p>
              <p className="mt-2 text-xs text-white/45">
                Wake: <span className="font-semibold text-white/70">{plan.sleep.wakeTarget}</span>
                {" · "}
                Bed: <span className="font-semibold text-white/70">{plan.sleep.bedTarget}</span>
              </p>
              <p className="mt-3 text-xs leading-relaxed text-white/38">
                {plan.sleep.rationale}
              </p>
              <p className="mt-3 text-[10px] text-white/28">
                Sleep times are estimates from your activity and goal profile—not a medical sleep
                prescription.
              </p>
            </div>
          </div>

          {plan.goalCards.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                Goal-aware focus
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {plan.goalCards.map((c) => (
                  <RoutineInsightCard key={c.id} card={c} />
                ))}
              </div>
            </div>
          ) : null}

          {plan.conditionCards.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                Condition & preference signals
              </p>
              <p className="mt-1 text-[11px] text-white/28">
                Diabetes uses your goal/category. Skin, joint, and hair tips activate from
                food_preferences keywords (e.g. “acne”, “knee”, “hair”) or training context.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {plan.conditionCards.map((c) => (
                  <RoutineInsightCard key={c.id} card={c} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
