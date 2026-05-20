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

export { buildWellnessInsights } from "./insights";
