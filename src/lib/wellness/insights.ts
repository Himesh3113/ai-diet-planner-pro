import { getConditionProfile } from "./condition-profiles";
import type { WellnessConditionProfile } from "./types";
import type { WellnessInsight, WellnessScores, WellnessTrendPoint } from "./types";

type ActiveCondition = {
  condition_key: string;
  status: string;
  severity: string;
};

type TrendInput = {
  hydration: WellnessTrendPoint[];
  sleep: WellnessTrendPoint[];
  recovery: WellnessTrendPoint[];
  energy: WellnessTrendPoint[];
};

export function buildConditionInsights(
  conditions: ActiveCondition[],
  trends: TrendInput,
  proteinTodayG?: number,
  proteinTargetG?: number,
): WellnessInsight[] {
  const insights: WellnessInsight[] = [];
  const active = conditions.filter((c) => c.status !== "recovered");
  const lastHydration = trends.hydration[trends.hydration.length - 1]?.value ?? 0;
  const lastSleep = trends.sleep[trends.sleep.length - 1]?.value ?? 0;

  for (const row of active) {
    const profile = getConditionProfile(row.condition_key);
    if (!profile) continue;

    for (const line of profile.aiInsights.slice(0, 2)) {
      insights.push({
        id: `${row.condition_key}-${insights.length}`,
        message: line,
        tone: "neutral",
        conditionKey: row.condition_key,
      });
    }

    if (lastHydration > 0 && lastHydration < 2000) {
      if (profile.category === "skin") {
        insights.push({
          id: `${row.condition_key}-hydration-acne`,
          message: "Low hydration may worsen acne — aim for steady water, not sugary drinks.",
          tone: "alert",
          conditionKey: row.condition_key,
        });
      }
    }

    if (lastSleep > 0 && lastSleep < 6) {
      if (row.condition_key.includes("hair") || profile.title.toLowerCase().includes("hair")) {
        insights.push({
          id: `${row.condition_key}-sleep-hair`,
          message: "Poor sleep may slow hair recovery — target 7–8 hours consistently.",
          tone: "alert",
          conditionKey: row.condition_key,
        });
      }
    }

    if (row.condition_key === "migraine" || row.condition_key === "stress") {
      insights.push({
        id: `${row.condition_key}-stress-migraine`,
        message: "High stress can increase migraine frequency — stabilize meal timing.",
        tone: "alert",
        conditionKey: row.condition_key,
      });
    }
  }

  if (
    proteinTargetG &&
    proteinTodayG !== undefined &&
    proteinTodayG < proteinTargetG * 0.6 &&
    active.some((c) => c.condition_key.includes("muscle") || c.condition_key.includes("gym"))
  ) {
    insights.push({
      id: "protein-recovery-low",
      message: "Protein intake is below optimal for muscle recovery today.",
      tone: "alert",
    });
  }

  return insights;
}

export function buildWellnessInsights(args: {
  scores: WellnessScores;
  activeCount: number;
  trends: TrendInput;
  conditions?: ActiveCondition[];
  proteinTodayG?: number;
  proteinTargetG?: number;
}): WellnessInsight[] {
  const insights: WellnessInsight[] = [];

  if (args.conditions?.length) {
    insights.push(...buildConditionInsights(
      args.conditions,
      args.trends,
      args.proteinTodayG,
      args.proteinTargetG,
    ));
  }

  const hydration = args.trends.hydration;
  if (hydration.length >= 2) {
    const last = hydration[hydration.length - 1]?.value ?? 0;
    const prev = hydration[hydration.length - 2]?.value ?? 0;
    const delta = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
    if (delta >= 5) {
      insights.push({
        id: "hydration-up",
        message: `Hydration improved ${delta}% compared to yesterday.`,
        tone: "positive",
      });
    } else if (last < 2000) {
      insights.push({
        id: "hydration-low",
        message: "Hydration is below target — add 2 more glasses today.",
        tone: "alert",
      });
    }
  }

  const sleep = args.trends.sleep;
  if (sleep.length >= 2) {
    const last = sleep[sleep.length - 1]?.value ?? 0;
    const prev = sleep[sleep.length - 2]?.value ?? 0;
    if (last - prev >= 0.5) {
      insights.push({
        id: "sleep-up",
        message: `Sleep quality improved ${Math.round((last - prev) * 10)}% this week.`,
        tone: "positive",
      });
    }
  }

  if (args.scores.stress < 65) {
    insights.push({
      id: "stress-recovery",
      message: "Stress levels may affect recovery — prioritize magnesium-rich evening meals.",
      tone: "alert",
    });
  }

  if (args.scores.recovery >= 75) {
    insights.push({
      id: "recovery-good",
      message: "Recovery score is trending well — keep protein and sleep consistent.",
      tone: "positive",
    });
  }

  const seen = new Set<string>();
  return insights.filter((i) => {
    if (seen.has(i.message)) return false;
    seen.add(i.message);
    return true;
  }).slice(0, 8);
}

export function mealAdjustmentsFromProfile(profile: WellnessConditionProfile): string[] {
  return [
    ...profile.dietPromptRules,
    `Prefer: ${profile.recommendedFoods.slice(0, 5).map((f) => f.name).join(", ")}`,
    `Limit: ${profile.foodsToAvoid.slice(0, 3).map((f) => f.name).join(", ")}`,
  ];
}
