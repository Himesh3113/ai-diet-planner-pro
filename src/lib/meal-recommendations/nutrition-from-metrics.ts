import type { MetricsRow, NutritionTargets } from "./types";

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function activityMultiplier(level: MetricsRow["activity_level"]) {
  switch (level) {
    case "sedentary":
      return 1.2;
    case "light":
      return 1.375;
    case "moderate":
      return 1.55;
    case "active":
      return 1.725;
    case "very_active":
      return 1.9;
    default:
      return 1.55;
  }
}

function goalCaloriesDelta(goal: MetricsRow["goal"]) {
  switch (goal) {
    case "bulking":
    case "lean_bulk":
    case "muscle_building":
    case "weight_gain":
      return 300;
    case "cutting":
    case "fat_loss":
    case "weight_loss":
      return -300;
    default:
      return 0;
  }
}

function genderFactor(gender: MetricsRow["gender"]) {
  switch (gender) {
    case "female":
      return -161;
    case "male":
    default:
      return 5;
  }
}

function bmiKgM2(weightKg: number, heightCm: number) {
  const hM = heightCm / 100;
  if (hM <= 0) return null;
  return weightKg / (hM * hM);
}

function computeTDEEKcal(args: {
  age: number;
  gender: MetricsRow["gender"];
  heightCm: number;
  weightKg: number;
  activityLevel: MetricsRow["activity_level"];
}) {
  const bmr =
    10 * args.weightKg +
    6.25 * args.heightCm -
    5 * args.age +
    genderFactor(args.gender);
  const tdee = bmr * activityMultiplier(args.activityLevel);
  return Math.max(1200, Math.round(tdee));
}

function computeDailyCalories(args: {
  age: number;
  gender: MetricsRow["gender"];
  heightCm: number;
  weightKg: number;
  activityLevel: MetricsRow["activity_level"];
  goal: MetricsRow["goal"];
}) {
  const maintenance = computeTDEEKcal(args);
  return Math.max(1200, maintenance + goalCaloriesDelta(args.goal));
}

/** Maintenance (TDEE) without goal adjustment — for analytics comparison lines */
export function computeMaintenanceCalories(metrics: MetricsRow | null): number | null {
  if (!metrics) return null;
  const heightCm = metrics.height;
  const weightKg = metrics.weight;
  const age = metrics.age;
  if (
    heightCm == null ||
    weightKg == null ||
    age == null ||
    heightCm <= 0 ||
    weightKg <= 0 ||
    age <= 0
  ) {
    return null;
  }
  return computeTDEEKcal({
    age,
    gender: metrics.gender ?? null,
    heightCm,
    weightKg,
    activityLevel: metrics.activity_level ?? null,
  });
}

function proteinPerKg(goal: MetricsRow["goal"]): number {
  switch (goal) {
    case "muscle_building":
    case "lean_bulk":
    case "bulking":
      return 1.6;
    case "fat_loss":
    case "cutting":
    case "weight_loss":
      return 1.8;
    case "strength_training":
      return 1.5;
    default:
      return 1.2;
  }
}

function proteinTargetGrams(weightKg: number, goal: MetricsRow["goal"]) {
  return Math.round(weightKg * proteinPerKg(goal));
}

function waterIntakeMlTarget(weightKg: number) {
  return Math.round(clamp(weightKg * 35, 1500, 4500));
}

export function buildNutritionTargets(metrics: MetricsRow | null): NutritionTargets {
  if (!metrics) {
    return {
      dailyCalories: null,
      dailyProteinG: null,
      hydrationMl: null,
      bmi: null,
      goal: null,
      dietType: null,
      allergies: [],
    };
  }

  const heightCm = metrics.height;
  const weightKg = metrics.weight;
  const age = metrics.age;
  const canCalories =
    heightCm != null &&
    weightKg != null &&
    age != null &&
    heightCm > 0 &&
    weightKg > 0 &&
    age > 0;

  let dailyCalories: number | null = null;
  let bmi: number | null = null;
  if (canCalories && heightCm != null && weightKg != null && age != null) {
    bmi = bmiKgM2(weightKg, heightCm);
    dailyCalories = computeDailyCalories({
      age,
      gender: metrics.gender ?? null,
      heightCm,
      weightKg,
      activityLevel: metrics.activity_level ?? null,
      goal: metrics.goal ?? null,
    });
  }

  const dailyProteinG =
    weightKg != null && weightKg > 0 && metrics.goal != null
      ? proteinTargetGrams(weightKg, metrics.goal)
      : null;

  const hydrationMl =
    weightKg != null && weightKg > 0 ? waterIntakeMlTarget(weightKg) : null;

  return {
    dailyCalories,
    dailyProteinG,
    hydrationMl,
    bmi,
    goal: metrics.goal ?? null,
    dietType: metrics.diet_type ?? null,
    allergies: metrics.allergies ?? [],
  };
}
