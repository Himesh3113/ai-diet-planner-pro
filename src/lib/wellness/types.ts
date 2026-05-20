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
};

export type WellnessTrendPoint = {
  date: string;
  value: number;
};
