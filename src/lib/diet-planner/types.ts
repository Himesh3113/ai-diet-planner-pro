import type { Affordability, DietFilter, DietGoal, PreferredFoodKey } from "./constants";

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snacks";

export type MealMacros = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type MealPlanItem = {
  name: string;
  portion: string;
};

export type MealPlanSlot = MealMacros & {
  items: MealPlanItem[];
};

export type DailyDietPlan = {
  breakfast: MealPlanSlot;
  lunch: MealPlanSlot;
  dinner: MealPlanSlot;
  snacks: MealPlanSlot;
  dailyTotals: MealMacros;
  notes?: string;
};

export type DietPlannerPreferences = {
  goal: DietGoal;
  preferredFoods: PreferredFoodKey[];
  dietFilter: DietFilter;
  indianFoodPriority: boolean;
  affordability: Affordability;
};
