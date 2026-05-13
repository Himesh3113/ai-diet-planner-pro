import type { Database } from "@/lib/supabase/types";

export type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];

export type GoalMode = "fat_loss" | "maintenance" | "muscle_gain";

export type RoutineChecklistId =
  | "morning_hydration"
  | "morning_movement"
  | "breakfast_window"
  | "lunch_window"
  | "hydration_check"
  | "workout_block"
  | "dinner_window"
  | "evening_wind_down"
  | "sleep_window";

export type RoutineChecklistItem = {
  id: RoutineChecklistId;
  label: string;
};

export type TimedBlock = {
  timeLabel: string;
  title: string;
  detail: string;
};

export type InsightCard = {
  id: string;
  title: string;
  body: string;
  accent: "default" | "diabetes" | "skin" | "joint" | "hair" | "goal";
};

export type DailyRoutinePlan = {
  headline: string;
  subline: string;
  goalMode: GoalMode;
  morning: TimedBlock[];
  mealTiming: TimedBlock[];
  hydration: {
    dailyTargetMl: number | null;
    reminders: TimedBlock[];
    tip: string;
  };
  workout: TimedBlock[];
  sleep: {
    targetHours: string;
    wakeTarget: string;
    bedTarget: string;
    rationale: string;
  };
  conditionCards: InsightCard[];
  goalCards: InsightCard[];
  checklist: RoutineChecklistItem[];
};
