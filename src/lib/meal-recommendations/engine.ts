import type {
  ConditionSignals,
  HealthConditionNotes,
  MealPlanResult,
  MealSlot,
  MealSuggestion,
  MealTag,
  MealTemplate,
  MetricsRow,
} from "./types";
import {
  forbiddenTagsFromAllergies,
  mealIsDairyHeavy,
  mealPassesAllergies,
  mealPassesDiet,
} from "./filtering";
import { templatesForSlot } from "./meal-templates";
import { buildNutritionTargets } from "./nutrition-from-metrics";

const SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner", "snack"];

function noteHasContent(s: string | null | undefined): boolean {
  return typeof s === "string" && s.trim().length > 0;
}

export function deriveConditionSignals(
  metrics: MetricsRow | null,
  notes: HealthConditionNotes | null,
): ConditionSignals {
  const diabetesPriority =
    metrics?.goal === "diabetic_diet" ||
    metrics?.non_gym_category === "diabetic_diet";

  return {
    diabetesPriority,
    acnePriority: noteHasContent(notes?.acne),
    jointPriority: noteHasContent(notes?.knee_pain),
    hairPriority: noteHasContent(notes?.hair_fall),
  };
}

function slotFractions(goal: MetricsRow["goal"]): Record<MealSlot, number> {
  const isSurplus =
    goal === "bulking" ||
    goal === "lean_bulk" ||
    goal === "muscle_building" ||
    goal === "weight_gain";
  const isDeficit =
    goal === "cutting" ||
    goal === "fat_loss" ||
    goal === "weight_loss";

  if (isSurplus) {
    return { breakfast: 0.24, lunch: 0.34, dinner: 0.32, snack: 0.1 };
  }
  if (isDeficit) {
    return { breakfast: 0.26, lunch: 0.33, dinner: 0.3, snack: 0.11 };
  }
  return { breakfast: 0.25, lunch: 0.35, dinner: 0.3, snack: 0.1 };
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function scoreMeal(
  meal: MealTemplate,
  slotKcal: number,
  slotProtein: number,
  signals: ConditionSignals,
  forbidden: Set<MealTag>,
  dietType: MetricsRow["diet_type"],
): number {
  if (!mealPassesAllergies(meal, forbidden)) return -1e9;
  if (!mealPassesDiet(meal, dietType)) return -1e9;

  const kcalDiff = Math.abs(meal.estimatedKcal - slotKcal);
  const protDiff = Math.abs(meal.estimatedProteinG - slotProtein);
  let score = 400 - kcalDiff * 0.35 - protDiff * 3;

  if (signals.diabetesPriority && meal.tags.includes("diabetes_friendly")) {
    score += 55;
  }
  if (signals.acnePriority) {
    if (meal.tags.includes("acne_friendly")) score += 40;
    if (mealIsDairyHeavy(meal)) score -= 25;
  }
  if (signals.jointPriority && meal.tags.includes("joint_support")) {
    score += 40;
  }
  if (signals.hairPriority && meal.tags.includes("hair_support")) {
    score += 35;
  }
  if (meal.tags.includes("high_protein")) score += 12;

  return score;
}

function pickForSlot(
  slot: MealSlot,
  goal: MetricsRow["goal"],
  dailyCalories: number,
  dailyProteinG: number,
  signals: ConditionSignals,
  forbidden: Set<MealTag>,
  dietType: MetricsRow["diet_type"],
  shuffleSeed: number,
  count: number,
): MealSuggestion[] {
  const frac = slotFractions(goal)[slot];
  const slotKcal = dailyCalories * frac;
  const slotProtein = dailyProteinG * frac;

  const pool = templatesForSlot(slot);
  const rng = mulberry32(shuffleSeed + slot.length * 997 + dailyCalories);

  const scored = pool
    .map((meal, idx) => ({
      meal,
      score: scoreMeal(
        meal,
        slotKcal,
        slotProtein,
        signals,
        forbidden,
        dietType,
      ),
      idx,
      tie: rng(),
    }))
    .filter((x) => x.score > -1e8)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.tie !== b.tie) return a.tie - b.tie;
      return a.idx - b.idx;
    });

  const buildFrom = (rows: typeof scored) => {
    const seen = new Set<string>();
    const out: MealSuggestion[] = [];
    for (const { meal } of rows) {
      if (seen.has(meal.id)) continue;
      seen.add(meal.id);
      out.push({
        id: meal.id,
        slot: meal.slot,
        title: meal.title,
        estimatedKcal: meal.estimatedKcal,
        estimatedProteinG: meal.estimatedProteinG,
        healthExplanation: meal.healthExplanation,
        matchedTags: [...meal.tags],
      });
      if (out.length >= count) break;
    }
    return out;
  };

  let picked = buildFrom(scored);
  if (picked.length === 0) {
    const relaxed = pool
      .map((meal, idx) => ({
        meal,
        score: scoreMeal(
          meal,
          slotKcal,
          slotProtein,
          { ...signals, acnePriority: false },
          forbidden,
          dietType,
        ),
        idx,
        tie: rng(),
      }))
      .filter((x) => x.score > -1e8)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.tie !== b.tie) return a.tie - b.tie;
        return a.idx - b.idx;
      });
    picked = buildFrom(relaxed);
  }

  return picked;
}

function defaultCaloriesProtein(): { cal: number; prot: number } {
  return { cal: 2000, prot: 90 };
}

export function buildMealPlan(args: {
  metrics: MetricsRow | null;
  healthNotes: HealthConditionNotes | null;
  /** Changes rotation of picks among top-scoring meals */
  shuffleSeed?: number;
  suggestionsPerSlot?: number;
}): MealPlanResult {
  const { metrics, healthNotes, shuffleSeed = 0, suggestionsPerSlot = 2 } =
    args;

  const targets = buildNutritionTargets(metrics);
  const signals = deriveConditionSignals(metrics, healthNotes);
  const forbidden = forbiddenTagsFromAllergies(targets.allergies);

  const fallback = defaultCaloriesProtein();
  const dailyCalories = targets.dailyCalories ?? fallback.cal;
  const dailyProteinG = targets.dailyProteinG ?? fallback.prot;

  const fr = slotFractions(targets.goal);
  const slotTargets: MealPlanResult["slotTargets"] = {
    breakfast: {
      kcal: Math.round(dailyCalories * fr.breakfast),
      proteinG: Math.round(dailyProteinG * fr.breakfast),
    },
    lunch: {
      kcal: Math.round(dailyCalories * fr.lunch),
      proteinG: Math.round(dailyProteinG * fr.lunch),
    },
    dinner: {
      kcal: Math.round(dailyCalories * fr.dinner),
      proteinG: Math.round(dailyProteinG * fr.dinner),
    },
    snack: {
      kcal: Math.round(dailyCalories * fr.snack),
      proteinG: Math.round(dailyProteinG * fr.snack),
    },
  };

  const meals: MealPlanResult["meals"] = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  for (const slot of SLOTS) {
    meals[slot] = pickForSlot(
      slot,
      targets.goal,
      dailyCalories,
      dailyProteinG,
      signals,
      forbidden,
      targets.dietType,
      shuffleSeed,
      suggestionsPerSlot,
    );
  }

  const parts: string[] = [];
  if (signals.diabetesPriority) parts.push("diabetes-friendly bias");
  if (signals.acnePriority) parts.push("acne-aware picks");
  if (signals.jointPriority) parts.push("joint-support emphasis");
  if (signals.hairPriority) parts.push("hair-nutrient emphasis");
  if (targets.dietType === "veg") parts.push("vegetarian-only");
  if (targets.allergies.length) parts.push("allergy-aware filtering");

  const summaryLine =
    parts.length > 0
      ? `Personalized with: ${parts.join(", ")}.`
      : "Balanced defaults with optional condition boosts when you add health notes.";

  return {
    targets,
    signals,
    slotTargets,
    meals,
    summaryLine,
  };
}
