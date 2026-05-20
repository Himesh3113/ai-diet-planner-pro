export type WellnessCategory =
  | "skin"
  | "fitness"
  | "recovery"
  | "mental"
  | "sleep"
  | "digestive";

export type WellnessFilter =
  | "all"
  | "active"
  | "recovery"
  | "critical"
  | "lifestyle"
  | "fitness"
  | "skin"
  | "mental";

export type WellnessStatus =
  | "monitoring"
  | "improving"
  | "stable"
  | "critical"
  | "recovered";

export type WellnessSeverity = "mild" | "moderate" | "severe";

export type WellnessConditionKey = string;

export type WellnessFoodItem = {
  name: string;
  benefit: string;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  micronutrients: string[];
  whyItHelps: string;
};

export type WellnessFoodAvoid = {
  name: string;
  reason: string;
};

export type WellnessSupplement = {
  name: string;
  purpose: string;
  benefits: string;
  timing: string;
};

export type WellnessRoutinePeriod = "morning" | "afternoon" | "evening" | "night";

export type WellnessRoutineSlot = {
  period: WellnessRoutinePeriod;
  items: string[];
};

export type WellnessConditionProfile = {
  key: string;
  title: string;
  category: WellnessCategory;
  overview: string;
  possibleCauses: string[];
  commonSymptoms: string[];
  severityExplanation: { mild: string; moderate: string; severe: string };
  recoveryDifficulty: string;
  estimatedTimeline: { mild: string; moderate: string; severe: string };
  lifestyleImpact: string;
  dailyPrecautions: string[];
  impacts: {
    stress: string;
    sleep: string;
    workout: string;
    hydration: string;
    nutrition: string;
  };
  recommendedFoods: WellnessFoodItem[];
  foodsToAvoid: WellnessFoodAvoid[];
  supplements: WellnessSupplement[];
  dailyRoutine: WellnessRoutineSlot[];
  recommendedExercises: string[];
  aiInsights: string[];
  dietPromptRules: string[];
  defaultHydrationMl: number;
  defaultSleepHours: number;
  stressImpact: number;
  energyImpact: number;
  skinImpact: number;
};

/** @deprecated Use WellnessConditionProfile — kept for catalog migration */
export type WellnessCatalogEntry = {
  key: WellnessConditionKey;
  title: string;
  category: WellnessCategory;
  summary: string;
  filterTags: WellnessFilter[];
  suggestedFoods: string[];
  foodsToAvoid: string[];
  recommendedExercises: string[];
  supplementSuggestions: string[];
  aiRecommendations: string[];
  dietPromptRules: string[];
  defaultHydrationMl: number;
  defaultSleepHours: number;
  stressImpact: number;
  energyImpact: number;
  skinImpact: number;
};

export type WellnessScores = {
  recovery: number;
  energy: number;
  sleep: number;
  skin: number;
  nutrition: number;
  stress: number;
  overall: number;
};

export type WellnessInsight = {
  id: string;
  message: string;
  tone: "positive" | "neutral" | "alert";
  conditionKey?: string;
};

export type WellnessTrendPoint = {
  date: string;
  value: number;
};

export type ConditionRecoveryStats = {
  conditionId: string;
  weeklyTrend: WellnessTrendPoint[];
  improvementDelta: number;
  streakDays: number;
  indicators: string[];
};
