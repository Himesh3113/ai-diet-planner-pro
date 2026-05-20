import { WELLNESS_CATALOG_BY_KEY } from "./catalog";

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
    const meta = WELLNESS_CATALOG_BY_KEY[row.condition_key];
    if (!meta) continue;
    lines.push(`- ${meta.title} (${row.severity}, ${row.status})`);
    meta.dietPromptRules.forEach((r) => rules.add(r));
    meta.foodsToAvoid.forEach((f) => avoid.add(f));
    meta.suggestedFoods.slice(0, 4).forEach((f) => prefer.add(f));
  }

  if (rules.size > 0) {
    lines.push("Wellness meal rules:");
    [...rules].slice(0, 12).forEach((r) => lines.push(`• ${r}`));
  }
  if (avoid.size > 0) {
    lines.push(`Reduce or avoid when possible: ${[...avoid].slice(0, 10).join(", ")}.`);
  }
  if (prefer.size > 0) {
    lines.push(`Prefer when compatible with selected foods: ${[...prefer].slice(0, 10).join(", ")}.`);
  }

  return lines;
}
