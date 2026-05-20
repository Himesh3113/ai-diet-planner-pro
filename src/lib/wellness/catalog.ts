import type { WellnessCatalogEntry, WellnessCategory, WellnessFilter } from "./types";

function entry(
  key: string,
  title: string,
  category: WellnessCategory,
  summary: string,
  opts: Partial<
    Pick<
      WellnessCatalogEntry,
      | "suggestedFoods"
      | "foodsToAvoid"
      | "recommendedExercises"
      | "supplementSuggestions"
      | "aiRecommendations"
      | "dietPromptRules"
      | "defaultHydrationMl"
      | "defaultSleepHours"
      | "stressImpact"
      | "energyImpact"
      | "skinImpact"
      | "filterTags"
    >
  > = {},
): WellnessCatalogEntry {
  const categoryFilter: WellnessFilter =
    category === "mental"
      ? "mental"
      : category === "skin"
        ? "skin"
        : category === "fitness"
          ? "fitness"
          : category === "recovery"
            ? "recovery"
            : "lifestyle";
  const filterTags: WellnessFilter[] = opts.filterTags ?? ["active", categoryFilter];
  return {
    key,
    title,
    category,
    summary,
    filterTags,
    suggestedFoods: opts.suggestedFoods ?? ["Dal", "Vegetables", "Curd", "Nuts"],
    foodsToAvoid: opts.foodsToAvoid ?? ["Fried snacks", "Sugary drinks"],
    recommendedExercises: opts.recommendedExercises ?? ["Daily walk 20 min", "Mobility stretches"],
    supplementSuggestions: opts.supplementSuggestions ?? ["Discuss labs with a clinician before supplements"],
    aiRecommendations: opts.aiRecommendations ?? [
      `Track ${title.toLowerCase()} triggers daily`,
      "Pair nutrition with consistent sleep",
      "Log hydration and recovery weekly",
    ],
    dietPromptRules: opts.dietPromptRules ?? [`Support ${title.toLowerCase()} with balanced Indian meals`],
    defaultHydrationMl: opts.defaultHydrationMl ?? 2500,
    defaultSleepHours: opts.defaultSleepHours ?? 8,
    stressImpact: opts.stressImpact ?? 40,
    energyImpact: opts.energyImpact ?? 50,
    skinImpact: opts.skinImpact ?? category === "skin" ? 85 : 30,
  };
}

export const WELLNESS_CATALOG: WellnessCatalogEntry[] = [
  // Skin & Appearance
  entry("acne", "Acne", "skin", "Lower glycemic meals, zinc, omega-3, and trigger tracking.", {
    foodsToAvoid: ["Oily fried snacks", "Sugary drinks", "Excess dairy if it flares you"],
    suggestedFoods: ["Oats", "Dal", "Walnuts", "Curd", "Leafy greens"],
    dietPromptRules: ["Reduce oily and spicy foods", "Prefer low-glycemic Indian meals"],
    skinImpact: 95,
  }),
  entry("oily_skin", "Oily Skin", "skin", "Balance oil production with fiber, hydration, and lighter meals.", {
    foodsToAvoid: ["Deep-fried foods", "Heavy cream gravies"],
    suggestedFoods: ["Cucumber salad", "Oats", "Moong dal", "Citrus"],
    dietPromptRules: ["Reduce oily and fried foods", "Emphasize light, high-fiber meals"],
    skinImpact: 90,
  }),
  entry("dry_skin", "Dry Skin", "skin", "Healthy fats, hydration, and micronutrient-rich meals.", {
    suggestedFoods: ["Ghee (moderate)", "Flaxseed", "Almonds", "Sweet potato", "Curd"],
    dietPromptRules: ["Include healthy fats and hydration-supportive meals"],
    skinImpact: 88,
  }),
  entry("dark_circles", "Dark Circles", "skin", "Sleep rhythm, iron-rich foods, and steady hydration.", {
    suggestedFoods: ["Spinach", "Eggs", "Dates", "Citrus", "Dal"],
    defaultSleepHours: 8.5,
    dietPromptRules: ["Support sleep with magnesium-rich evening meals"],
    skinImpact: 75,
  }),
  entry("hair_fall", "Hair Fall", "skin", "Protein, iron, zinc, biotin-rich Indian staples.", {
    suggestedFoods: ["Eggs", "Dal", "Spinach", "Pumpkin seeds", "Curd"],
    dietPromptRules: ["Increase protein, iron, and biotin-supportive foods"],
    skinImpact: 80,
  }),
  entry("alopecia", "Alopecia", "skin", "Protein-forward nutrition with clinician-guided care.", {
    suggestedFoods: ["Eggs", "Fish/tofu", "Dal", "Nuts", "Leafy greens"],
    dietPromptRules: ["High-quality protein at every meal"],
    skinImpact: 85,
  }),
  entry("dandruff", "Dandruff", "skin", "Zinc, B vitamins, hydration, and scalp-friendly nutrition.", {
    suggestedFoods: ["Pumpkin seeds", "Curd", "Eggs", "Whole grains"],
    dietPromptRules: ["Zinc and B-vitamin supportive meals"],
    skinImpact: 70,
  }),
  entry("weak_beard_growth", "Weak Beard Growth", "skin", "Protein, zinc, vitamin D, and strength training fuel.", {
    suggestedFoods: ["Eggs", "Paneer", "Nuts", "Dal", "Milk"],
    dietPromptRules: ["Protein and zinc-rich meals for androgen support"],
    skinImpact: 65,
  }),
  entry("weak_hair_growth", "Weak Hair Growth", "skin", "Keratin-building protein and micronutrient density.", {
    suggestedFoods: ["Eggs", "Dal rice", "Spinach", "Seeds", "Fish/tofu"],
    dietPromptRules: ["Increase protein and iron-rich foods"],
    skinImpact: 78,
  }),
  entry("uneven_skin_tone", "Uneven Skin Tone", "skin", "Antioxidants, vitamin C foods, and sun-safe habits.", {
    suggestedFoods: ["Amla", "Citrus", "Tomato", "Bell pepper", "Berries"],
    dietPromptRules: ["Antioxidant-rich vegetables and fruits daily"],
    skinImpact: 82,
  }),

  // Fitness & Body
  entry("weight_gain", "Weight Gain", "fitness", "Calorie-dense nutritious meals with protein each feed.", {
    filterTags: ["active", "fitness"],
    suggestedFoods: ["Rice", "Paneer", "Peanut butter", "Banana shake", "Dal"],
    dietPromptRules: ["Calorie-dense but clean Indian meals"],
    energyImpact: 70,
  }),
  entry("weight_loss", "Weight Loss", "fitness", "High satiety protein, fiber, controlled portions.", {
    filterTags: ["active", "fitness"],
    foodsToAvoid: ["Liquid calories", "Frequent fried snacks"],
    dietPromptRules: ["High protein, high fiber, moderate carbs"],
    energyImpact: 65,
  }),
  entry("lean_bulk", "Lean Bulk", "fitness", "Protein timing with quality carbs around training.", {
    filterTags: ["active", "fitness"],
    suggestedFoods: ["Rice", "Chicken/tofu", "Eggs", "Oats", "Milk"],
    dietPromptRules: ["Lean bulk macros: protein + timed carbs"],
  }),
  entry("fat_loss", "Fat Loss", "fitness", "Protein anchor, smart carbs, deficit-friendly meals.", {
    filterTags: ["active", "fitness"],
    dietPromptRules: ["Fat loss: high protein, controlled fats and carbs"],
  }),
  entry("muscle_recovery", "Muscle Recovery", "fitness", "Protein distribution and anti-inflammatory foods.", {
    filterTags: ["active", "recovery", "fitness"],
    suggestedFoods: ["Eggs", "Dal", "Curd", "Turmeric meals", "Banana"],
    dietPromptRules: ["Post-training protein and anti-inflammatory meals"],
  }),
  entry("low_stamina", "Low Stamina", "fitness", "Complex carbs, electrolytes, and iron-aware meals.", {
    suggestedFoods: ["Oats", "Banana", "Dates", "Dal", "Citrus"],
    dietPromptRules: ["Balanced carb/protein timing for endurance"],
    energyImpact: 90,
  }),
  entry("low_strength", "Low Strength", "fitness", "Protein and creatine-friendly whole foods.", {
    suggestedFoods: ["Eggs", "Paneer", "Rice", "Milk", "Chicken/tofu"],
    dietPromptRules: ["Strength support: protein at every meal"],
    energyImpact: 85,
  }),
  entry("slow_metabolism", "Slow Metabolism", "fitness", "Protein, spices, fiber, and NEAT-friendly fueling.", {
    suggestedFoods: ["Green tea", "Dal", "Vegetables", "Lean protein"],
    dietPromptRules: ["Metabolism-friendly: protein, fiber, spice, no crash diets"],
  }),
  entry("skinny_body_type", "Skinny Body Type", "fitness", "Gradual surplus with digestible calorie density.", {
    suggestedFoods: ["Rice", "Ghee", "Smoothies", "Nuts", "Paneer"],
    dietPromptRules: ["Calorie surplus with easy-to-digest Indian meals"],
  }),

  // Pain & Recovery
  entry("joint_pain", "Joint Pain", "recovery", "Anti-inflammatory meals and collagen-support nutrients.", {
    filterTags: ["active", "recovery"],
    suggestedFoods: ["Fish/flax", "Turmeric dal", "Greens", "Curd"],
    foodsToAvoid: ["Excess fried food", "Alcohol"],
    dietPromptRules: ["Anti-inflammatory Indian meals, adequate protein"],
  }),
  entry("knee_pain", "Knee Pain", "recovery", "Protein for muscle support and inflammation-aware meals.", {
    filterTags: ["active", "recovery"],
    suggestedFoods: ["Dal", "Curd", "Fish/tofu", "Turmeric sabzi"],
    dietPromptRules: ["Anti-inflammatory meals, protein for joint support"],
  }),
  entry("back_pain", "Back Pain", "recovery", "Magnesium foods, hydration, anti-inflammatory plate.", {
    filterTags: ["active", "recovery"],
    suggestedFoods: ["Leafy greens", "Nuts", "Dal", "Banana"],
    dietPromptRules: ["Magnesium-rich foods, anti-inflammatory meals"],
  }),
  entry("neck_pain", "Neck Pain", "recovery", "Posture breaks, magnesium, omega-3 supportive nutrition.", {
    filterTags: ["active", "recovery"],
    dietPromptRules: ["Anti-inflammatory, hydration-forward meals"],
  }),
  entry("muscle_soreness", "Muscle Soreness", "recovery", "Protein, tart cherry alternatives, hydration.", {
    filterTags: ["active", "recovery"],
    suggestedFoods: ["Curd", "Eggs", "Banana", "Dal"],
    dietPromptRules: ["Recovery protein and antioxidant-rich foods"],
  }),
  entry("poor_recovery", "Poor Recovery", "recovery", "Sleep, protein, electrolytes, deload weeks.", {
    filterTags: ["active", "recovery", "critical"],
    suggestedFoods: ["Rice", "Dal", "Eggs", "Coconut water"],
    dietPromptRules: ["Recovery-focused protein and carb timing"],
    energyImpact: 88,
  }),
  entry("inflammation", "Inflammation", "recovery", "Omega-3, turmeric, colorful plants, limit fried food.", {
    filterTags: ["active", "recovery", "critical"],
    foodsToAvoid: ["Fried snacks", "Processed meats", "Excess sugar"],
    dietPromptRules: ["Strong anti-inflammatory meal pattern"],
  }),

  // Mental & Lifestyle
  entry("stress", "Stress", "mental", "Magnesium foods, stable blood sugar, caffeine awareness.", {
    filterTags: ["active", "mental", "lifestyle"],
    suggestedFoods: ["Banana", "Dark chocolate (small)", "Spinach", "Nuts", "Oats"],
    dietPromptRules: ["Magnesium-rich foods, stable meal timing, limit caffeine late"],
    stressImpact: 95,
  }),
  entry("anxiety", "Anxiety", "mental", "Gentle carbs + protein, hydration, breath routines.", {
    filterTags: ["active", "mental", "lifestyle"],
    dietPromptRules: ["Avoid long fasting; steady protein + complex carbs"],
    stressImpact: 92,
  }),
  entry("poor_focus", "Poor Focus", "mental", "Protein breakfast, omega-3, hydration, screen breaks.", {
    filterTags: ["active", "mental", "lifestyle"],
    suggestedFoods: ["Eggs", "Walnuts", "Blueberries", "Green tea"],
    dietPromptRules: ["Brain fuel: protein breakfast, omega-3 foods"],
    stressImpact: 70,
  }),
  entry("low_motivation", "Low Motivation", "mental", "Regular meals, vitamin D awareness, movement snacks.", {
    filterTags: ["active", "mental", "lifestyle"],
    energyImpact: 80,
  }),
  entry("burnout", "Burnout", "mental", "Recovery nutrition, sleep priority, workload boundaries.", {
    filterTags: ["active", "mental", "lifestyle", "critical"],
    stressImpact: 98,
    energyImpact: 90,
  }),
  entry("screen_fatigue", "Screen Fatigue", "mental", "Eye breaks, hydration, lutein-rich greens.", {
    filterTags: ["active", "lifestyle", "mental"],
    suggestedFoods: ["Carrot", "Spinach", "Eggs", "Citrus"],
    stressImpact: 55,
  }),
  entry("overthinking", "Overthinking", "mental", "Blood sugar stability, magnesium evening routine.", {
    filterTags: ["active", "mental", "lifestyle"],
    dietPromptRules: ["Evening magnesium-friendly light meals"],
    stressImpact: 85,
  }),

  // Sleep & Energy
  entry("poor_sleep", "Poor Sleep", "sleep", "Earlier caffeine cutoff, light dinner, magnesium foods.", {
    filterTags: ["active", "lifestyle"],
    suggestedFoods: ["Warm milk", "Banana", "Almonds", "Khichdi"],
    foodsToAvoid: ["Late heavy meals", "Caffeine after 2pm"],
    dietPromptRules: ["Sleep-supportive meals; light dinner, magnesium foods"],
    defaultSleepHours: 8.5,
    energyImpact: 85,
  }),
  entry("low_energy", "Low Energy", "sleep", "Iron, B12 awareness, balanced carb/protein timing.", {
    suggestedFoods: ["Dates", "Eggs", "Dal", "Citrus with meals"],
    dietPromptRules: ["Balanced carb/protein timing across the day"],
    energyImpact: 95,
  }),
  entry("daytime_fatigue", "Daytime Fatigue", "sleep", "Protein lunch, hydration, movement breaks.", {
    energyImpact: 90,
    dietPromptRules: ["Avoid heavy lunch slump; protein + fiber midday"],
  }),
  entry("irregular_sleep_schedule", "Irregular Sleep Schedule", "sleep", "Fixed meal windows to anchor circadian rhythm.", {
    dietPromptRules: ["Consistent meal times to support circadian rhythm"],
    defaultSleepHours: 8,
  }),
  entry("sleep_recovery_tracking", "Sleep Recovery Tracking", "sleep", "Track sleep quality alongside nutrition and hydration.", {
    filterTags: ["active", "recovery", "lifestyle"],
    dietPromptRules: ["Evening light meals; morning protein within 1h of waking"],
  }),

  // Digestive & Internal
  entry("bloating", "Bloating", "digestive", "Gentle fiber titration, hydration, trigger log.", {
    foodsToAvoid: ["Large raw salads suddenly", "Carbonated drinks", "Heavy fried meals"],
    suggestedFoods: ["Khichdi", "Moong dal", "Ginger tea", "Cooked vegetables"],
    dietPromptRules: ["Low-bloat meals: cooked veggies, gentle fiber"],
  }),
  entry("acidity", "Acidity", "digestive", "Smaller meals, less spice late, alkaline sides.", {
    foodsToAvoid: ["Late spicy meals", "Excess coffee", "Tomato-heavy dinners"],
    suggestedFoods: ["Curd", "Banana", "Oats", "Coconut water"],
    dietPromptRules: ["Reduce spicy and acidic triggers; smaller dinners"],
  }),
  entry("digestive_issues", "Digestive Issues", "digestive", "Simple whole foods, probiotic-friendly curd.", {
    suggestedFoods: ["Khichdi", "Curd", "Moong dal", "Steamed vegetables"],
    dietPromptRules: ["Easy-to-digest Indian comfort meals"],
  }),
  entry("poor_appetite", "Poor Appetite", "digestive", "Small frequent feeds, calorie-dense smoothies.", {
    suggestedFoods: ["Banana shake", "Khichdi", "Ghee rice", "Nuts"],
    dietPromptRules: ["Small frequent nutrient-dense meals"],
  }),
  entry("constipation", "Constipation", "digestive", "Fiber ramp-up, fluids, movement.", {
    suggestedFoods: ["Prunes", "Oats", "Flaxseed", "Vegetables", "Water"],
    dietPromptRules: ["Fiber and hydration-forward meals"],
    defaultHydrationMl: 3000,
  }),
  entry("vitamin_deficiency", "Vitamin Deficiency", "digestive", "Food-first micronutrients; lab-guided supplements.", {
    suggestedFoods: ["Eggs", "Leafy greens", "Citrus", "Nuts", "Fortified grains"],
    supplementSuggestions: ["Vitamin D", "B12", "Iron only per labs"],
    dietPromptRules: ["Micronutrient-dense varied Indian plates"],
  }),
  entry("low_iron", "Low Iron", "digestive", "Iron with vitamin C pairing; avoid tea with meals.", {
    suggestedFoods: ["Spinach", "Dates", "Jaggery", "Lentils", "Citrus"],
    foodsToAvoid: ["Tea immediately with iron-rich meals"],
    dietPromptRules: ["Iron-rich foods paired with vitamin C"],
  }),
  entry("dehydration", "Dehydration", "digestive", "Structured hydration targets through the day.", {
    defaultHydrationMl: 3200,
    suggestedFoods: ["Coconut water", "Buttermilk", "Cucumber", "Watermelon"],
    dietPromptRules: ["Hydration-forward; include electrolyte-friendly foods"],
    energyImpact: 75,
  }),

  // Legacy keys mapped for health_notes migration
  entry("migraine", "Migraine", "recovery", "Regular meals, hydration, trigger consistency.", {
    foodsToAvoid: ["Long fasting", "Alcohol", "Caffeine swings"],
    dietPromptRules: ["Avoid migraine trigger foods; steady meal timing"],
    filterTags: ["active", "recovery"],
  }),
  entry("pcos", "PCOS", "digestive", "Insulin-aware meals, protein, fiber, strength training.", {
    dietPromptRules: ["Low-GI Indian meals with protein each meal"],
  }),
  entry("diabetes", "Diabetes", "digestive", "Carb quality, portion consistency, protein pairing.", {
    dietPromptRules: ["Glycemic-aware portions; protein with carbs"],
    filterTags: ["active", "critical"],
  }),
  entry("high_bp", "High BP", "digestive", "Lower sodium, potassium-rich whole foods.", {
    foodsToAvoid: ["Excess salt", "Pickles", "Processed snacks"],
    dietPromptRules: ["Lower sodium Indian meals; more potassium foods"],
  }),
  entry("thyroid", "Thyroid", "digestive", "Adequate protein, iodine/selenium food sources.", {
    dietPromptRules: ["Protein-forward; selenium and iodine-aware foods"],
  }),
  entry("gym_muscle_gain", "Gym Muscle Gain", "fitness", "Protein distribution and training-day carbs.", {
    filterTags: ["active", "fitness"],
    suggestedFoods: ["Rice", "Eggs", "Chicken/tofu", "Milk", "Banana"],
    dietPromptRules: ["Muscle gain protein and carb timing"],
  }),
];

export const WELLNESS_CATALOG_BY_KEY = Object.fromEntries(
  WELLNESS_CATALOG.map((c) => [c.key, c]),
) as Record<string, WellnessCatalogEntry>;

export function getCatalogEntry(key: string): WellnessCatalogEntry | undefined {
  return WELLNESS_CATALOG_BY_KEY[key];
}

export function catalogKeys(): string[] {
  return WELLNESS_CATALOG.map((c) => c.key);
}
