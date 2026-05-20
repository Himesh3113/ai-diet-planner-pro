import type { WellnessCatalogEntry } from "./types";
import type { WellnessScores, WellnessTrendPoint } from "./types";

type ConditionRow = {
  status: string;
  severity: string;
  recovery_progress: number;
  condition_key: string;
};

type TrendInput = {
  hydration: WellnessTrendPoint[];
  sleep: WellnessTrendPoint[];
  recovery: WellnessTrendPoint[];
  energy: WellnessTrendPoint[];
};

export function computeWellnessScores(
  conditions: ConditionRow[],
  catalog: Record<string, WellnessCatalogEntry>,
  trends?: TrendInput,
): WellnessScores {
  const active = conditions.filter((c) => c.status !== "recovered");
  const criticalCount = active.filter((c) => c.status === "critical").length;
  const improvingCount = active.filter((c) => c.status === "improving").length;

  const avgRecovery =
    active.length > 0
      ? Math.round(
          active.reduce((sum, c) => sum + (c.recovery_progress ?? 0), 0) / active.length,
        )
      : 72;

  let skin = 78;
  let stress = 72;
  let energy = 74;
  let nutrition = 76;
  let sleep = 75;

  for (const row of active) {
    const meta = catalog[row.condition_key];
    if (!meta) continue;
    skin -= meta.skinImpact * severityWeight(row.severity) * 0.08;
    stress -= meta.stressImpact * severityWeight(row.severity) * 0.07;
    energy -= meta.energyImpact * severityWeight(row.severity) * 0.06;
    nutrition -= 4 * severityWeight(row.severity);
    if (meta.category === "sleep") sleep -= 12 * severityWeight(row.severity);
  }

  if (improvingCount > 0) {
    skin += 4;
    energy += 5;
  }
  if (criticalCount > 0) {
    stress -= 15;
    energy -= 12;
  }

  const hydrationTrend = trends?.hydration ?? [];
  const lastHydration = hydrationTrend[hydrationTrend.length - 1]?.value ?? 0;
  if (lastHydration > 0 && lastHydration < 1800) nutrition -= 8;

  const sleepTrend = trends?.sleep ?? [];
  const lastSleep = sleepTrend[sleepTrend.length - 1]?.value ?? 0;
  if (lastSleep > 0 && lastSleep < 6) sleep -= 10;
  if (lastSleep >= 7) sleep += 6;

  const recovery = Math.round(clamp(avgRecovery + improvingCount * 3 - criticalCount * 8, 35, 98));
  const scores: WellnessScores = {
    recovery,
    energy: clamp(Math.round(energy), 30, 98),
    sleep: clamp(Math.round(sleep), 30, 98),
    skin: clamp(Math.round(skin), 30, 98),
    nutrition: clamp(Math.round(nutrition), 30, 98),
    stress: clamp(Math.round(92 - stress), 30, 98),
    overall: 0,
  };
  scores.overall = Math.round(
    (scores.recovery +
      scores.energy +
      scores.sleep +
      scores.skin +
      scores.nutrition +
      scores.stress) /
      6,
  );
  return scores;
}

function severityWeight(severity: string) {
  if (severity === "severe") return 1;
  if (severity === "moderate") return 0.65;
  return 0.35;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function buildWellnessInsights(args: {
  scores: WellnessScores;
  activeCount: number;
  trends: TrendInput;
}): { id: string; message: string; tone: "positive" | "neutral" | "alert" }[] {
  const insights: { id: string; message: string; tone: "positive" | "neutral" | "alert" }[] = [];

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

  if (args.activeCount > 0 && args.scores.skin < 70) {
    insights.push({
      id: "protein-hair",
      message: "Protein intake may help skin and hair recovery — aim for 1.6g/kg if training.",
      tone: "neutral",
    });
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

  return insights.slice(0, 5);
}
