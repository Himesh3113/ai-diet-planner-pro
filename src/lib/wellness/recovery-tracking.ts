import type { ConditionRecoveryStats, WellnessTrendPoint } from "./types";

type ProgressRow = {
  wellness_condition_id: string;
  recorded_on: string;
  recovery_score: number;
};

type LogRow = {
  wellness_condition_id: string | null;
  log_type: string;
  logged_at: string;
};

export function computeConditionRecoveryStats(
  conditionId: string,
  progress: ProgressRow[],
  logs: LogRow[],
  currentProgress: number,
  status: string,
): ConditionRecoveryStats {
  const rows = progress
    .filter((p) => p.wellness_condition_id === conditionId)
    .sort((a, b) => a.recorded_on.localeCompare(b.recorded_on));

  const weeklyTrend: WellnessTrendPoint[] = rows.map((r) => ({
    date: r.recorded_on,
    value: r.recovery_score ?? 0,
  }));

  const first = rows[0]?.recovery_score ?? currentProgress;
  const last = rows[rows.length - 1]?.recovery_score ?? currentProgress;
  const improvementDelta = last - first;

  const indicators: string[] = [];
  if (improvementDelta >= 10) indicators.push("Recovery trending up");
  if (improvementDelta <= -5) indicators.push("Needs attention");
  if (status === "improving") indicators.push("Status: improving");
  if (currentProgress >= 70) indicators.push("Strong recovery progress");
  if (currentProgress < 30) indicators.push("Early stage monitoring");

  const streakDays = computeStreak(conditionId, logs, progress);

  return {
    conditionId,
    weeklyTrend,
    improvementDelta,
    streakDays,
    indicators,
  };
}

function computeStreak(
  conditionId: string,
  logs: LogRow[],
  progress: ProgressRow[],
): number {
  const dates = new Set<string>();
  for (const p of progress.filter((x) => x.wellness_condition_id === conditionId)) {
    dates.add(p.recorded_on);
  }
  for (const l of logs.filter(
    (x) => x.wellness_condition_id === conditionId && x.log_type === "progress",
  )) {
    dates.add(l.logged_at.split("T")[0]);
  }

  if (dates.size === 0) return 0;

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (dates.has(key)) streak++;
    else if (i > 0) break;
  }
  return streak;
}
