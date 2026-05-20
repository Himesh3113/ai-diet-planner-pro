import type { PreferredFoodKey } from "./constants";
import { buildSmartDietPlan } from "./meal-engine";
import type { DietGoal } from "./constants";
import type { DailyDietPlan } from "./types";

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

function goalProteinTarget(goal: DietGoal) {
  switch (goal) {
    case "bulking":
    case "weight_gain":
      return 140;
    case "fat_loss":
      return 110;
    case "lean_bulk":
      return 130;
    default:
      return 120;
  }
}

export function buildFallbackDietPlan(
  preferredFoods: PreferredFoodKey[],
  goal: DietGoal,
  options?: {
    dietFilter?: "veg" | "non_veg";
    affordability?: "budget" | "moderate" | "flexible";
  },
): DailyDietPlan {
  const keys =
    preferredFoods.length > 0
      ? preferredFoods
      : (["rice", "dal", "chapati", "eggs", "bananas"] as PreferredFoodKey[]);

  return buildSmartDietPlan({
    preferredFoodKeys: keys,
    goal,
    dietFilter: options?.dietFilter ?? "veg",
    affordability: options?.affordability ?? "moderate",
    targetCalories: goalCalorieTarget(goal),
    targetProteinG: goalProteinTarget(goal),
  });
}
