import {
  findIndianFoodByKey,
  foodsForPreferredKeys,
  matchesAffordability,
  type IndianFoodItem,
} from "@/lib/foods/indian-foods";
import type { IndianMealCategory } from "@/lib/foods/types";
import type { Affordability, DietFilter, DietGoal } from "./constants";
import { MEAL_COMBINATIONS, type MealCombination } from "./meal-combinations";
import type { DailyDietPlan, MealPlanItem, MealPlanSlot, MealSlot } from "./types";

const SLOT_TO_CATEGORY: Record<MealSlot, IndianMealCategory> = {
  breakfast: "breakfast",
  lunch: "lunch_dinner",
  dinner: "lunch_dinner",
  snacks: "snacks",
};

const PROTEIN_SPLIT: Record<MealSlot, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.3,
  snacks: 0.1,
};

function slotFromFoods(foods: IndianFoodItem[]): MealPlanSlot {
  const items: MealPlanItem[] = foods.map((f) => ({
    name: f.name,
    portion: f.serving,
  }));
  return {
    items,
    calories: Math.round(foods.reduce((s, f) => s + f.calories, 0)),
    protein: Math.round(foods.reduce((s, f) => s + f.proteinG, 0)),
    carbs: Math.round(foods.reduce((s, f) => s + f.carbsG, 0)),
    fats: Math.round(foods.reduce((s, f) => s + f.fatsG, 0)),
  };
}

function filterPool(
  pool: IndianFoodItem[],
  args: {
    dietFilter: DietFilter;
    affordability: Affordability;
    category: IndianMealCategory;
    highProteinOnly?: boolean;
  },
) {
  return pool.filter((f) => {
    if (args.dietFilter === "veg" && f.dietType !== "veg") return false;
    if (!matchesAffordability(f, args.affordability)) return false;
    if (!f.mealCategories.includes(args.category)) return false;
    if (args.highProteinOnly && !f.tags.includes("high_protein")) return false;
    return true;
  });
}

function combinationFitsSelection(
  combo: MealCombination,
  selectedKeys: Set<string>,
  pool: IndianFoodItem[],
) {
  const poolKeys = new Set(pool.map((f) => f.key));
  const hasAllFoods = combo.foodKeys.every((k) => poolKeys.has(k));
  if (!hasAllFoods) return false;
  return combo.foodKeys.some((k) => {
    const food = findIndianFoodByKey(k);
    return food && selectedKeys.has(food.preferredKey);
  });
}

function pickCombination(
  slot: MealSlot,
  pool: IndianFoodItem[],
  selectedKeys: Set<string>,
  affordability: Affordability,
): IndianFoodItem[] | null {
  const candidates = MEAL_COMBINATIONS.filter(
    (c) =>
      c.slot === slot &&
      combinationFitsSelection(c, selectedKeys, pool) &&
      (affordability !== "budget" || c.tags.includes("budget")),
  );
  if (candidates.length === 0) return null;
  const combo = candidates[0];
  const foods = combo.foodKeys
    .map((k) => findIndianFoodByKey(k))
    .filter((f): f is IndianFoodItem => f != null);
  return foods.length > 0 ? foods : null;
}

function pickFoodsForSlot(
  pool: IndianFoodItem[],
  slot: MealSlot,
  count: number,
  offset: number,
): IndianFoodItem[] {
  if (pool.length === 0) return [];
  const picked: IndianFoodItem[] = [];
  for (let i = 0; i < count; i++) {
    const food = pool[(offset + i) % pool.length];
    if (!picked.some((p) => p.key === food.key)) picked.push(food);
  }
  return picked;
}

export function buildSmartDietPlan(args: {
  preferredFoodKeys: string[];
  goal: DietGoal;
  dietFilter: DietFilter;
  affordability: Affordability;
  targetCalories: number;
  targetProteinG: number;
}): DailyDietPlan {
  const selectedSet = new Set(args.preferredFoodKeys);
  const basePool = foodsForPreferredKeys(args.preferredFoodKeys);

  const slots: MealSlot[] = ["breakfast", "lunch", "dinner", "snacks"];
  const built: Partial<Record<MealSlot, MealPlanSlot>> = {};

  for (const slot of slots) {
    const category = SLOT_TO_CATEGORY[slot];
    const pool = filterPool(basePool, {
      dietFilter: args.dietFilter,
      affordability: args.affordability,
      category,
    });

    const fromCombo = pickCombination(slot, pool, selectedSet, args.affordability);
    if (fromCombo && fromCombo.length > 0) {
      built[slot] = slotFromFoods(fromCombo);
      continue;
    }

    const count = slot === "snacks" ? 2 : slot === "breakfast" ? 2 : 3;
    const offset = { breakfast: 0, lunch: 3, dinner: 6, snacks: 9 }[slot];
    const picked = pickFoodsForSlot(pool, slot, count, offset);
    built[slot] =
      picked.length > 0
        ? slotFromFoods(picked)
        : {
            items: [{ name: "Mixed Indian meal", portion: "1 serving" }],
            calories: 300,
            protein: 12,
            carbs: 40,
            fats: 8,
          };
  }

  let plan: DailyDietPlan = {
    breakfast: built.breakfast!,
    lunch: built.lunch!,
    dinner: built.dinner!,
    snacks: built.snacks!,
    dailyTotals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
    notes: buildPlanNote(args),
  };

  plan.dailyTotals = sumTotals(plan);
  plan = rebalanceProteinDistribution(plan, args.targetProteinG);
  plan = scaleToCalories(plan, args.targetCalories);

  return plan;
}

function buildPlanNote(args: {
  goal: DietGoal;
  affordability: Affordability;
  preferredFoodKeys: string[];
}) {
  const parts = [
    `Indian ${args.goal.replace("_", " ")} plan from your selected foods.`,
  ];
  if (args.affordability === "budget") {
    parts.push("Budget-friendly staples prioritized.");
  }
  if (args.preferredFoodKeys.length >= 6) {
    parts.push("Protein spread across breakfast, lunch, dinner, and snacks.");
  }
  return parts.join(" ");
}

function sumTotals(plan: Pick<DailyDietPlan, "breakfast" | "lunch" | "dinner" | "snacks">) {
  const slots = [plan.breakfast, plan.lunch, plan.dinner, plan.snacks];
  return slots.reduce(
    (acc, s) => ({
      calories: acc.calories + s.calories,
      protein: acc.protein + s.protein,
      carbs: acc.carbs + s.carbs,
      fats: acc.fats + s.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );
}

function scaleToCalories(plan: DailyDietPlan, target: number): DailyDietPlan {
  const current = plan.dailyTotals.calories || 1;
  const scale = target / current;
  if (scale > 0.88 && scale < 1.15) return { ...plan, dailyTotals: sumTotals(plan) };

  const scaleSlot = (slot: MealPlanSlot): MealPlanSlot => ({
    ...slot,
    calories: Math.max(80, Math.round(slot.calories * scale)),
    protein: Math.max(0, Math.round(slot.protein * scale)),
    carbs: Math.max(0, Math.round(slot.carbs * scale)),
    fats: Math.max(0, Math.round(slot.fats * scale)),
  });

  const scaled = {
    breakfast: scaleSlot(plan.breakfast),
    lunch: scaleSlot(plan.lunch),
    dinner: scaleSlot(plan.dinner),
    snacks: scaleSlot(plan.snacks),
  };
  return { ...scaled, dailyTotals: sumTotals(scaled), notes: plan.notes };
}

function rebalanceProteinDistribution(
  plan: DailyDietPlan,
  targetProteinG: number,
): DailyDietPlan {
  const slots: MealSlot[] = ["breakfast", "lunch", "dinner", "snacks"];
  const current = plan.dailyTotals.protein || 1;
  const scale = targetProteinG / current;

  if (scale < 0.92 || scale > 1.35) {
    const adjusted = { ...plan };
    for (const slot of slots) {
      const targetSlotP = Math.round(targetProteinG * PROTEIN_SPLIT[slot]);
      const slotData = adjusted[slot];
      const slotScale = targetSlotP / Math.max(slotData.protein, 1);
      if (slotScale > 1.05 && slotScale < 1.6) {
        const extraKcal = Math.round((targetSlotP - slotData.protein) * 4);
        adjusted[slot] = {
          ...slotData,
          protein: targetSlotP,
          calories: slotData.calories + extraKcal,
        };
      }
    }
    adjusted.dailyTotals = sumTotals(adjusted);
    return adjusted;
  }
  return plan;
}

export function formatFoodContextForAi(
  preferredFoodKeys: string[],
  affordability: Affordability,
  dietFilter: DietFilter,
): string[] {
  const pool = foodsForPreferredKeys(preferredFoodKeys).filter((f) => {
    if (dietFilter === "veg" && f.dietType !== "veg") return false;
    return matchesAffordability(f, affordability);
  });

  const lines = pool.slice(0, 40).map(
    (f) =>
      `- ${f.name} (${f.serving}): ${f.calories} kcal, ${f.proteinG}g protein, ${f.carbsG}g carbs, ${f.fatsG}g fat · ${f.cuisineTag} · ${f.affordability}`,
  );

  const comboLines = MEAL_COMBINATIONS.filter((c) =>
    combinationFitsSelection(c, new Set(preferredFoodKeys), pool),
  )
    .slice(0, 8)
    .map((c) => `• ${c.title}: ${c.foodKeys.map((k) => findIndianFoodByKey(k)?.name ?? k).join(" + ")}`);

  if (comboLines.length > 0) {
    lines.push("", "Preferred realistic combinations:", ...comboLines);
  }

  return lines;
}
