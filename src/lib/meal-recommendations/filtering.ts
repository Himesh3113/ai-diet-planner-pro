import type { MealTag, MealTemplate, MetricsRow } from "./types";

const ALLERGEN_TAG_RULES: { keywords: string[]; forbiddenTags: MealTag[] }[] = [
  {
    keywords: ["nut", "peanut", "almond", "cashew", "walnut", "hazelnut"],
    forbiddenTags: ["contains_nuts"],
  },
  {
    keywords: ["dairy", "milk", "lactose", "cheese", "yogurt", "whey"],
    forbiddenTags: ["contains_dairy"],
  },
  { keywords: ["egg", "eggs"], forbiddenTags: ["contains_eggs"] },
  {
    keywords: [
      "fish",
      "salmon",
      "tuna",
      "seafood",
      "shellfish",
      "prawn",
      "shrimp",
      "crab",
    ],
    forbiddenTags: ["contains_seafood"],
  },
  {
    keywords: ["gluten", "wheat", "barley", "rye"],
    forbiddenTags: ["contains_gluten"],
  },
];

function normalizeAllergy(s: string) {
  return s.trim().toLowerCase();
}

/** Tags that must not appear on any meal if user allergy string matches */
export function forbiddenTagsFromAllergies(allergies: string[]): Set<MealTag> {
  const out = new Set<MealTag>();
  for (const raw of allergies) {
    const a = normalizeAllergy(raw);
    if (!a) continue;
    for (const rule of ALLERGEN_TAG_RULES) {
      if (rule.keywords.some((k) => a.includes(k))) {
        rule.forbiddenTags.forEach((t) => out.add(t));
      }
    }
  }
  return out;
}

export function mealPassesAllergies(
  meal: MealTemplate,
  forbidden: Set<MealTag>,
): boolean {
  return !meal.tags.some((t) => forbidden.has(t));
}

export function mealPassesDiet(
  meal: MealTemplate,
  dietType: MetricsRow["diet_type"],
): boolean {
  if (dietType !== "veg") return true;
  if (!meal.tags.includes("vegetarian")) return false;
  if (meal.tags.includes("contains_seafood")) return false;
  if (meal.tags.includes("contains_eggs")) return false;
  return true;
}

/** When user tracks acne in notes, scoring can penalize dairy-heavy meals */
export function mealIsDairyHeavy(meal: MealTemplate): boolean {
  return meal.tags.includes("contains_dairy");
}
