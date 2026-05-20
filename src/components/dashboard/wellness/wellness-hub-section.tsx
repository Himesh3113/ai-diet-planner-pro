"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Brain,
  Dumbbell,
  HeartPulse,
  Loader2,
  Moon,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { getConditionProfile } from "@/lib/wellness/condition-profiles";
import { WELLNESS_CATALOG_BY_KEY } from "@/lib/wellness/catalog";
import type { WellnessConditionRow } from "@/lib/wellness/db";
import type {
  ConditionRecoveryStats,
  WellnessConditionProfile,
  WellnessFilter,
  WellnessInsight,
  WellnessScores,
  WellnessSeverity,
  WellnessStatus,
  WellnessTrendPoint,
} from "@/lib/wellness/types";
import { cn } from "@/lib/utils";
import { WellnessHubDetailModal } from "./wellness-hub-detail-modal";
import { WellnessScoreRing } from "./wellness-score-ring";
import { WellnessTrendCharts } from "./wellness-trend-charts";

const FILTERS: { key: WellnessFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "recovery", label: "Recovery" },
  { key: "critical", label: "Critical" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "fitness", label: "Fitness" },
  { key: "skin", label: "Skin" },
  { key: "mental", label: "Mental Wellness" },
];

const STATUS_STYLES: Record<WellnessStatus, string> = {
  monitoring: "border-sky-400/40 bg-sky-500/10 text-sky-300",
  improving: "border-brand-neon/40 bg-brand-neon/10 text-brand-neon",
  stable: "border-white/20 bg-white/5 text-white/60",
  critical: "border-red-400/40 bg-red-500/10 text-red-300",
  recovered: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
};

const CATEGORY_ICON = {
  skin: Sparkles,
  fitness: Dumbbell,
  recovery: HeartPulse,
  mental: Brain,
  sleep: Moon,
  digestive: HeartPulse,
} as const;

type HubPayload = {
  conditions: WellnessConditionRow[];
  profiles?: Record<string, WellnessConditionProfile>;
  scores: WellnessScores;
  insights: WellnessInsight[];
  recoveryStats?: Record<string, ConditionRecoveryStats>;
  trends: {
    hydration: WellnessTrendPoint[];
    sleep: WellnessTrendPoint[];
    recovery: WellnessTrendPoint[];
    energy: WellnessTrendPoint[];
  };
  recommendations: {
    id: string;
    wellness_condition_id: string;
    title: string;
    content: string;
    category: string;
  }[];
};

const LOAD_TIMEOUT_MS = 14_000;

function matchesFilter(row: WellnessConditionRow, filter: WellnessFilter): boolean {
  const meta = WELLNESS_CATALOG_BY_KEY[row.condition_key];
  if (filter === "all") return true;
  if (filter === "active") return row.status !== "recovered";
  if (filter === "recovery") return meta?.category === "recovery" || row.status === "improving";
  if (filter === "critical") return row.status === "critical";
  if (filter === "lifestyle") return meta?.filterTags.includes("lifestyle") ?? false;
  if (filter === "fitness") return meta?.category === "fitness";
  if (filter === "skin") return meta?.category === "skin";
  if (filter === "mental") return meta?.category === "mental";
  return true;
}

export function WellnessHubSection() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<WellnessFilter>("all");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<HubPayload | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState("acne");
  const [formSeverity, setFormSeverity] = useState<WellnessSeverity>("moderate");
  const [formStatus, setFormStatus] = useState<WellnessStatus>("monitoring");
  const [formSymptoms, setFormSymptoms] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [detailRow, setDetailRow] = useState<WellnessConditionRow | null>(null);
  const loadId = useRef(0);

  const loadHub = useCallback(async () => {
    const id = ++loadId.current;
    setLoadState("loading");
    setLoadError(null);
    const timeout = window.setTimeout(() => {
      if (loadId.current !== id) return;
      setLoadState("error");
      setLoadError("Loading timed out. Check connection and retry.");
    }, LOAD_TIMEOUT_MS);

    try {
      const res = await fetch("/api/wellness", { cache: "no-store" });
      const json = (await res.json()) as HubPayload & { error?: string };
      if (loadId.current !== id) return;
      if (!res.ok) throw new Error(json.error ?? "Failed to load Wellness Hub.");
      setData({
        conditions: json.conditions ?? [],
        profiles: json.profiles,
        scores: json.scores,
        insights: json.insights ?? [],
        recoveryStats: json.recoveryStats,
        trends: json.trends ?? {
          hydration: [],
          sleep: [],
          recovery: [],
          energy: [],
        },
        recommendations: json.recommendations ?? [],
      });
      setLoadState("ready");
    } catch (e) {
      if (loadId.current !== id) return;
      const msg = e instanceof Error ? e.message : "Load failed.";
      setLoadError(msg);
      setLoadState("error");
      toast({ title: "Wellness Hub", description: msg, variant: "error" });
    } finally {
      window.clearTimeout(timeout);
    }
  }, [toast]);

  useEffect(() => {
    let active = true;
    const t = window.setTimeout(() => {
      if (active) void loadHub();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(t);
      loadId.current += 1;
    };
  }, [loadHub]);

  const filtered = useMemo(
    () => (data?.conditions ?? []).filter((c) => matchesFilter(c, filter)),
    [data?.conditions, filter],
  );

  const resetForm = () => {
    setEditingId(null);
    setFormKey("acne");
    setFormSeverity("moderate");
    setFormStatus("monitoring");
    setFormSymptoms("");
    setFormNotes("");
  };

  const openEdit = (row: WellnessConditionRow) => {
    setEditingId(row.id);
    setFormKey(row.condition_key);
    setFormSeverity(row.severity as WellnessSeverity);
    setFormStatus(row.status as WellnessStatus);
    setFormSymptoms((row.symptoms ?? []).join(", "));
    setFormNotes(row.notes ?? "");
    setShowAdd(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId ?? undefined,
          conditionKey: formKey,
          severity: formSeverity,
          status: formStatus,
          symptoms: formSymptoms
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          notes: formNotes || null,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Save failed.");
      toast({
        title: editingId ? "Condition updated" : "Condition added",
        description: "Wellness Hub synced with Supabase.",
        variant: "success",
      });
      setShowAdd(false);
      resetForm();
      await loadHub();
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Could not save.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAction = async (action: "delete" | "recovered", id: string) => {
    try {
      const res = await fetch("/api/wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Action failed.");
      await loadHub();
      toast({
        title: action === "recovered" ? "Marked recovered" : "Condition removed",
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Action failed",
        description: e instanceof Error ? e.message : "Try again.",
        variant: "error",
      });
    }
  };

  if (loadState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-brand-neon" />
        <p className="mt-4 text-sm text-white/40">Loading Wellness Hub…</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="flex flex-col items-center rounded-lg border border-red-500/20 bg-red-500/5 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-400/80" />
        <p className="mt-4 text-lg font-black text-white">Could not load Wellness Hub</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/45">{loadError}</p>
        <Button className="mt-6 gap-2" variant="secondary" onClick={() => void loadHub()}>
          <RotateCcw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const scores = data?.scores;

  return (
    <div className="space-y-8">
      {detailRow && (
        <WellnessHubDetailModal
          row={detailRow}
          recovery={data?.recoveryStats?.[detailRow.id]}
          onClose={() => setDetailRow(null)}
          onEdit={() => {
            openEdit(detailRow);
            setDetailRow(null);
          }}
          onRecovered={() => {
            void handleAction("recovered", detailRow.id);
            setDetailRow(null);
          }}
          onDelete={() => {
            void handleAction("delete", detailRow.id);
            setDetailRow(null);
          }}
        />
      )}
      {/* Hero scores */}
      <section className="glass relative overflow-hidden rounded-lg border border-white/[0.08] p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-neon/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
              AI Wellness & Lifestyle
            </p>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Wellness Hub</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
              Track skin, recovery, energy, sleep, and lifestyle signals — personalized
              across diet, workouts, hydration, and AI coaching.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/dashboard/diet-planner"
                className="rounded-full border border-brand-neon/30 bg-brand-neon/10 px-3 py-1 text-[10px] font-bold text-brand-neon"
              >
                Diet Planner adapts to your conditions →
              </Link>
            </div>
          </div>
          {scores && (
            <div className="rounded-lg border border-brand-neon/25 bg-gradient-to-br from-brand-neon/15 to-transparent px-6 py-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">
                Overall Wellness
              </p>
              <p className="mt-1 text-4xl font-black text-brand-neon">{scores.overall}</p>
            </div>
          )}
        </div>
        {scores && (
          <div className="relative mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
            <WellnessScoreRing label="Recovery" value={scores.recovery} />
            <WellnessScoreRing label="Energy" value={scores.energy} accent="text-amber-300" />
            <WellnessScoreRing label="Sleep" value={scores.sleep} accent="text-sky-300" />
            <WellnessScoreRing label="Skin" value={scores.skin} accent="text-fuchsia-300" />
            <WellnessScoreRing label="Nutrition" value={scores.nutrition} accent="text-emerald-300" />
            <WellnessScoreRing label="Stress" value={scores.stress} accent="text-violet-300" />
          </div>
        )}
      </section>

      {/* AI Insights */}
      {(data?.insights.length ?? 0) > 0 && (
        <section className="grid gap-3 sm:grid-cols-2">
          {data!.insights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-lg border p-4",
                insight.tone === "positive" && "border-brand-neon/20 bg-brand-neon/5",
                insight.tone === "alert" && "border-red-400/20 bg-red-500/5",
                insight.tone === "neutral" && "border-white/10 bg-white/[0.03]",
              )}
            >
              <p className="flex items-start gap-2 text-sm text-white/80">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-neon" />
                {insight.message}
              </p>
            </motion.div>
          ))}
        </section>
      )}

      {/* Trends */}
      {data?.trends && <WellnessTrendCharts {...data.trends} />}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition",
                filter === f.key
                  ? "border-brand-neon/50 bg-brand-neon/15 text-brand-neon"
                  : "border-white/10 text-white/45 hover:text-white",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="h-10 border border-white/10" onClick={() => void loadHub()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            className="h-10 bg-white font-bold text-black hover:bg-white/90"
            onClick={() => {
              resetForm();
              setShowAdd(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add condition
          </Button>
        </div>
      </div>

      {/* Add / Edit form */}
      {showAdd && (
        <div className="glass rounded-lg border border-white/[0.08] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">
            {editingId ? "Edit wellness condition" : "Add wellness condition"}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-bold text-white/60">
              Condition
              <select
                value={formKey}
                disabled={!!editingId}
                onChange={(e) => setFormKey(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              >
                {Object.values(WELLNESS_CATALOG_BY_KEY).map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold text-white/60">
              Severity
              <select
                value={formSeverity}
                onChange={(e) => setFormSeverity(e.target.value as WellnessSeverity)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </label>
            <label className="block text-xs font-bold text-white/60">
              Status
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as WellnessStatus)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              >
                <option value="monitoring">Monitoring</option>
                <option value="improving">Improving</option>
                <option value="stable">Stable</option>
                <option value="critical">Critical</option>
                <option value="recovered">Recovered</option>
              </select>
            </label>
            <label className="block text-xs font-bold text-white/60 sm:col-span-2">
              Symptoms (comma-separated)
              <input
                value={formSymptoms}
                onChange={(e) => setFormSymptoms(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                placeholder="e.g. fatigue, flare-ups"
              />
            </label>
            <label className="block text-xs font-bold text-white/60 sm:col-span-2">
              Notes
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button isLoading={isSaving} onClick={() => void handleSave()}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => { setShowAdd(false); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Condition cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-white/15 py-20 text-center">
          <HeartPulse className="h-12 w-12 text-white/20" />
          <p className="mt-4 text-lg font-black text-white">No wellness conditions yet</p>
          <p className="mt-2 max-w-sm text-sm text-white/45">
            Add a condition to unlock personalized diet, workout, sleep, and recovery
            guidance across the platform.
          </p>
          <Button className="mt-6" onClick={() => { resetForm(); setShowAdd(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add your first condition
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((row, index) => {
            const profile =
              data?.profiles?.[row.condition_key] ?? getConditionProfile(row.condition_key);
            const meta = WELLNESS_CATALOG_BY_KEY[row.condition_key];
            const Icon = CATEGORY_ICON[profile?.category ?? meta?.category ?? "recovery"] ?? HeartPulse;
            const recovery = data?.recoveryStats?.[row.id];
            return (
              <motion.article
                key={row.id}
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => setDetailRow(row)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDetailRow(row);
                  }
                }}
                className="glass group cursor-pointer rounded-lg border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent p-5 transition hover:border-brand-neon/30 hover:shadow-[0_0_24px_rgba(57,255,20,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-neon/10 text-brand-neon">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">
                        {profile?.title ?? meta?.title ?? row.condition_key}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-white/45">
                        {profile?.overview ?? meta?.summary}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase",
                      STATUS_STYLES[row.status as WellnessStatus],
                    )}
                  >
                    {row.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase text-white/40">
                  <span className="rounded-full border border-white/10 px-2 py-0.5">
                    {row.severity}
                  </span>
                  <span className="rounded-full border border-white/10 px-2 py-0.5">
                    Updated {new Date(row.updated_at).toLocaleDateString()}
                  </span>
                  {(recovery?.streakDays ?? 0) > 0 && (
                    <span className="rounded-full border border-brand-neon/30 bg-brand-neon/10 px-2 py-0.5 text-brand-neon">
                      {recovery?.streakDays}d streak
                    </span>
                  )}
                </div>

                {/* Recovery ring */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative h-14 w-14">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="22" className="stroke-white/10" fill="none" strokeWidth="6" />
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        className="stroke-brand-neon"
                        fill="none"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={138}
                        strokeDashoffset={138 - (row.recovery_progress / 100) * 138}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-brand-neon">
                      {row.recovery_progress}%
                    </span>
                  </div>
                  <div className="grid flex-1 grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-black/30 px-2 py-1.5">
                      <span className="text-white/35">Hydration</span>
                      <p className="font-bold text-white">{row.hydration_target_ml} ml</p>
                    </div>
                    <div className="rounded-md bg-black/30 px-2 py-1.5">
                      <span className="text-white/35">Sleep</span>
                      <p className="font-bold text-white">{row.sleep_target_hours}h</p>
                    </div>
                    <div className="rounded-md bg-black/30 px-2 py-1.5">
                      <span className="text-white/35">Stress impact</span>
                      <p className="font-bold text-white">{row.stress_impact}%</p>
                    </div>
                    <div className="rounded-md bg-black/30 px-2 py-1.5">
                      <span className="text-white/35">Energy impact</span>
                      <p className="font-bold text-white">{row.energy_impact}%</p>
                    </div>
                    <div className="rounded-md bg-black/30 px-2 py-1.5 col-span-2">
                      <span className="text-white/35">Skin / body impact</span>
                      <p className="font-bold text-white">{row.skin_impact}%</p>
                    </div>
                  </div>
                </div>

                {(row.symptoms?.length ?? 0) > 0 && (
                  <p className="mt-3 text-xs text-white/55">
                    <span className="font-bold text-white/70">Symptoms:</span>{" "}
                    {row.symptoms.join(", ")}
                  </p>
                )}

                {profile && (
                  <div className="mt-4 space-y-2 text-xs">
                    <p className="line-clamp-2 text-white/50">
                      {profile.aiInsights[0]}
                    </p>
                    <p>
                      <span className="font-bold text-brand-neon">Top foods:</span>{" "}
                      {profile.recommendedFoods
                        .slice(0, 4)
                        .map((f) => f.name)
                        .join(" · ")}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                      Tap for full profile, supplements & recovery charts →
                    </p>
                  </div>
                )}

                <div
                  className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => openEdit(row)}>
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  {row.status !== "recovered" && (
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-xs text-emerald-300"
                      onClick={() => void handleAction("recovered", row.id)}
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Recovered
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-xs text-red-300"
                    onClick={() => void handleAction("delete", row.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
