import type { Database } from "@/lib/supabase/types";

export type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

/** Tags for filtering and condition-aware scoring */
export type MealTag =
  | "vegetarian"
  | "diabetes_friendly"
  | "acne_friendly"
  | "joint_support"
  | "hair_support"
  | "contains_nuts"
  | "contains_dairy"
  | "contains_seafood"
  | "contains_eggs"
  | "contains_gluten"
  | "high_protein";

export type MealTemplate = {
  id: string;
  slot: MealSlot;
  title: string;
  /** Typical single-serving estimate */
  estimatedKcal: number;
  estimatedProteinG: number;
  tags: MealTag[];
  /** One-line rationale tied to health goals */
  healthExplanation: string;
};

export type HealthConditionNotes = {
  acne: string | null;
  migraine: string | null;
  knee_pain: string | null;
  hair_fall: string | null;
};

export type NutritionTargets = {
  dailyCalories: number | null;
  dailyProteinG: number | null;
  hydrationMl: number | null;
  bmi: number | null;
  goal: MetricsRow["goal"];
  dietType: MetricsRow["diet_type"];
  allergies: string[];
};

export type ConditionSignals = {
  diabetesPriority: boolean;
  acnePriority: boolean;
  jointPriority: boolean;
  hairPriority: boolean;
};

export type MealSuggestion = {
  id: string;
  slot: MealSlot;
  title: string;
  estimatedKcal: number;
  estimatedProteinG: number;
  healthExplanation: string;
  matchedTags: MealTag[];
};

export type MealPlanResult = {
  targets: NutritionTargets;
  signals: ConditionSignals;
  slotTargets: Record<MealSlot, { kcal: number; proteinG: number }>;
  meals: Record<MealSlot, MealSuggestion[]>;
  summaryLine: string;
};
