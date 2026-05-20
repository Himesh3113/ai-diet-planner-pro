import {
  buildNutritionTargets,
  computeMaintenanceCalories,
} from "@/lib/meal-recommendations/nutrition-from-metrics";
import type {
  AnalyticsBadge,
  HealthNotesRow,
  MetricsRow,
  ProfileRow,
  WeeklyAnalyticsModel,
  WeeklyDayPoint,
} from "./types";

type ProfileSlice = Pick<ProfileRow, "created_at" | "onboarding_completed">;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseIso(iso: string) {
  return new Date(iso);
}

/** Last N calendar days ending today (local), oldest first */
export function rollingDayKeys(count: number, now = new Date()): Date[] {
  const today = startOfDay(now);
  const out: Date[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
}

function weekdayShort(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(a: Date, b: Date) {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.max(0, Math.round(ms / (24 * 60 * 60 * 1000)));
}

function weekStartMonday(now = new Date()) {
  const d = startOfDay(now);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function isOnOrAfter(iso: string, boundary: Date) {
  return parseIso(iso).getTime() >= boundary.getTime();
}

function noteHasContent(s: string | null | undefined) {
  return typeof s === "string" && s.trim().length > 0;
}

function completionParts(args: {
  targetsOk: boolean;
  proteinOk: boolean;
  hydrationOk: boolean;
  goalOk: boolean;
  activityOk: boolean;
  metricsFresh: boolean;
  notesFresh: boolean;
}) {
  const parts: { label: string; weight: number; met: boolean }[] = [
    { label: "Energy targets", weight: 22, met: args.targetsOk },
    { label: "Protein target", weight: 18, met: args.proteinOk },
    { label: "Hydration target", weight: 15, met: args.hydrationOk },
    { label: "Goal set", weight: 12, met: args.goalOk },
    { label: "Activity set", weight: 10, met: args.activityOk },
    { label: "Profile touched this week", weight: 13, met: args.metricsFresh },
    { label: "Health notes this week", weight: 10, met: args.notesFresh },
  ];
  const sum = parts.reduce((acc, p) => acc + (p.met ? p.weight : 0), 0);
  return { parts, percent: Math.min(100, Math.round(sum)) };
}

export function buildWeeklyAnalyticsModel(args: {
  metrics: MetricsRow | null;
  profile: ProfileSlice | null;
  notes: HealthNotesRow | null;
  now?: Date;
}): WeeklyAnalyticsModel {
  const now = args.now ?? new Date();
  const { metrics, profile, notes } = args;

  const targets = buildNutritionTargets(metrics);
  const maintenance = computeMaintenanceCalories(metrics);

  const daysDates = rollingDayKeys(7, now);
  const days: WeeklyDayPoint[] = daysDates.map((d) => ({
    dateKey: dateKey(d),
    label: weekdayShort(d),
    calorieTarget: targets.dailyCalories,
    maintenanceCalories: maintenance,
    proteinTargetG: targets.dailyProteinG,
    hydrationTargetMl: targets.hydrationMl,
    bmi: targets.bmi,
  }));

  const ws = weekStartMonday(now);
  const metricsUpdatedThisWeek =
    metrics?.updated_at != null && isOnOrAfter(metrics.updated_at, ws);
  const notesUpdatedThisWeek =
    notes?.updated_at != null && isOnOrAfter(notes.updated_at, ws);

  const targetsOk = targets.dailyCalories != null;
  const proteinOk = targets.dailyProteinG != null;
  const hydrationOk = targets.hydrationMl != null;
  const goalOk = metrics?.goal != null;
  const activityOk = metrics?.activity_level != null;

  const { parts: completionBreakdown, percent: completionPercent } =
    completionParts({
      targetsOk,
      proteinOk,
      hydrationOk,
      goalOk,
      activityOk,
      metricsFresh: metricsUpdatedThisWeek,
      notesFresh: notesUpdatedThisWeek,
    });

  /** Planning consistency proxy (true adherence requires logged meals — not in schema). */
  let proteinConsistencyPercent: number | null = null;
  if (proteinOk && targets.dailyProteinG != null) {
    proteinConsistencyPercent = metricsUpdatedThisWeek ? 96 : 82;
  }

  const joined = profile?.created_at
    ? daysBetween(parseIso(profile.created_at), now)
    : 0;

  const badges: AnalyticsBadge[] = [
    {
      id: "foundation",
      title: "Foundation",
      description: "Profile anchor date recorded — build streaks from here.",
      unlocked: profile?.created_at != null,
    },
    {
      id: "targets_ready",
      title: "Targets ready",
      description: "Height, weight & age unlock calorie math.",
      unlocked: targetsOk,
    },
    {
      id: "protein_track",
      title: "Protein lock",
      description: "Daily protein estimate available.",
      unlocked: proteinOk,
    },
    {
      id: "hydration_track",
      title: "Hydration clarity",
      description: "Weight-based fluid target computed.",
      unlocked: hydrationOk,
    },
    {
      id: "week_tune",
      title: "Weekly tune-up",
      description: "Profile saved at least once this week.",
      unlocked: metricsUpdatedThisWeek,
    },
    {
      id: "journal_pulse",
      title: "Journal pulse",
      description: "Health notes updated this week.",
      unlocked: notesUpdatedThisWeek,
    },
    {
      id: "allergy_aware",
      title: "Allergy aware",
      description: "Allergies recorded for safer meal picks.",
      unlocked: (targets.allergies?.length ?? 0) > 0,
    },
    {
      id: "diabetes_focus",
      title: "Glucose focus",
      description: "Diabetes-oriented goal selected.",
      unlocked:
        metrics?.goal === "diabetic_diet" ||
        metrics?.non_gym_category === "diabetic_diet",
    },
  ];

  const insights: string[] = [];

  if (
    metrics?.goal === "diabetic_diet" ||
    metrics?.non_gym_category === "diabetic_diet"
  ) {
    insights.push(
      "Diabetes-friendly rhythm: distribute carbohydrates evenly and pair with fiber or protein to blunt glucose swings.",
    );
  }

  const allergyCount = targets.allergies?.length ?? 0;
  if (allergyCount > 0) {
    insights.push(
      `Allergy guardrails active (${allergyCount} listed). Cross-check packaged foods and dining venues.`,
    );
  }

  if (noteHasContent(notes?.knee_pain)) {
    insights.push(
      "Joint-support nutrition: emphasize omega-3 sources, colorful plants, and steady protein for tissue upkeep.",
    );
  }

  if (noteHasContent(notes?.acne)) {
    insights.push(
      "Skin-aware eating: favor lower glycemic-load meals and consistent meal timing while monitoring personal triggers.",
    );
  }

  if (noteHasContent(notes?.hair_fall)) {
    insights.push(
      "Hair-health nutrients: meet your protein target and discuss persistent shedding with a clinician if needed.",
    );
  }

  if (noteHasContent(notes?.migraine)) {
    insights.push(
      "Migraine hygiene: maintain hydration alongside your fluid target and avoid long fasting windows when possible.",
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Complete your profile and add condition notes to unlock more tailored weekly insights.",
    );
  }

  const chartFootnote =
    "Charts show your current profile projected across the last 7 days. Historical calorie, protein, or hydration logs are not stored server-side in this schema — trends reflect baseline targets from your latest metrics.";

  const weekLabel = `${dateKey(daysDates[0])} → ${dateKey(daysDates[6])}`;

  return {
    weekLabel,
    days,
    completionPercent,
    completionBreakdown,
    proteinConsistencyPercent,
    badges,
    insights,
    streakDaysSinceSignup: joined,
    metricsUpdatedThisWeek,
    notesUpdatedThisWeek,
    chartFootnote,
  };
}
