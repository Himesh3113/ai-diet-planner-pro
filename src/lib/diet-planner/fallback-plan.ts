import { INDIAN_FOODS, type IndianFoodEntry } from "@/lib/foods/indian-foods";
import type { PreferredFoodKey } from "./constants";
import type { DailyDietPlan, MealPlanItem, MealPlanSlot, MealSlot } from "./types";
import type { DietGoal } from "./constants";

const FOOD_KEY_TO_INDIAN: Record<PreferredFoodKey, string[]> = {
  eggs: ["egg-boiled-1", "omelette-2eggs", "egg-bhurji-2eggs"],
  chicken: ["chicken-curry-1cup", "chicken-tandoori-1pc", "chicken-tikka-masala-1cup"],
  rice: ["rice-cooked-1cup", "rice-jeera-1cup", "rice-brown-1cup"],
  oats: [],
  milk: ["masala-chai-1cup", "sweet-lassi-1glass"],
  paneer: ["paneer-butter-masala-1cup", "paneer-palak-1cup", "paneer-bhurji-1cup"],
  peanut_butter: ["peanuts-roasted-025cup"],
  bananas: ["banana-1"],
  dal: ["dal-tadka-1cup", "dal-makhani-1cup", "sambar-1cup"],
  curd: ["plain-yogurt-1cup", "rice-curd-1cup", "buttermilk-chaas-1glass"],
  chapati: ["chapati-1", "roti-tandoori-1"],
  idli: ["idli-2"],
  dosa: ["dosa-plain", "dosa-masala"],
  fruits: ["banana-1", "coconut-water-1cup"],
  vegetables: ["mix-veg-1cup", "sprouted-moong-salad-1cup", "bhindi-masala-1cup"],
  soy_chunks: ["soyachunks-curry-1cup"],
  fish: ["fish-curry-1cup", "fish-fry-1pc"],
};

const SYNTHETIC_FOODS: Partial<Record<PreferredFoodKey, FoodRef[]>> = {
  oats: [
    {
      key: "oats-milk-1bowl",
      name: "Oats with Milk",
      serving: "1 bowl",
      calories: 280,
      proteinG: 12,
      carbsG: 42,
      fatsG: 7,
    },
  ],
};

function goalCalorieTarget(goal: DietGoal) {
  switch (goal) {
    case "bulking":
      return 2800;
    case "fat_loss":
      return 1800;
    case "lean_bulk":
      return 2400;
    case "weight_gain":
      return 3000;
    default:
      return 2200;
  }
}

type FoodRef = IndianFoodEntry & { carbsG?: number; fatsG?: number };

function estimateCarbsFats(food: FoodRef) {
  const protein = food.proteinG;
  const proteinKcal = protein * 4;
  const remaining = Math.max(0, food.calories - proteinKcal);
  return {
    carbsG: food.carbsG ?? Math.round((remaining * 0.55) / 4),
    fatsG: food.fatsG ?? Math.round((remaining * 0.45) / 9),
  };
}

function pickItems(keys: PreferredFoodKey[], slot: MealSlot, count: number): MealPlanItem[] {
  const pool: FoodRef[] = [];
  for (const k of keys) {
    const indianKeys = FOOD_KEY_TO_INDIAN[k] ?? [];
    for (const f of INDIAN_FOODS) {
      if (indianKeys.includes(f.key)) pool.push(f);
    }
    for (const s of SYNTHETIC_FOODS[k] ?? []) pool.push(s);
  }
  if (pool.length === 0) return [{ name: "Mixed meal", portion: "1 serving" }];

  const slotOffset = { breakfast: 0, lunch: 2, dinner: 4, snacks: 6 }[slot];
  const items: MealPlanItem[] = [];
  for (let i = 0; i < count; i++) {
    const food = pool[(slotOffset + i) % pool.length];
    items.push({ name: food.name, portion: food.serving });
  }
  return items;
}

function slotFromItems(items: MealPlanItem[], pool: FoodRef[]): MealPlanSlot {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fats = 0;
  for (const item of items) {
    const match =
      pool.find((f) => f.name === item.name) ??
      INDIAN_FOODS.find((f) => f.name === item.name);
    if (match) {
      const est = estimateCarbsFats(match);
      calories += match.calories;
      protein += match.proteinG;
      carbs += est.carbsG;
      fats += est.fatsG;
    }
  }
  return {
    items,
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fats: Math.round(fats),
  };
}

export function buildFallbackDietPlan(
  preferredFoods: PreferredFoodKey[],
  goal: DietGoal,
): DailyDietPlan {
  const keys = preferredFoods.length > 0 ? preferredFoods : (["rice", "dal", "chapati"] as PreferredFoodKey[]);

  const pool: FoodRef[] = [];
  for (const k of keys) {
    const indianKeys = FOOD_KEY_TO_INDIAN[k] ?? [];
    for (const f of INDIAN_FOODS) {
      if (indianKeys.includes(f.key)) pool.push(f);
    }
    for (const s of SYNTHETIC_FOODS[k] ?? []) pool.push(s);
  }

  const breakfast = slotFromItems(pickItems(keys, "breakfast", 2), pool);
  const lunch = slotFromItems(pickItems(keys, "lunch", 3), pool);
  const dinner = slotFromItems(pickItems(keys, "dinner", 3), pool);
  const snacks = slotFromItems(pickItems(keys, "snacks", 1), pool);

  const dailyTotals = {
    calories:
      breakfast.calories + lunch.calories + dinner.calories + snacks.calories,
    protein: breakfast.protein + lunch.protein + dinner.protein + snacks.protein,
    carbs: breakfast.carbs + lunch.carbs + dinner.carbs + snacks.carbs,
    fats: breakfast.fats + dinner.fats + lunch.fats + snacks.fats,
  };

  const target = goalCalorieTarget(goal);
  const scale = target / Math.max(dailyTotals.calories, 1);
  if (scale > 0.85 && scale < 1.25) {
    return {
      breakfast,
      lunch,
      dinner,
      snacks,
      dailyTotals,
      notes: `Personalized ${goal.replace("_", " ")} plan using your selected foods.`,
    };
  }

  const scaleSlot = (slot: MealPlanSlot): MealPlanSlot => ({
    ...slot,
    calories: Math.round(slot.calories * scale),
    protein: Math.round(slot.protein * scale),
    carbs: Math.round(slot.carbs * scale),
    fats: Math.round(slot.fats * scale),
  });

  const scaled = {
    breakfast: scaleSlot(breakfast),
    lunch: scaleSlot(lunch),
    dinner: scaleSlot(dinner),
    snacks: scaleSlot(snacks),
  };

  return {
    ...scaled,
    dailyTotals: {
      calories: Object.values(scaled).reduce((s, m) => s + m.calories, 0),
      protein: Object.values(scaled).reduce((s, m) => s + m.protein, 0),
      carbs: Object.values(scaled).reduce((s, m) => s + m.carbs, 0),
      fats: Object.values(scaled).reduce((s, m) => s + m.fats, 0),
    },
    notes: `Adjusted portions for your ${goal.replace("_", " ")} calorie target (~${target} kcal).`,
  };
}
