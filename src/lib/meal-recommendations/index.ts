export type {
  ConditionSignals,
  HealthConditionNotes,
  MealPlanResult,
  MealSlot,
  MealSuggestion,
  MealTag,
  MealTemplate,
  MetricsRow,
  NutritionTargets,
} from "./types";

export {
  buildNutritionTargets,
  computeMaintenanceCalories,
} from "./nutrition-from-metrics";
export { buildMealPlan, deriveConditionSignals } from "./engine";
export {
  forbiddenTagsFromAllergies,
  mealPassesAllergies,
  mealPassesDiet,
  mealIsDairyHeavy,
} from "./filtering";
export { getMealTemplates, templatesForSlot } from "./meal-templates";
