export const DIET_GOALS = [
  { value: "bulking", label: "Bulking", description: "Calorie surplus for muscle gain" },
  { value: "fat_loss", label: "Fat Loss", description: "Moderate deficit to cut body fat" },
  { value: "lean_bulk", label: "Lean Bulk", description: "Small surplus, minimal fat gain" },
  { value: "weight_gain", label: "Weight Gain", description: "Higher surplus for scale gain" },
  { value: "maintenance", label: "Maintenance", description: "Stay at current weight" },
] as const;

export type DietGoal = (typeof DIET_GOALS)[number]["value"];

export type FoodTag = "veg" | "non_veg" | "budget" | "moderate" | "flexible" | "indian";

export type PreferredFoodKey =
  | "eggs"
  | "chicken"
  | "rice"
  | "oats"
  | "milk"
  | "paneer"
  | "peanut_butter"
  | "bananas"
  | "dal"
  | "curd"
  | "chapati"
  | "idli"
  | "dosa"
  | "fruits"
  | "vegetables"
  | "soy_chunks"
  | "fish";

export const PREFERRED_FOODS: {
  key: PreferredFoodKey;
  label: string;
  tags: FoodTag[];
}[] = [
  { key: "eggs", label: "Eggs", tags: ["non_veg", "budget", "indian"] },
  { key: "chicken", label: "Chicken", tags: ["non_veg", "moderate", "indian"] },
  { key: "rice", label: "Rice", tags: ["veg", "budget", "indian"] },
  { key: "oats", label: "Oats", tags: ["veg", "budget", "indian"] },
  { key: "milk", label: "Milk", tags: ["veg", "budget", "indian"] },
  { key: "paneer", label: "Paneer", tags: ["veg", "moderate", "indian"] },
  { key: "peanut_butter", label: "Peanut Butter", tags: ["veg", "budget", "indian"] },
  { key: "bananas", label: "Bananas", tags: ["veg", "budget", "indian"] },
  { key: "dal", label: "Dal", tags: ["veg", "budget", "indian"] },
  { key: "curd", label: "Curd", tags: ["veg", "budget", "indian"] },
  { key: "chapati", label: "Chapati", tags: ["veg", "budget", "indian"] },
  { key: "idli", label: "Idli", tags: ["veg", "budget", "indian"] },
  { key: "dosa", label: "Dosa", tags: ["veg", "budget", "indian"] },
  { key: "fruits", label: "Fruits", tags: ["veg", "budget", "indian"] },
  { key: "vegetables", label: "Vegetables", tags: ["veg", "budget", "indian"] },
  { key: "soy_chunks", label: "Soy chunks", tags: ["veg", "budget", "indian"] },
  { key: "fish", label: "Fish", tags: ["non_veg", "moderate", "indian"] },
];

export const AFFORDABILITY_OPTIONS = [
  { value: "budget", label: "Budget", tag: "Low-cost staples" },
  { value: "moderate", label: "Moderate", tag: "Balanced cost" },
  { value: "flexible", label: "Flexible", tag: "Premium options OK" },
] as const;

export type Affordability = (typeof AFFORDABILITY_OPTIONS)[number]["value"];

export type DietFilter = "veg" | "non_veg";
