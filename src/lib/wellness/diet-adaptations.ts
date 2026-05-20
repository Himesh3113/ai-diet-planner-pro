import { getConditionProfile } from "./condition-profiles";

type ActiveCondition = {
  condition_key: string;
  status: string;
  severity: string;
};

export function buildWellnessDietContext(conditions: ActiveCondition[]): string[] {
  const lines: string[] = [];
  const active = conditions.filter((c) => c.status !== "recovered");

  if (active.length === 0) return lines;

  lines.push("Active wellness conditions to adapt meals for:");

  const rules = new Set<string>();
  const avoid = new Set<string>();
  const prefer = new Set<string>();

  for (const row of active) {
    const profile = getConditionProfile(row.condition_key);
    if (!profile) continue;
    lines.push(`- ${profile.title} (${row.severity}, ${row.status})`);
    profile.dietPromptRules.forEach((r) => rules.add(r));
    profile.foodsToAvoid.forEach((f) => avoid.add(f.name));
    profile.recommendedFoods.slice(0, 5).forEach((f) => prefer.add(f.name));
  }

  if (rules.size > 0) {
    lines.push("Wellness meal rules:");
    [...rules].slice(0, 14).forEach((r) => lines.push(`• ${r}`));
  }
  if (avoid.size > 0) {
    lines.push(`STRICTLY reduce or avoid: ${[...avoid].slice(0, 12).join(", ")}.`);
  }
  if (prefer.size > 0) {
    lines.push(`Prefer when compatible with user's selected foods: ${[...prefer].slice(0, 12).join(", ")}.`);
  }

  lines.push("Balance macros realistically; distribute protein across meals; use Indian portions.");

  return lines;
}
