import type { Affordability } from "@/lib/diet-planner/constants";

export type IndianMealCategory =
  | "breakfast"
  | "lunch_dinner"
  | "snacks"
  | "protein_sources";

export type IndianDietType = "veg" | "non_veg";

export type FoodTag = IndianFoodTag;

export type IndianFoodTag =
  | "indian"
  | "high_protein"
  | "budget"
  | "south_indian"
  | "north_indian"
  | "comfort"
  | "dairy"
  | "fruit";

export type IndianFoodItem = {
  key: string;
  name: string;
  serving: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  affordability: Affordability;
  dietType: IndianDietType;
  mealCategories: IndianMealCategory[];
  cuisineTag: string;
  tags: IndianFoodTag[];
  /** Stable key stored in Supabase preferred_foods */
  preferredKey: string;
};

/** @deprecated Use IndianFoodItem — kept for food log compatibility */
export type IndianFoodEntry = Pick<
  IndianFoodItem,
  "key" | "name" | "serving" | "calories" | "proteinG"
> & { carbsG?: number; fatsG?: number };
