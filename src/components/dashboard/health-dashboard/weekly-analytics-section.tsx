"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Droplets,
  Flame,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { buildWeeklyAnalyticsModel } from "@/lib/weekly-analytics";
import type { HealthNotesRow } from "@/lib/weekly-analytics/types";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { AnalyticsBadgeGrid } from "./analytics/analytics-badge-grid";
import { CompletionRing } from "./analytics/completion-ring";
import { WeeklyTrendCharts } from "./analytics/weekly-trend-charts";

type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];
type ProfileSlice = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "created_at" | "onboarding_completed"
>;

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

export function WeeklyAnalyticsSection() {
  const [metrics, setMetrics] = useState<MetricsRow | null>(null);
  const [profile, setProfile] = useState<ProfileSlice | null>(null);
  const [notes, setNotes] = useState<HealthNotesRow | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

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

        const [{ data: m, error: mErr }, { data: p, error: pErr }, { data: n, error: nErr }] =
          await Promise.all([
            supabase
              .from("user_metrics")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle<MetricsRow>(),
            supabase
              .from("profiles")
              .select("created_at, onboarding_completed")
              .eq("id", user.id)
              .maybeSingle<ProfileSlice>(),
            supabase
              .from("health_condition_notes")
              .select(
                "user_id, acne, migraine, knee_pain, hair_fall, created_at, updated_at",
              )
              .eq("user_id", user.id)
              .maybeSingle<HealthNotesRow>(),
          ]);

        if (mErr) throw mErr;
        if (pErr) throw pErr;
        if (cancelled) return;
        setMetrics(m ?? null);
        setProfile(p ?? null);
        setNotes(nErr && optionalNotesUnavailable(nErr) ? null : (n ?? null));
        if (nErr && !optionalNotesUnavailable(nErr)) {
          setError(
            "Health notes could not be loaded, so analytics are using profile metrics only.",
          );
        }
        setLoadState("ready");
      } catch (e) {
        if (cancelled) return;
        const message =
          e instanceof Error ? e.message : "Profile analytics could not be loaded.";
        if (message === "Not authenticated") {
          setError("Sign in again to load weekly analytics.");
          setLoadState("error");
          return;
        }
        setMetrics(null);
        setProfile(null);
        setNotes(null);
        setError(`Using default analytics because profile metrics failed: ${message}`);
        setLoadState("ready");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const model = useMemo(
    () =>
      loadState === "ready"
        ? buildWeeklyAnalyticsModel({ metrics, profile, notes })
        : null,
    [loadState, metrics, profile, notes],
  );

  const hasTargets = Boolean(model?.days[0]?.calorieTarget != null);

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
                Nutrition & health pulse
              </h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/52">
            Seven-day view derived from your Supabase profile and condition notes—no
            external services.
          </p>
          {model ? (
            <p className="mt-2 text-[11px] font-medium text-white/30">
              Window {model.weekLabel}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-10 shrink-0 gap-2 self-start sm:self-auto"
          disabled={loadState === "loading"}
          onClick={() => setTick((t) => t + 1)}
        >
          <Sparkles className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {loadState === "loading" ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-white/[0.07] bg-white/[0.03] p-6"
            >
              <div className="mx-auto h-36 w-36 rounded-full bg-white/[0.06]" />
            </div>
          ))}
        </div>
      ) : loadState === "error" ? (
        <div className="mt-6 rounded-lg border border-red-300/15 bg-red-400/[0.06] p-4">
          <p className="text-sm font-semibold text-red-100">
            {error ?? "Weekly analytics could not load."}
          </p>
        </div>
      ) : model ? (
        <div className="mt-6 space-y-8">
          {error ? (
            <div className="rounded-lg border border-amber-300/15 bg-amber-300/[0.05] px-4 py-3 text-xs leading-relaxed text-amber-100/85">
              {error}
            </div>
          ) : null}
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
            <div className="flex justify-center lg:justify-start">
              <CompletionRing
                percent={model.completionPercent}
                subtitle="Weighted checklist: targets, activity, and recent updates."
              />
            </div>

            <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                Score breakdown
              </p>
              <ul className="mt-3 space-y-2">
                {model.completionBreakdown.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-white/45">{row.label}</span>
                    <span
                      className={
                        row.met ? "font-bold text-brand-neon" : "text-white/25"
                      }
                    >
                      {row.met ? "✓" : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
              <div className="flex items-start gap-2">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-brand-neon" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                    Protein planning score
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">
                    Proxy for target stability—true adherence needs meal logs (not stored
                    server-side).
                  </p>
                </div>
              </div>
              {model.proteinConsistencyPercent != null ? (
                <>
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-3xl font-black tabular-nums text-white">
                      {model.proteinConsistencyPercent}
                      <span className="text-lg text-white/35">%</span>
                    </span>
                    <Flame className="h-8 w-8 text-brand-neon/40" aria-hidden />
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-brand-neon transition-all"
                      style={{
                        width: `${Math.min(100, model.proteinConsistencyPercent)}%`,
                      }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-xs text-white/38">
                  Set weight and goal to estimate protein consistency.
                </p>
              )}

              <div className="flex flex-wrap gap-3 border-t border-white/[0.06] pt-3 text-[11px] text-white/38">
                <span className="inline-flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-brand-neon" />
                  Day {model.streakDaysSinceSignup + 1} on platform
                </span>
                <span className="inline-flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-brand-neon" />
                  {model.metricsUpdatedThisWeek
                    ? "Profile touched this week"
                    : "Refresh profile when numbers change"}
                </span>
              </div>
            </div>
          </div>

          <WeeklyTrendCharts model={model} hasTargets={hasTargets} />

          <p className="text-[11px] leading-relaxed text-white/32">{model.chartFootnote}</p>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
              Condition-aware insights
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/55">
              {model.insights.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-neon/80" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
              Progress badges
            </p>
            <div className="mt-3">
              <AnalyticsBadgeGrid badges={model.badges} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
