import type { DailyDietPlan, MealPlanSlot } from "./types";

function normalizeSlot(raw: unknown): MealPlanSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const items = Array.isArray(o.items)
    ? o.items
        .filter((i) => i && typeof i === "object")
        .map((i) => {
          const item = i as Record<string, unknown>;
          return {
            name: String(item.name ?? "Item"),
            portion: String(item.portion ?? "1 serving"),
          };
        })
    : [];
  return {
    items,
    calories: Number(o.calories) || 0,
    protein: Number(o.protein) || 0,
    carbs: Number(o.carbs) || 0,
    fats: Number(o.fats) || 0,
  };
}

export function parseDailyDietPlan(raw: string): DailyDietPlan | null {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const breakfast = normalizeSlot(parsed.breakfast);
    const lunch = normalizeSlot(parsed.lunch);
    const dinner = normalizeSlot(parsed.dinner);
    const snacks = normalizeSlot(parsed.snacks);
    if (!breakfast || !lunch || !dinner || !snacks) return null;

    const dailyRaw = parsed.dailyTotals as Record<string, unknown> | undefined;
    const dailyTotals = dailyRaw
      ? {
          calories: Number(dailyRaw.calories) || 0,
          protein: Number(dailyRaw.protein) || 0,
          carbs: Number(dailyRaw.carbs) || 0,
          fats: Number(dailyRaw.fats) || 0,
        }
      : {
          calories: breakfast.calories + lunch.calories + dinner.calories + snacks.calories,
          protein: breakfast.protein + lunch.protein + dinner.protein + snacks.protein,
          carbs: breakfast.carbs + lunch.carbs + dinner.carbs + snacks.carbs,
          fats: breakfast.fats + lunch.fats + dinner.fats + snacks.fats,
        };

    return {
      breakfast,
      lunch,
      dinner,
      snacks,
      dailyTotals,
      notes: typeof parsed.notes === "string" ? parsed.notes : undefined,
    };
  } catch {
    return null;
  }
}
