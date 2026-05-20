import type { Database } from "@/lib/supabase/types";

export type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type ProfileAnalyticsSlice = Pick<
  ProfileRow,
  "created_at" | "onboarding_completed"
>;
/** Aggregated condition notes (one row per user in legacy schema, or merged from rows). */
export type HealthNotesRow = {
  acne?: string | null;
  migraine?: string | null;
  knee_pain?: string | null;
  hair_fall?: string | null;
  updated_at?: string | null;
};

export type WeeklyDayPoint = {
  dateKey: string;
  label: string;
  calorieTarget: number | null;
  maintenanceCalories: number | null;
  proteinTargetG: number | null;
  hydrationTargetMl: number | null;
  bmi: number | null;
};

export type AnalyticsBadge = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export type WeeklyAnalyticsModel = {
  weekLabel: string;
  /** Rolling last 7 calendar days ending today (local) */
  days: WeeklyDayPoint[];
  completionPercent: number;
  completionBreakdown: { label: string; weight: number; met: boolean }[];
  proteinConsistencyPercent: number | null;
  badges: AnalyticsBadge[];
  insights: string[];
  streakDaysSinceSignup: number;
  metricsUpdatedThisWeek: boolean;
  notesUpdatedThisWeek: boolean;
  chartFootnote: string;
};
