import { WELLNESS_CATALOG_BY_KEY } from "./catalog";
import { GENERAL_HIGH_PROTEIN, HAIR_FOODS, JOINT_FOODS, SKIN_FOODS } from "./food-templates";
import type { WellnessCategory, WellnessConditionProfile, WellnessFoodAvoid, WellnessSeverity } from "./types";

const SEVERITY_DEFAULT = {
  mild: "Occasional symptoms; manageable with basic lifestyle tweaks.",
  moderate: "Regular symptoms affecting daily comfort; structured plan recommended.",
  severe: "Frequent or intense symptoms; prioritize medical guidance alongside nutrition.",
};

const TIMELINE_DEFAULT = {
  mild: "2–4 weeks with consistent habits",
  moderate: "4–8 weeks with structured nutrition & recovery",
  severe: "8–12+ weeks; clinician-guided plan advised",
};

function baseImpacts(category: WellnessCategory) {
  if (category === "skin") {
    return {
      stress: "Stress can worsen flare-ups via cortisol and inflammation.",
      sleep: "Poor sleep delays skin repair and barrier recovery.",
      workout: "Sweat management matters; shower after intense sessions.",
      hydration: "Low hydration can dull skin and worsen oil imbalance.",
      nutrition: "Glycemic spikes and fried foods often correlate with breakouts.",
    };
  }
  if (category === "sleep" || category === "mental") {
    return {
      stress: "High stress is a primary driver — prioritize nervous system recovery.",
      sleep: "Sleep is the core lever; irregular schedules amplify symptoms.",
      workout: "Light movement helps; avoid overtraining when depleted.",
      hydration: "Dehydration worsens fatigue and headache thresholds.",
      nutrition: "Blood sugar stability reduces energy crashes.",
    };
  }
  if (category === "recovery") {
    return {
      stress: "Stress slows tissue repair and raises perceived pain.",
      sleep: "Deep sleep is when most recovery occurs.",
      workout: "Load management is critical — deload during flare-ups.",
      hydration: "Hydration supports joint lubrication and training tolerance.",
      nutrition: "Anti-inflammatory meals reduce recovery friction.",
    };
  }
  return {
    stress: "Moderate stress can slow progress — use breathwork and meal timing.",
    sleep: "7–8 hours supports hormonal balance and recovery.",
    workout: "Progressive training with adequate protein fuels adaptation.",
    hydration: "Target steady water intake across the day.",
    nutrition: "Protein and micronutrient density drive outcomes.",
  };
}

function defaultAvoid(category: WellnessCategory): WellnessFoodAvoid[] {
  const common: WellnessFoodAvoid[] = [
    { name: "Sugary drinks", reason: "Spikes insulin and inflammation" },
    { name: "Deep-fried snacks", reason: "High oxidized fats worsen many conditions" },
    { name: "Late heavy meals", reason: "Disrupts sleep and digestion" },
    { name: "Excess caffeine", reason: "Can worsen stress, sleep, and skin" },
    { name: "Alcohol", reason: "Dehydrates and impairs recovery" },
  ];
  if (category === "skin") {
    return [
      { name: "Oily street food", reason: "May increase sebum and breakouts" },
      { name: "Frequent sweets", reason: "High glycemic load linked to acne" },
      ...common.slice(0, 3),
    ];
  }
  return common;
}

function defaultSupplements(category: WellnessCategory) {
  const base = [
    {
      name: "Vitamin D",
      purpose: "Hormone & immune support",
      benefits: "Supports mood, immunity, and hair/skin when deficient",
      timing: "With breakfast containing fat",
    },
    {
      name: "Magnesium",
      purpose: "Sleep & stress",
      benefits: "Supports relaxation and muscle recovery",
      timing: "Evening, 1–2h before bed",
    },
  ];
  if (category === "skin") {
    return [
      {
        name: "Zinc",
        purpose: "Skin repair",
        benefits: "May support acne-prone skin when deficient",
        timing: "With food, away from iron-rich meals",
      },
      {
        name: "Omega-3",
        purpose: "Anti-inflammatory",
        benefits: "Balances inflammatory pathways",
        timing: "Lunch or dinner with meal",
      },
      ...base,
    ];
  }
  if (category === "recovery") {
    return [
      {
        name: "Omega-3",
        purpose: "Joint inflammation",
        benefits: "EPA/DHA support recovery",
        timing: "With largest meal",
      },
      ...base,
    ];
  }
  return [
    {
      name: "Iron",
      purpose: "Energy & hair",
      benefits: "Only if labs show deficiency",
      timing: "Morning with vitamin C, away from tea",
    },
    {
      name: "Biotin",
      purpose: "Hair structure",
      benefits: "Supports keratin when diet is low in protein",
      timing: "Morning with breakfast",
    },
    ...base.slice(0, 4),
  ];
}

function defaultRoutine(title: string): WellnessConditionProfile["dailyRoutine"] {
  return [
    {
      period: "morning",
      items: [
        "Protein-forward breakfast aligned with your Diet Planner foods",
        "500ml water within 30 minutes of waking",
        "5-minute mobility or walk",
        `Light skincare/sun protection if relevant to ${title}`,
      ],
    },
    {
      period: "afternoon",
      items: [
        "Balanced lunch — protein + vegetables + smart carbs",
        "Hydration top-up (500–750ml)",
        "2-minute stretch break if desk-bound",
      ],
    },
    {
      period: "evening",
      items: [
        "Anti-inflammatory dinner — lighter spice if sensitive",
        "Gentle walk or yoga 15 min",
        "Log symptoms in Wellness Hub",
      ],
    },
    {
      period: "night",
      items: [
        "Magnesium-friendly light snack if needed",
        "Screen dimming 60 min before bed",
        "Sleep target from your wellness card",
      ],
    },
  ];
}

function buildDefaultProfile(key: string): WellnessConditionProfile | null {
  const catalog = WELLNESS_CATALOG_BY_KEY[key];
  if (!catalog) return null;

  let foods = GENERAL_HIGH_PROTEIN;
  if (catalog.category === "skin") foods = SKIN_FOODS;
  else if (key.includes("hair") || key.includes("alopecia")) foods = HAIR_FOODS;
  else if (
    catalog.category === "recovery" ||
    key.includes("pain") ||
    key.includes("inflammation")
  ) {
    foods = JOINT_FOODS;
  }

  return {
    key,
    title: catalog.title,
    category: catalog.category,
    overview: catalog.summary,
    possibleCauses: [
      "Nutrition gaps (protein, iron, omega-3)",
      "Poor sleep or high stress",
      "Dehydration or irregular meal timing",
      "Training overload without recovery",
    ],
    commonSymptoms: [
      "Variable day-to-day intensity",
      "Triggers after specific foods or poor sleep",
      "Slow improvement without structured plan",
    ],
    severityExplanation: SEVERITY_DEFAULT,
    recoveryDifficulty: catalog.category === "recovery" ? "Moderate–high" : "Moderate",
    estimatedTimeline: TIMELINE_DEFAULT,
    lifestyleImpact: `Affects energy, confidence, and daily routines related to ${catalog.title.toLowerCase()}.`,
    dailyPrecautions: catalog.dietPromptRules.concat([
      "Track hydration in Activity/Hydration modules",
      "Sync meals with Diet Planner for condition-aware plans",
    ]),
    impacts: baseImpacts(catalog.category),
    recommendedFoods: foods,
    foodsToAvoid: defaultAvoid(catalog.category),
    supplements: defaultSupplements(catalog.category).slice(0, 6),
    dailyRoutine: defaultRoutine(catalog.title),
    recommendedExercises: catalog.recommendedExercises,
    aiInsights: catalog.aiRecommendations,
    dietPromptRules: catalog.dietPromptRules,
    defaultHydrationMl: catalog.defaultHydrationMl,
    defaultSleepHours: catalog.defaultSleepHours,
    stressImpact: catalog.stressImpact,
    energyImpact: catalog.energyImpact,
    skinImpact: catalog.skinImpact,
  };
}

const DETAILED: Record<string, Partial<WellnessConditionProfile>> = {
  acne: {
    overview:
      "Acne is driven by oil production, clogged pores, bacteria, and inflammation — nutrition lowers glycemic load and supports skin repair.",
    possibleCauses: [
      "High glycemic meals and sugary drinks",
      "Dairy sensitivity in some individuals",
      "Stress, poor sleep, and hormonal shifts",
      "Comedogenic skincare or infrequent cleansing after sweat",
    ],
    commonSymptoms: [
      "Whiteheads and inflamed papules",
      "Oily T-zone",
      "Post-inflammatory marks",
    ],
    recoveryDifficulty: "Moderate — nutrition helps but consistency is key",
    estimatedTimeline: {
      mild: "3–6 weeks",
      moderate: "6–10 weeks",
      severe: "3–6 months with dermatology support",
    },
    lifestyleImpact: "Can affect confidence, social comfort, and skincare spend.",
    dailyPrecautions: [
      "Wash face after workouts; change pillowcases twice weekly",
      "Prefer low-GI Indian meals",
      "Avoid picking lesions",
    ],
    impacts: baseImpacts("skin"),
    recommendedFoods: SKIN_FOODS,
    foodsToAvoid: [
      { name: "Sugary chai & sodas", reason: "Insulin spikes may worsen breakouts" },
      { name: "Frequent pakoras/samosa", reason: "Oxidized frying oils increase inflammation" },
      { name: "Large white bread meals", reason: "High glycemic load" },
      { name: "Excess milk if you flare", reason: "Individual dairy trigger" },
      { name: "Late spicy dinners", reason: "May disrupt sleep and gut-skin axis" },
    ],
    supplements: [
      {
        name: "Zinc",
        purpose: "Sebum & repair",
        benefits: "Supports skin healing when deficient",
        timing: "With lunch, away from iron",
      },
      {
        name: "Omega-3",
        purpose: "Anti-inflammatory",
        benefits: "Balances inflammatory skin pathways",
        timing: "Dinner with fats",
      },
      {
        name: "Vitamin D",
        purpose: "Immune modulation",
        benefits: "Supports skin immunity",
        timing: "Morning with breakfast",
      },
    ],
    aiInsights: [
      "Low hydration may worsen acne by increasing sugary drink cravings.",
      "Poor sleep raises cortisol, which can increase oil production.",
      "High stress can trigger inflammatory flares within 48 hours.",
    ],
  },
  hair_fall: {
    overview:
      "Hair shedding reflects follicle cycling, nutrition, hormones, and stress. Protein, iron, zinc, and sleep are the primary levers.",
    possibleCauses: [
      "Low protein or crash dieting",
      "Iron, zinc, B12, or vitamin D deficiency",
      "Thyroid shifts, post-illness shedding",
      "Chronic stress and poor sleep",
    ],
    commonSymptoms: [
      "More hair on brush/shower",
      "Thinning temples or crown",
      "Brittle strands",
    ],
    recoveryDifficulty: "Moderate–high if nutritional deficiency exists",
    estimatedTimeline: {
      mild: "6–8 weeks",
      moderate: "3–4 months",
      severe: "6+ months; labs recommended",
    },
    impacts: {
      stress: "Telogen effluvium can follow major stress 6–12 weeks later.",
      sleep: "Poor sleep may slow hair recovery.",
      workout: "Overtraining without fuel increases shedding risk.",
      hydration: "Indirect — supports appetite for protein meals.",
      nutrition: "Protein and iron are the dominant nutritional levers.",
    },
    recommendedFoods: HAIR_FOODS,
    foodsToAvoid: [
      { name: "Very low-calorie days", reason: "Energy deficit pushes follicles to shed" },
      { name: "Skipping protein at breakfast", reason: "Missed amino acid distribution" },
      { name: "Excess alcohol", reason: "Depletes nutrients and sleep quality" },
      { name: "Tea with iron-rich meals", reason: "Blocks iron absorption" },
      { name: "Unverified megadose supplements", reason: "Can imbalance minerals" },
    ],
    supplements: [
      {
        name: "Iron",
        purpose: "Ferritin support",
        benefits: "Critical when deficient — confirm with labs",
        timing: "Morning with vitamin C food",
      },
      {
        name: "Biotin",
        purpose: "Keratin support",
        benefits: "Helps when dietary protein is low",
        timing: "Breakfast",
      },
      {
        name: "Zinc",
        purpose: "Follicle cycling",
        benefits: "Supports growth phase",
        timing: "With food",
      },
      {
        name: "Vitamin D",
        purpose: "Hormonal support",
        benefits: "Common deficiency linked to shedding",
        timing: "Morning",
      },
    ],
    aiInsights: [
      "Protein intake below ~1.2g/kg may slow hair recovery.",
      "Poor sleep may slow hair recovery — aim 7–8 hours.",
      "High stress can increase shedding 2–3 months later.",
    ],
  },
  knee_pain: {
    overview:
      "Knee discomfort often involves load, inflammation, and muscle support. Nutrition supports tissue repair; training load must match capacity.",
    possibleCauses: [
      "Weak quads/glutes",
      "Sudden mileage or squat volume spikes",
      "Excess body weight load",
      "Prior injury or arthritis",
    ],
    commonSymptoms: ["Stiffness after sitting", "Pain on stairs", "Swelling after activity"],
    recoveryDifficulty: "Moderate — depends on structural factors",
    recommendedFoods: JOINT_FOODS,
    foodsToAvoid: [
      { name: "Frequent fried foods", reason: "Pro-inflammatory" },
      { name: "Excess refined sugar", reason: "May worsen inflammation" },
      { name: "Alcohol binges", reason: "Impairs sleep and recovery" },
      { name: "Large calorie surpluses", reason: "Increases joint load" },
      { name: "Training through sharp pain", reason: "Mechanical aggravation" },
    ],
    aiInsights: [
      "Anti-inflammatory meals may reduce perceived stiffness within 1–2 weeks.",
      "Protein supports muscle that stabilizes the knee.",
      "Hydration supports training tolerance on hot days.",
    ],
  },
  joint_pain: {
    recommendedFoods: JOINT_FOODS,
    foodsToAvoid: defaultAvoid("recovery"),
    aiInsights: [
      "Omega-3 rich meals may support joint comfort.",
      "Low hydration can increase perceived stiffness.",
    ],
  },
  migraine: {
    overview:
      "Migraines involve neurovascular sensitivity. Meal timing, hydration, magnesium, and trigger avoidance are central.",
    possibleCauses: [
      "Dehydration or fasting",
      "Sleep disruption",
      "Caffeine swings",
      "Stress and weather changes",
    ],
    commonSymptoms: ["Throbbing head pain", "Light sensitivity", "Nausea"],
    recommendedFoods: [
      ...JOINT_FOODS.slice(0, 3),
      ...GENERAL_HIGH_PROTEIN.slice(0, 4),
    ],
    foodsToAvoid: [
      { name: "Long fasting windows", reason: "Blood sugar dips trigger attacks" },
      { name: "Alcohol", reason: "Common trigger" },
      { name: "Aged cheese (if sensitive)", reason: "Tyramine trigger" },
      { name: "Caffeine overload", reason: "Rebound headaches" },
      { name: "Dehydration", reason: "Low fluid status lowers threshold" },
    ],
    aiInsights: [
      "High stress can increase migraine frequency.",
      "Poor sleep lowers migraine threshold significantly.",
      "Steady hydration reduces attack risk.",
    ],
  },
  poor_sleep: {
    aiInsights: [
      "Poor sleep may slow hair and muscle recovery.",
      "Late caffeine cuts deep sleep by up to 20%.",
      "Magnesium-rich evening meals support sleep onset.",
    ],
  },
  low_energy: {
    aiInsights: [
      "Protein intake below target may cause afternoon crashes.",
      "Low hydration mimics fatigue — check water before coffee.",
      "Irregular meals destabilize blood sugar.",
    ],
  },
  stress: {
    aiInsights: [
      "High stress can increase migraine frequency and skin flares.",
      "Magnesium-rich foods support nervous system recovery.",
      "Skipping meals worsens cortisol swings.",
    ],
  },
  muscle_recovery: {
    aiInsights: [
      "Protein intake is below optimal for muscle recovery if under 1.6g/kg.",
      "Sleep under 7h reduces muscle protein synthesis.",
      "Hydration supports nutrient delivery to muscle.",
    ],
  },
};

export function getConditionProfile(key: string): WellnessConditionProfile | null {
  const base = buildDefaultProfile(key);
  if (!base) return null;
  const extra = DETAILED[key];
  if (!extra) return base;
  return {
    ...base,
    ...extra,
    recommendedFoods: extra.recommendedFoods ?? base.recommendedFoods,
    foodsToAvoid: extra.foodsToAvoid ?? base.foodsToAvoid,
    supplements: extra.supplements ?? base.supplements,
    impacts: { ...base.impacts, ...extra.impacts },
    aiInsights: extra.aiInsights ?? base.aiInsights,
    severityExplanation: { ...base.severityExplanation, ...extra.severityExplanation },
    estimatedTimeline: { ...base.estimatedTimeline, ...extra.estimatedTimeline },
  };
}

export function getSeverityExplanation(profile: WellnessConditionProfile, severity: WellnessSeverity) {
  return profile.severityExplanation[severity];
}

export function getEstimatedTimeline(profile: WellnessConditionProfile, severity: WellnessSeverity) {
  return profile.estimatedTimeline[severity];
}

export function profilesForKeys(keys: string[]): Record<string, WellnessConditionProfile> {
  const out: Record<string, WellnessConditionProfile> = {};
  for (const key of keys) {
    const p = getConditionProfile(key);
    if (p) out[key] = p;
  }
  return out;
}
