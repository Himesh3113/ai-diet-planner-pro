"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Utensils,
  Pill,
  Clock,
  TrendingUp,
  Flame,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { getConditionProfile, getEstimatedTimeline, getSeverityExplanation } from "@/lib/wellness/condition-profiles";
import { mealAdjustmentsFromProfile } from "@/lib/wellness/insights";
import type { WellnessConditionRow } from "@/lib/wellness/db";
import type { ConditionRecoveryStats, WellnessConditionProfile, WellnessSeverity } from "@/lib/wellness/types";
import { cn } from "@/lib/utils";

export function WellnessHubDetailModal({
  row,
  recovery,
  onClose,
  onEdit,
  onRecovered,
  onDelete,
}: {
  row: WellnessConditionRow;
  recovery?: ConditionRecoveryStats;
  onClose: () => void;
  onEdit: () => void;
  onRecovered: () => void;
  onDelete: () => void;
}) {
  const profile = getConditionProfile(row.condition_key);
  const severity = row.severity as WellnessSeverity;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!profile) return null;

  const mealTips = mealAdjustmentsFromProfile(profile);
  const trend = recovery?.weeklyTrend ?? [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          className="glass max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-white/[0.1] sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-[#07070b]/95 px-5 py-4 backdrop-blur-xl">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-neon">
                Condition insights
              </p>
              <h2 className="text-xl font-black text-white">{profile.title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 p-2 text-white/60 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            <ProfileSection title="Overview" content={profile.overview} />
            <div className="grid gap-4 sm:grid-cols-2">
              <ListSection title="Possible causes" items={profile.possibleCauses} />
              <ListSection title="Common symptoms" items={profile.commonSymptoms} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatBox label="Severity" value={severity} sub={getSeverityExplanation(profile, severity)} />
              <StatBox label="Recovery difficulty" value={profile.recoveryDifficulty} />
              <StatBox
                label="Est. timeline"
                value={getEstimatedTimeline(profile, severity)}
              />
            </div>

            <p className="text-sm text-white/55">{profile.lifestyleImpact}</p>

            <ImpactGrid profile={profile} row={row} />

            <ListSection title="Daily precautions" items={profile.dailyPrecautions} />

            <section>
              <SectionTitle icon={Utensils} label="Recommended foods (up to 7)" />
              <div className="mt-3 space-y-3">
                {profile.recommendedFoods.map((food) => (
                  <div
                    key={food.name}
                    className="rounded-lg border border-brand-neon/15 bg-brand-neon/5 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-bold text-white">{food.name}</p>
                      <span className="text-[10px] text-white/40">{food.benefit}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/55">{food.whyItHelps}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold text-white/45">
                      <span>P {food.proteinG}g</span>
                      <span>C {food.carbsG}g</span>
                      <span>F {food.fatsG}g</span>
                      <span>{food.micronutrients.join(" · ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle icon={AlertTriangle} label="Foods to avoid" />
              <ul className="mt-3 space-y-2">
                {profile.foodsToAvoid.map((f) => (
                  <li
                    key={f.name}
                    className="rounded-lg border border-red-500/15 bg-red-500/5 px-3 py-2 text-xs"
                  >
                    <span className="font-bold text-red-200/90">{f.name}</span>
                    <span className="text-white/50"> — {f.reason}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <SectionTitle icon={Pill} label="Supplement guidance" />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {profile.supplements.map((s) => (
                  <div key={s.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-sm font-bold text-white">{s.name}</p>
                    <p className="mt-1 text-[10px] uppercase text-brand-neon">{s.timing}</p>
                    <p className="mt-1 text-xs text-white/45">{s.purpose}</p>
                    <p className="mt-1 text-xs text-white/55">{s.benefits}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle icon={Clock} label="Daily wellness routine" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {profile.dailyRoutine.map((slot) => (
                  <div
                    key={slot.period}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-neon">
                      {slot.period}
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-white/60">
                      {slot.items.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {recovery && (
              <section className="rounded-lg border border-white/[0.08] p-4">
                <SectionTitle icon={TrendingUp} label="Recovery analytics" />
                <div className="mt-3 flex flex-wrap gap-4">
                  <div>
                    <p className="text-[10px] text-white/40">Progress</p>
                    <p className="text-2xl font-black text-brand-neon">{row.recovery_progress}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40">Streak</p>
                    <p className="text-2xl font-black text-white">{recovery.streakDays} days</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40">Weekly change</p>
                    <p
                      className={cn(
                        "text-2xl font-black",
                        recovery.improvementDelta >= 0 ? "text-emerald-400" : "text-red-300",
                      )}
                    >
                      {recovery.improvementDelta >= 0 ? "+" : ""}
                      {recovery.improvementDelta}%
                    </p>
                  </div>
                </div>
                {recovery.indicators.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recovery.indicators.map((ind) => (
                      <span
                        key={ind}
                        className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-white/50"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                )}
                {trend.length > 1 && (
                  <div className="mt-4 h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="date" hide />
                        <YAxis domain={[0, 100]} hide />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(8,8,12,0.92)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 8,
                            fontSize: 11,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#39FF14"
                          strokeWidth={2}
                          dot={{ r: 2, fill: "#39FF14" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-lg border border-brand-neon/20 bg-brand-neon/5 p-4">
              <SectionTitle icon={Sparkles} label="AI insights & meal adjustments" />
              <ul className="mt-3 space-y-2">
                {profile.aiInsights.map((msg) => (
                  <li key={msg} className="text-xs text-white/65">
                    • {msg}
                  </li>
                ))}
              </ul>
              <ul className="mt-3 space-y-1 border-t border-white/10 pt-3">
                {mealTips.map((tip) => (
                  <li key={tip} className="text-xs text-white/50">
                    → {tip}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/diet-planner"
                className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-brand-neon"
              >
                <Flame className="h-3.5 w-3.5" />
                Open Diet Planner with these adjustments
              </Link>
            </section>
          </div>

          <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-white/[0.08] bg-[#07070b]/95 p-4 backdrop-blur-xl">
            <Button variant="secondary" onClick={onEdit}>
              Edit condition
            </Button>
            {row.status !== "recovered" && (
              <Button variant="ghost" className="text-emerald-300" onClick={onRecovered}>
                Mark recovered
              </Button>
            )}
            <Button variant="ghost" className="text-red-300" onClick={onDelete}>
              Delete
            </Button>
            <Button variant="ghost" className="ml-auto" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: typeof Sparkles; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-brand-neon" />
      <p className="text-xs font-black uppercase tracking-widest text-white/50">{label}</p>
    </div>
  );
}

function ProfileSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{content}</p>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-[10px] font-bold uppercase text-white/40">{title}</p>
      <ul className="mt-2 space-y-1 text-xs text-white/55">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function StatBox({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
      <p className="text-[10px] font-bold uppercase text-white/35">{label}</p>
      <p className="mt-1 text-sm font-bold capitalize text-white">{value}</p>
      {sub && <p className="mt-1 text-[10px] leading-relaxed text-white/45">{sub}</p>}
    </div>
  );
}

function ImpactGrid({
  profile,
  row,
}: {
  profile: WellnessConditionProfile;
  row: WellnessConditionRow;
}) {
  const items = [
    { label: "Stress", text: profile.impacts.stress, pct: row.stress_impact },
    { label: "Sleep", text: profile.impacts.sleep, pct: row.sleep_target_hours },
    { label: "Workout", text: profile.impacts.workout },
    { label: "Hydration", text: profile.impacts.hydration, pct: row.hydration_target_ml },
    { label: "Nutrition", text: profile.impacts.nutrition },
    { label: "Skin/body", text: `Impact score ${row.skin_impact}%` },
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-white/[0.06] p-3 text-xs">
          <p className="font-bold text-brand-neon">{item.label}</p>
          <p className="mt-1 text-white/55">{item.text}</p>
        </div>
      ))}
    </div>
  );
}
