import { INDIAN_FOOD_CATALOG } from "@/lib/foods/indian-foods";

export type FoodTag =
  | "veg"
  | "non_veg"
  | "budget"
  | "moderate"
  | "flexible"
  | "indian"
  | "high_protein"
  | "snack"
  | "fruit"
  | "dairy";

export const DIET_GOALS = [
  { value: "bulking", label: "Bulking", description: "Calorie surplus for muscle gain" },
  { value: "fat_loss", label: "Fat Loss", description: "Moderate deficit to cut body fat" },
  { value: "lean_bulk", label: "Lean Bulk", description: "Small surplus, minimal fat gain" },
  { value: "weight_gain", label: "Weight Gain", description: "Higher surplus for scale gain" },
  { value: "maintenance", label: "Maintenance", description: "Stay at current weight" },
] as const;

export type DietGoal = (typeof DIET_GOALS)[number]["value"];

/** Legacy keys still accepted from saved Supabase preferences */
const LEGACY_PREFERRED: { key: string; label: string; tags: FoodTag[] }[] = [
  { key: "salmon", label: "Salmon / fatty fish", tags: ["non_veg", "flexible", "high_protein"] },
  { key: "tofu", label: "Tofu", tags: ["veg", "moderate", "high_protein"] },
  { key: "berries", label: "Berries", tags: ["veg", "moderate", "fruit"] },
  { key: "cucumber", label: "Cucumber", tags: ["veg", "budget"] },
  { key: "carrots", label: "Carrots", tags: ["veg", "budget"] },
  { key: "lentils", label: "Lentils / masoor", tags: ["veg", "budget", "indian", "high_protein"] },
  { key: "almonds", label: "Almonds", tags: ["veg", "moderate"] },
  { key: "walnuts", label: "Walnuts", tags: ["veg", "moderate"] },
  { key: "pumpkin_seeds", label: "Pumpkin seeds", tags: ["veg", "moderate", "high_protein"] },
  { key: "mixed_nuts", label: "Mixed nuts", tags: ["veg", "moderate"] },
  { key: "flaxseed", label: "Flaxseed", tags: ["veg", "budget"] },
  { key: "roasted_chana", label: "Roasted chana", tags: ["veg", "budget", "high_protein"] },
  { key: "green_tea", label: "Green tea", tags: ["veg", "budget"] },
  { key: "ginger_tea", label: "Ginger tea", tags: ["veg", "budget"] },
  { key: "turmeric_meals", label: "Turmeric-based meals", tags: ["veg", "budget", "indian"] },
];

function buildCatalogPreferred() {
  const seen = new Set<string>();
  const out: { key: string; label: string; tags: FoodTag[] }[] = [];
  for (const item of INDIAN_FOOD_CATALOG) {
    if (seen.has(item.preferredKey)) continue;
    seen.add(item.preferredKey);
    const tags: FoodTag[] = ["indian"];
    if (item.dietType === "veg") tags.push("veg");
    else tags.push("non_veg");
    if (item.affordability === "budget") tags.push("budget");
    else if (item.affordability === "moderate") tags.push("moderate");
    else tags.push("flexible");
    if (item.tags.includes("high_protein")) tags.push("high_protein");
    if (item.tags.includes("fruit")) tags.push("fruit");
    if (item.tags.includes("dairy")) tags.push("dairy");
    out.push({ key: item.preferredKey, label: item.name, tags });
  }
  return out;
}

const CATALOG_PREFERRED = buildCatalogPreferred();

export const PREFERRED_FOODS = [
  ...CATALOG_PREFERRED,
  ...LEGACY_PREFERRED.filter((l) => !CATALOG_PREFERRED.some((c) => c.key === l.key)),
];

export type PreferredFoodKey = (typeof PREFERRED_FOODS)[number]["key"];

export const PREFERRED_FOOD_KEY_SET = new Set(PREFERRED_FOODS.map((f) => f.key));

export const AFFORDABILITY_OPTIONS = [
  { value: "budget", label: "Budget", tag: "Low-cost staples" },
  { value: "moderate", label: "Moderate", tag: "Balanced cost" },
  { value: "flexible", label: "Flexible", tag: "Premium options OK" },
] as const;

export type Affordability = (typeof AFFORDABILITY_OPTIONS)[number]["value"];

export type DietFilter = "veg" | "non_veg";
