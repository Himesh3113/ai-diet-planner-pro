import type { DailyDietPlan, MealPlanSlot, MealSlot } from "./types";

const SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner", "snacks"];

export function balancePlanToTargets(
  plan: DailyDietPlan,
  targetCalories: number,
  targetProteinG: number,
): DailyDietPlan {
  const currentCal = plan.dailyTotals.calories || 1;
  const calScale = targetCalories / currentCal;

  const scaleSlot = (slot: MealPlanSlot): MealPlanSlot => ({
    ...slot,
    calories: Math.max(50, Math.round(slot.calories * calScale)),
    protein: Math.max(0, Math.round(slot.protein * calScale)),
    carbs: Math.max(0, Math.round(slot.carbs * calScale)),
    fats: Math.max(0, Math.round(slot.fats * calScale)),
  });

  let scaled = {
    breakfast: scaleSlot(plan.breakfast),
    lunch: scaleSlot(plan.lunch),
    dinner: scaleSlot(plan.dinner),
    snacks: scaleSlot(plan.snacks),
  };

  let totals = sumTotals(scaled);
  const proteinScale = targetProteinG / Math.max(totals.protein, 1);

  if (proteinScale > 1.08 && proteinScale < 1.5) {
    scaled = {
      breakfast: boostProtein(scaled.breakfast, proteinScale),
      lunch: boostProtein(scaled.lunch, proteinScale),
      dinner: boostProtein(scaled.dinner, proteinScale),
      snacks: boostProtein(scaled.snacks, proteinScale * 0.9),
    };
    totals = sumTotals(scaled);
  }

  return {
    ...scaled,
    dailyTotals: totals,
    notes: plan.notes,
  };
}

function boostProtein(slot: MealPlanSlot, factor: number): MealPlanSlot {
  const p = Math.round(slot.protein * factor);
  const extraKcal = (p - slot.protein) * 4;
  return {
    ...slot,
    protein: p,
    calories: slot.calories + extraKcal,
  };
}

function sumTotals(plan: Record<MealSlot, MealPlanSlot>) {
  return SLOTS.reduce(
    (acc, key) => ({
      calories: acc.calories + plan[key].calories,
      protein: acc.protein + plan[key].protein,
      carbs: acc.carbs + plan[key].carbs,
      fats: acc.fats + plan[key].fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );
}
