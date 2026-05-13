import { buildNutritionTargets } from "@/lib/meal-recommendations/nutrition-from-metrics";
import type {
  DailyRoutinePlan,
  GoalMode,
  InsightCard,
  MetricsRow,
  RoutineChecklistItem,
  TimedBlock,
} from "./types";

function normalizePrefs(metrics: MetricsRow | null): string {
  const prefs = metrics?.food_preferences ?? [];
  return prefs.join(" ").toLowerCase();
}

function inferGoalMode(metrics: MetricsRow | null): GoalMode {
  const g = metrics?.goal;
  if (
    g === "cutting" ||
    g === "fat_loss" ||
    g === "weight_loss"
  ) {
    return "fat_loss";
  }
  if (
    g === "bulking" ||
    g === "lean_bulk" ||
    g === "muscle_building" ||
    g === "weight_gain" ||
    g === "strength_training"
  ) {
    return "muscle_gain";
  }
  return "maintenance";
}

function isDiabetesProfile(metrics: MetricsRow | null): boolean {
  return (
    metrics?.goal === "diabetic_diet" ||
    metrics?.non_gym_category === "diabetic_diet"
  );
}

function prefsMatch(metrics: MetricsRow | null, rx: RegExp): boolean {
  return rx.test(normalizePrefs(metrics));
}

function highProteinGoal(metrics: MetricsRow | null): boolean {
  const m = inferGoalMode(metrics);
  if (m === "muscle_gain") return true;
  const g = metrics?.goal;
  return g === "strength_training" || g === "cutting" || g === "fat_loss";
}

function trainsToday(metrics: MetricsRow | null): boolean {
  const t = metrics?.training_type;
  return t === "gym" || t === "home";
}

function workoutIntensityHint(metrics: MetricsRow | null): string {
  switch (metrics?.activity_level) {
    case "very_active":
    case "active":
      return "Keep hard sessions ≤90 minutes including warm-up; two easier days if joints feel stiff.";
    case "sedentary":
    case "light":
      return "Bias toward walking or mobility first—add resistance gradually as tolerance builds.";
    default:
      return "Match session length to how you feel tomorrow morning, not just today’s motivation.";
  }
}

function pickWakeAndBed(metrics: MetricsRow | null): { wake: string; bed: string; hours: string } {
  const mode = inferGoalMode(metrics);
  const act = metrics?.activity_level;

  if (mode === "fat_loss" && (act === "active" || act === "very_active")) {
    return { wake: "6:15 – 6:45", bed: "22:00 – 22:45", hours: "7.5 – 8 h" };
  }
  if (mode === "muscle_gain") {
    return { wake: "6:45 – 7:15", bed: "22:30 – 23:15", hours: "7.5 – 8.5 h" };
  }
  if (act === "sedentary" || act === "light") {
    return { wake: "7:00 – 7:30", bed: "22:45 – 23:30", hours: "7 – 8 h" };
  }
  return { wake: "6:30 – 7:00", bed: "22:30 – 23:15", hours: "7.5 – 8 h" };
}

function mealBlocks(metrics: MetricsRow | null, mode: GoalMode): TimedBlock[] {
  const diabetes = isDiabetesProfile(metrics);
  const pair = diabetes
    ? "Pair starches with protein or fiber; keep spacing similar day to day."
    : "Keep protein visible in each main meal to support satiety and recovery.";

  if (mode === "fat_loss") {
    return [
      {
        timeLabel: "7:15 – 8:00",
        title: "Breakfast window",
        detail: `${pair} Earlier breakfast helps appetite control for many people in a deficit.`,
      },
      {
        timeLabel: "12:00 – 13:00",
        title: "Lunch anchor",
        detail: "Largest vegetable volume here; avoid skipping—skips often backfire at night.",
      },
      {
        timeLabel: "15:30 – 16:00",
        title: "Protein-forward snack",
        detail: "Bridge to dinner without a full second lunch; yogurt, cottage cheese, or tofu cube.",
      },
      {
        timeLabel: "18:00 – 19:00",
        title: "Dinner (lighter evening)",
        detail: "Finish heavier eating earlier if sleep is a priority; still hit daily protein.",
      },
    ];
  }

  if (mode === "muscle_gain") {
    return [
      {
        timeLabel: "7:00 – 8:30",
        title: "Breakfast + fuel check",
        detail: `${pair} Include complex carbs if you train morning; add fruit for micronutrients.`,
      },
      {
        timeLabel: "12:30 – 13:30",
        title: "Lunch density",
        detail: "Carb + protein + color: supports afternoon training or active jobs.",
      },
      {
        timeLabel: "16:00 – 16:30",
        title: "Pre-training bite (if PM workout)",
        detail: "Banana + yogurt or toast + egg—easy to digest 60–90 minutes out.",
      },
      {
        timeLabel: "19:30 – 20:30",
        title: "Dinner recovery",
        detail: "Post-workout: prioritize protein and carbs within a few hours of the session.",
      },
    ];
  }

  return [
    {
      timeLabel: "7:30 – 8:30",
      title: "Breakfast",
      detail: pair,
    },
    {
      timeLabel: "12:30 – 13:30",
      title: "Lunch",
      detail: "Balanced plate: half plants, quarter protein, quarter whole grains or starchy veg.",
    },
    {
      timeLabel: "15:30 – 16:00",
      title: "Optional snack",
      detail: "Only if genuinely hungry—fruit + nuts or hummus + veg.",
    },
    {
      timeLabel: "18:30 – 19:30",
      title: "Dinner",
      detail: "Keep timing consistent across weekdays for sleep and digestion predictability.",
    },
  ];
}

function hydrationReminders(targetMl: number | null): TimedBlock[] {
  const base = targetMl ?? 2000;
  const chunk = Math.max(250, Math.round(base / 6 / 250) * 250);
  return [
    {
      timeLabel: "Upon waking",
      title: `~${chunk} ml`,
      detail: "Replaces overnight losses; sip before coffee when possible.",
    },
    {
      timeLabel: "Mid-morning",
      title: `~${chunk} ml`,
      detail: "Desk bottle rule: finish before lunch prep starts.",
    },
    {
      timeLabel: "Pre-lunch",
      title: `~${chunk} ml`,
      detail: "Separates thirst from appetite cues.",
    },
    {
      timeLabel: "Mid-afternoon",
      title: `~${chunk} ml`,
      detail: "Add electrolytes only if you sweat heavily or your clinician suggests it.",
    },
    {
      timeLabel: "Pre-dinner",
      title: `~${chunk} ml`,
      detail: "Taper fluids 60–90 minutes before bed if night waking is an issue.",
    },
  ];
}

function morningBlocks(metrics: MetricsRow | null): TimedBlock[] {
  const { wake } = pickWakeAndBed(metrics);
  const lightFirst =
    metrics?.activity_level === "sedentary" || metrics?.activity_level === "light";

  return [
    {
      timeLabel: `${wake.split("–")[0].trim()} start`,
      title: "Hydration + light",
      detail: "250–500 ml water, 2 minutes nasal breathing, open blinds for circadian cue.",
    },
    {
      timeLabel: "+10 min",
      title: lightFirst ? "Mobility micro-flow" : "Dynamic warm-up primer",
      detail: lightFirst
        ? "Neck rolls, thoracic opens, hip circles—especially if desk-bound yesterday."
        : "Leg swings, arm circles, ankle rocks—prep for a harder day of movement.",
    },
    {
      timeLabel: "+20 min",
      title: "Protein-aware breakfast prep",
      detail:
        metrics?.diet_type === "veg"
          ? "Tofu, dal, Greek-style plant yogurt, or paneer if you include dairy."
          : "Eggs, yogurt, or lean protein—match your diet_type preference.",
    },
  ];
}

function workoutBlocks(metrics: MetricsRow | null, mode: GoalMode): TimedBlock[] {
  if (!trainsToday(metrics)) {
    return [
      {
        timeLabel: "Any 25–40 min",
        title: "Movement snack",
        detail:
          "Brisk walk, stairs, or body-weight circuit—keeps NEAT aligned with your activity_level setting.",
      },
      {
        timeLabel: "Optional second block",
        title: "Evening stretch",
        detail: "5–8 minutes hips and thoracic spine—pairs well with wind-down.",
      },
    ];
  }

  const amBias = mode === "fat_loss" || metrics?.activity_level === "very_active";
  return [
    {
      timeLabel: amBias ? "7:00 – 9:00" : "17:00 – 19:30",
      title: metrics?.training_type === "gym" ? "Gym block" : "Home strength / conditioning",
      detail: workoutIntensityHint(metrics),
    },
    {
      timeLabel: "Within 2 h post",
      title: "Recovery nutrition",
      detail:
        mode === "muscle_gain"
          ? "Carb + protein meal or shake—hit your daily protein target across the full day."
          : "Lean protein + vegetables; carbs scaled to hunger and training volume.",
    },
  ];
}

function conditionCards(metrics: MetricsRow | null): InsightCard[] {
  const cards: InsightCard[] = [];

  if (isDiabetesProfile(metrics)) {
    cards.push({
      id: "diabetes",
      title: "Diabetes-aware rhythm",
      body: "Keep meal spacing predictable, favor fiber-first plates, and walk 8–12 minutes after larger carb meals when safe for you.",
      accent: "diabetes",
    });
  }

  const acneSignal =
    prefsMatch(metrics, /acne|skin|derma/) ||
    inferGoalMode(metrics) === "fat_loss";

  if (acneSignal) {
    cards.push({
      id: "skin",
      title: "Skin-steady structure",
      body: "Regular meals, lower glycemic swings, and sleeping on a consistent schedule often matter as much as any single “superfood.”",
      accent: "skin",
    });
  }

  const jointSignal =
    prefsMatch(metrics, /knee|joint|arthritis|mobility/) ||
    metrics?.activity_level === "very_active" ||
    metrics?.activity_level === "active";

  if (jointSignal) {
    cards.push({
      id: "joint",
      title: "Joint-friendly loading",
      body: "Warm tissues before intensity, vary impact surfaces, and bias anti-inflammatory plates (colorful plants, omega-3 sources you tolerate).",
      accent: "joint",
    });
  }

  const hairSignal =
    prefsMatch(metrics, /hair|biotin|keratin/) || highProteinGoal(metrics);

  if (hairSignal) {
    cards.push({
      id: "hair",
      title: "Hair-support nutrition timing",
      body: "Distribute protein across meals instead of one giant dinner; iron and zinc come from varied whole foods—confirm labs if shedding persists.",
      accent: "hair",
    });
  }

  const allergyN = metrics?.allergies?.length ?? 0;
  if (metrics && allergyN > 0) {
    cards.push({
      id: "allergy",
      title: "Allergy-safe kitchen flow",
      body: `You listed ${allergyN} sensitivities—prep surfaces first, read labels once per shop, and keep emergency snacks you trust.`,
      accent: "default",
    });
  }

  return cards;
}

function goalCards(metrics: MetricsRow | null, mode: GoalMode): InsightCard[] {
  if (mode === "fat_loss") {
    return [
      {
        id: "g_fat",
        title: "Deficit discipline",
        body: "Front-load steps and protein; let hunger cues guide optional snacks, not boredom.",
        accent: "goal",
      },
    ];
  }
  if (mode === "muscle_gain") {
    return [
      {
        id: "g_muscle",
        title: "Surplus quality",
        body: "Add calories around training and recovery; sleep is anabolic insurance.",
        accent: "goal",
      },
    ];
  }
  return [
    {
      id: "g_maint",
      title: "Maintenance consistency",
      body: "Protect weekly averages more than single days—flex social meals, return to baseline the next day.",
      accent: "goal",
    },
  ];
}

const CHECKLIST: RoutineChecklistItem[] = [
  { id: "morning_hydration", label: "Morning water + light exposure" },
  { id: "morning_movement", label: "Mobility or warm-up completed" },
  { id: "breakfast_window", label: "Ate within breakfast window" },
  { id: "lunch_window", label: "Lunch anchored on time" },
  { id: "hydration_check", label: "Hit mid-day hydration checkpoints" },
  { id: "workout_block", label: "Movement / workout block done" },
  { id: "dinner_window", label: "Dinner within suggested window" },
  { id: "evening_wind_down", label: "Screens dimmed 45 min pre-sleep" },
  { id: "sleep_window", label: "Bedtime within sleep window" },
];

export function buildDailyRoutine(metrics: MetricsRow | null): DailyRoutinePlan {
  const targets = buildNutritionTargets(metrics);
  const mode = inferGoalMode(metrics);
  const { wake, bed, hours } = pickWakeAndBed(metrics);

  const headline = metrics
    ? "Your smart day blueprint"
    : "Complete onboarding for a tailored routine";

  const subline = metrics
    ? `Tuned for ${mode.replace(/_/g, " ")} pattern using your saved activity, training, and diet preferences.`
    : "Defaults below are general—save metrics to personalize timing and hydration.";

  return {
    headline,
    subline,
    goalMode: mode,
    morning: morningBlocks(metrics),
    mealTiming: mealBlocks(metrics, mode),
    hydration: {
      dailyTargetMl: targets.hydrationMl,
      reminders: hydrationReminders(targets.hydrationMl),
      tip: `Aim near ${targets.hydrationMl ?? 2000} ml from fluids; food contributes roughly 15–25% more moisture.`,
    },
    workout: workoutBlocks(metrics, mode),
    sleep: {
      targetHours: hours,
      wakeTarget: wake,
      bedTarget: bed,
      rationale:
        "Sleep anchors appetite, recovery, and focus—shift earlier if mornings feel groggy or cravings spike at night.",
    },
    conditionCards: conditionCards(metrics),
    goalCards: goalCards(metrics, mode),
    checklist: CHECKLIST,
  };
}
