export type HealthConditionKey =
  | "acne"
  | "hair_fall"
  | "knee_pain"
  | "migraine"
  | "weight_loss"
  | "weight_gain"
  | "pcos"
  | "diabetes"
  | "high_bp"
  | "thyroid"
  | "low_energy"
  | "poor_sleep"
  | "stress_anxiety"
  | "gym_muscle_gain"
  | "digestion_bloating"
  | "vitamin_deficiency";

export type HealthCondition = {
  key: HealthConditionKey;
  title: string;
  summary: string;
  bestFoods: { name: string; why: string }[];
  avoid: string[];
  lifestyle: string[];
  reasoning: string;
};

export const HEALTH_CONDITIONS: HealthCondition[] = [
  {
    key: "acne",
    title: "Acne",
    summary: "Lower glycemic meals, zinc, omega-3 fats, and trigger tracking.",
    bestFoods: [
      { name: "Dal or chana", why: "Protein and zinc support skin repair without a sugar spike." },
      { name: "Curd if tolerated", why: "Fermented dairy can support the gut; skip if it clearly flares you." },
      { name: "Oats", why: "Slow carbs reduce insulin swings that can worsen breakouts." },
      { name: "Walnuts", why: "Omega-3 fats help balance inflammatory pathways." },
      { name: "Carrot or cucumber", why: "Low-glycemic crunch adds antioxidants and hydration." },
      { name: "Eggs or paneer", why: "Steady protein helps healing and appetite control." },
    ],
    avoid: ["Sugary drinks", "Frequent sweets", "Deep-fried snacks", "Large refined-flour meals", "Personal dairy triggers"],
    lifestyle: ["Sleep 7-8 hours", "Wash sweat off soon after workouts", "Change pillow covers twice weekly"],
    reasoning: "High glycemic load may increase insulin and IGF-1 signaling, which can raise oil production in acne-prone people.",
  },
  {
    key: "hair_fall",
    title: "Hair fall",
    summary: "Protein, iron, zinc, vitamin D, and thyroid-aware consistency.",
    bestFoods: [
      { name: "Eggs", why: "Complete protein plus biotin supports keratin production." },
      { name: "Dal with rice", why: "Combines amino acids for everyday protein coverage." },
      { name: "Spinach", why: "Iron and folate help red blood cell support for follicles." },
      { name: "Pumpkin seeds", why: "Zinc supports hair growth cycles." },
      { name: "Curd or milk", why: "Adds protein, calcium, and B vitamins if tolerated." },
      { name: "Fish or tofu", why: "High-quality protein helps meet daily repair needs." },
    ],
    avoid: ["Crash dieting", "Very low protein days", "Excess alcohol", "Skipping breakfast repeatedly", "Self-prescribed high-dose supplements"],
    lifestyle: ["Check ferritin, vitamin D, B12, and thyroid if shedding persists", "Avoid tight hairstyles", "Keep weight loss gradual"],
    reasoning: "Hair follicles are metabolically active; low energy, protein, iron, or thyroid imbalance can push more follicles into shedding.",
  },
  {
    key: "knee_pain",
    title: "Knee pain",
    summary: "Anti-inflammatory foods, protein for tissue repair, and weight/load management.",
    bestFoods: [
      { name: "Fish or flaxseed", why: "Omega-3 fats support a lower inflammatory load." },
      { name: "Dal or chicken", why: "Protein supports muscle around the knee joint." },
      { name: "Curd", why: "Protein and calcium support bone and muscle function." },
      { name: "Turmeric in meals", why: "Curcumin has mild inflammation-supporting effects." },
      { name: "Citrus fruit", why: "Vitamin C supports collagen formation." },
      { name: "Leafy greens", why: "Magnesium and vitamin K support muscle and bone health." },
    ],
    avoid: ["Frequent fried foods", "Sugary drinks", "Excess alcohol", "Rapid weight gain", "Training through sharp pain"],
    lifestyle: ["Prioritize quad and glute strength", "Use low-impact cardio during flare-ups", "Get persistent swelling assessed"],
    reasoning: "Nutrition cannot fix structural injury, but lower inflammation and stronger surrounding muscle can reduce joint stress.",
  },
  {
    key: "migraine",
    title: "Migraine",
    summary: "Hydration, regular meals, magnesium-rich foods, and trigger consistency.",
    bestFoods: [
      { name: "Banana", why: "Easy carbs and potassium help when meals are delayed." },
      { name: "Curd rice", why: "Simple, gentle meal that supports hydration and sodium balance." },
      { name: "Nuts or seeds", why: "Magnesium may support migraine threshold in some people." },
      { name: "Eggs", why: "Protein stabilizes hunger-related triggers." },
      { name: "Coconut water", why: "Fluid and electrolytes help dehydration-related headaches." },
      { name: "Oats", why: "Slow carbs reduce fasting-triggered dips." },
    ],
    avoid: ["Long fasting windows", "Alcohol", "Excess caffeine swings", "Aged cheese if it triggers you", "Dehydration"],
    lifestyle: ["Keep sleep and meal timing consistent", "Track triggers for 2 weeks", "Seek care for sudden severe headache"],
    reasoning: "Migraine brains are sensitive to rhythm changes; hydration, glucose stability, and sleep regularity can reduce trigger stacking.",
  },
  {
    key: "weight_loss",
    title: "Weight loss",
    summary: "High satiety, high protein, fiber, and controlled portions without crash dieting.",
    bestFoods: [
      { name: "Eggs or tofu", why: "Protein keeps hunger lower per calorie." },
      { name: "Dal", why: "Protein plus fiber makes meals filling." },
      { name: "Vegetable sabzi", why: "Volume and micronutrients with modest calories." },
      { name: "Curd", why: "Protein-rich snack that is easy to portion." },
      { name: "Millet or roti", why: "Measured carbs support adherence and training." },
      { name: "Fruit", why: "Sweetness plus fiber beats liquid calories." },
    ],
    avoid: ["Liquid calories", "Frequent fried snacks", "Oversized rice portions", "Crash diets", "Mindless late-night snacking"],
    lifestyle: ["Aim for 7-10k steps", "Use a smaller dinner plate", "Lose around 0.5-1% body weight per week"],
    reasoning: "A sustainable calorie deficit works best when protein and fiber protect fullness and muscle mass.",
  },
  {
    key: "weight_gain",
    title: "Weight gain",
    summary: "Calorie-dense but nutritious meals with protein at every feed.",
    bestFoods: [
      { name: "Peanut butter", why: "Dense calories make a surplus easier." },
      { name: "Milk or lassi", why: "Adds calories and protein without huge meal volume." },
      { name: "Rice with dal", why: "Reliable carbs plus protein for daily surplus." },
      { name: "Banana", why: "Easy pre-workout carbs and calories." },
      { name: "Paneer or eggs", why: "High-quality protein supports lean gain." },
      { name: "Nuts", why: "Small portions add meaningful calories." },
    ],
    avoid: ["Only junk-food bulking", "Skipping meals", "Very high fiber before big meals", "Poor sleep", "Training without progression"],
    lifestyle: ["Add one extra snack daily", "Track weekly weight trend", "Strength train 3-5 days weekly"],
    reasoning: "Weight gain requires a consistent energy surplus; protein and training steer more of that gain toward lean tissue.",
  },
  {
    key: "pcos",
    title: "PCOS",
    summary: "Insulin-aware meals, protein, fiber, and steady strength training.",
    bestFoods: [
      { name: "Eggs or tofu", why: "Protein lowers meal glucose impact and supports satiety." },
      { name: "Chana or rajma", why: "Fiber-rich carbs improve fullness and glucose steadiness." },
      { name: "Vegetable sabzi", why: "Micronutrients and volume support appetite control." },
      { name: "Curd", why: "Protein-rich fermented food; choose unsweetened." },
      { name: "Nuts", why: "Healthy fats slow digestion and improve satiety." },
      { name: "Millet roti", why: "Higher fiber carb option than refined flour." },
    ],
    avoid: ["Sugary drinks", "Large refined-carb meals", "Frequent desserts", "Skipping protein", "Extreme restriction"],
    lifestyle: ["Strength train weekly", "Walk 10 minutes after carb-heavy meals", "Discuss irregular cycles with a clinician"],
    reasoning: "Many PCOS symptoms are linked with insulin resistance, so protein, fiber, and post-meal movement can improve glucose handling.",
  },
  {
    key: "diabetes",
    title: "Diabetes",
    summary: "Carb quality, portion consistency, protein pairing, and glucose monitoring.",
    bestFoods: [
      { name: "Dal", why: "Protein and fiber slow carbohydrate absorption." },
      { name: "Vegetable sabzi", why: "Non-starchy volume lowers meal glycemic load." },
      { name: "Curd", why: "Unsweetened protein snack with modest carbs." },
      { name: "Eggs or paneer", why: "Low-carb protein helps steady glucose." },
      { name: "Millet roti", why: "Measured whole-grain carbs are easier to dose." },
      { name: "Nuts", why: "Healthy fats slow digestion in small portions." },
    ],
    avoid: ["Fruit juice", "Sugary tea or coffee", "Large white-rice portions", "Sweets", "Skipping medication advice"],
    lifestyle: ["Monitor glucose as advised", "Walk after meals", "Coordinate diet changes with your clinician"],
    reasoning: "Pairing measured carbs with protein, fiber, and fat slows glucose rise and improves post-meal control.",
  },
  {
    key: "high_bp",
    title: "High BP",
    summary: "Lower sodium, more potassium-rich foods, and daily movement.",
    bestFoods: [
      { name: "Banana", why: "Potassium supports sodium balance." },
      { name: "Dal", why: "Plant protein and magnesium support heart health." },
      { name: "Curd", why: "Calcium and protein fit a BP-friendly plate." },
      { name: "Leafy greens", why: "Potassium and nitrates support vascular function." },
      { name: "Oats", why: "Soluble fiber supports cholesterol and heart health." },
      { name: "Coconut water", why: "Potassium-rich, but portion carefully if kidney issues exist." },
    ],
    avoid: ["Packaged salty snacks", "Pickles/papad daily", "Processed meats", "High-salt takeout", "Excess alcohol"],
    lifestyle: ["Check BP at the same time daily", "Keep salt measured", "Get medical care for very high readings"],
    reasoning: "Sodium raises fluid pressure in many people, while potassium-rich whole foods and activity support vessel function.",
  },
  {
    key: "thyroid",
    title: "Thyroid",
    summary: "Adequate protein, iodine/selenium food sources, and medication timing awareness.",
    bestFoods: [
      { name: "Eggs", why: "Protein plus selenium supports thyroid hormone metabolism." },
      { name: "Curd", why: "Protein and iodine contribution if dairy is tolerated." },
      { name: "Dal", why: "Steady protein and minerals for daily energy." },
      { name: "Fish", why: "Iodine and omega-3 fats support metabolic health." },
      { name: "Nuts", why: "Selenium and healthy fats in small portions." },
      { name: "Cooked cruciferous vegetables", why: "Nutritious and usually fine cooked in normal servings." },
    ],
    avoid: ["Skipping prescribed medicine", "Taking calcium/iron with thyroid medicine", "Crash dieting", "Megadose iodine", "Unverified supplements"],
    lifestyle: ["Take medication as prescribed on schedule", "Recheck labs as advised", "Keep protein steady"],
    reasoning: "Thyroid symptoms often overlap with nutrient deficits; stable intake and correct medication timing matter more than food fear.",
  },
  {
    key: "low_energy",
    title: "Low energy",
    summary: "Regular meals with carbs, protein, iron, B12, hydration, and sleep.",
    bestFoods: [
      { name: "Poha with peanuts", why: "Carbs plus fat provide quick and sustained energy." },
      { name: "Eggs", why: "Protein and B vitamins support energy metabolism." },
      { name: "Dal rice", why: "Balanced carbs and protein refill energy stores." },
      { name: "Fruit", why: "Quick carbs with fiber beat sugary drinks." },
      { name: "Curd", why: "Protein snack helps avoid long gaps." },
      { name: "Spinach", why: "Iron and folate support oxygen transport." },
    ],
    avoid: ["Skipping breakfast if it causes crashes", "Too much caffeine late", "Very low carb intake", "Dehydration", "Poor sleep routine"],
    lifestyle: ["Get morning sunlight", "Hydrate before caffeine", "Check B12, vitamin D, iron if fatigue persists"],
    reasoning: "Energy dips commonly come from under-fueling, dehydration, poor sleep, or micronutrient gaps that affect oxygen and metabolism.",
  },
  {
    key: "poor_sleep",
    title: "Poor sleep",
    summary: "Earlier caffeine cutoff, light dinner, magnesium-rich foods, and routine.",
    bestFoods: [
      { name: "Curd", why: "Protein can prevent night hunger without a heavy meal." },
      { name: "Banana", why: "Carbs and potassium can fit a calming evening snack." },
      { name: "Nuts or seeds", why: "Magnesium supports relaxation pathways." },
      { name: "Oats", why: "Slow carbs may support serotonin and fullness." },
      { name: "Chamomile tea", why: "Caffeine-free ritual helps wind down." },
      { name: "Eggs at dinner", why: "Protein supports satiety without excess sugar." },
    ],
    avoid: ["Caffeine after mid-afternoon", "Heavy fried dinner", "Alcohol as a sleep aid", "Late sugar", "Screens in bed"],
    lifestyle: ["Keep a fixed wake time", "Dim lights 60 minutes before bed", "Finish large meals 2-3 hours before sleep"],
    reasoning: "Sleep improves when circadian cues, digestion, caffeine, and blood sugar are kept predictable.",
  },
  {
    key: "stress_anxiety",
    title: "Stress/anxiety",
    summary: "Stable blood sugar, magnesium foods, caffeine limits, and gentle routines.",
    bestFoods: [
      { name: "Oats", why: "Slow carbs reduce jittery hunger swings." },
      { name: "Curd", why: "Fermented food may support the gut-brain axis." },
      { name: "Nuts", why: "Magnesium and fats support steadier energy." },
      { name: "Eggs or paneer", why: "Protein helps prevent crash-driven irritability." },
      { name: "Fruit", why: "Sweet, fiber-rich option instead of stress sugar." },
      { name: "Dal", why: "Comforting protein and fiber base for stable meals." },
    ],
    avoid: ["Excess caffeine", "Skipping meals", "Alcohol for coping", "High-sugar snacking loops", "Very restrictive diets"],
    lifestyle: ["Walk 10 minutes after meals", "Practice slow breathing", "Seek professional support if anxiety affects daily life"],
    reasoning: "Blood sugar swings and excess stimulants can amplify stress sensations, while routine meals support steadier physiology.",
  },
  {
    key: "gym_muscle_gain",
    title: "Gym muscle gain",
    summary: "Protein distribution, carbs around training, and progressive overload.",
    bestFoods: [
      { name: "Chicken, eggs, or tofu", why: "Leucine-rich protein supports muscle protein synthesis." },
      { name: "Paneer", why: "Protein-dense vegetarian option for meals." },
      { name: "Rice or roti", why: "Carbs fuel hard training and recovery." },
      { name: "Curd", why: "Easy protein plus calcium after training." },
      { name: "Banana", why: "Convenient pre-workout carbohydrate." },
      { name: "Dal", why: "Budget-friendly daily protein and carbs." },
    ],
    avoid: ["Training fasted if performance drops", "Low protein days", "Random supplement stacks", "Poor sleep", "Dirty bulk excess"],
    lifestyle: ["Train each muscle 2 times weekly", "Add reps or load over time", "Hit protein across 3-5 meals"],
    reasoning: "Muscle gain needs mechanical tension, enough amino acids, and enough energy to recover from training.",
  },
  {
    key: "digestion_bloating",
    title: "Digestion/bloating",
    summary: "Gentle meals, fiber titration, hydration, and trigger identification.",
    bestFoods: [
      { name: "Curd rice", why: "Gentle starch plus fermented food can be soothing." },
      { name: "Banana", why: "Usually easy to digest and potassium-rich." },
      { name: "Cooked vegetables", why: "Softer fiber is often better tolerated." },
      { name: "Moong dal", why: "Typically lighter than heavier legumes." },
      { name: "Ginger tea", why: "May support gastric comfort." },
      { name: "Rice", why: "Simple carb that is often low-bloat." },
    ],
    avoid: ["Sudden high fiber jumps", "Carbonated drinks", "Very spicy/oily meals", "Eating too fast", "Large late dinners"],
    lifestyle: ["Chew slowly", "Walk after meals", "Track foods and timing when bloating appears"],
    reasoning: "Bloating often worsens when gas production, meal size, eating speed, or fiber changes exceed gut tolerance.",
  },
  {
    key: "vitamin_deficiency",
    title: "Vitamin deficiency",
    summary: "Food-first micronutrient coverage and lab-guided supplementation.",
    bestFoods: [
      { name: "Eggs", why: "B12, choline, selenium, and protein in one daily food." },
      { name: "Milk or curd", why: "Calcium, B12, and protein if tolerated." },
      { name: "Leafy greens", why: "Folate, magnesium, and vitamin K." },
      { name: "Citrus fruit", why: "Vitamin C improves plant-iron absorption." },
      { name: "Nuts and seeds", why: "Vitamin E, magnesium, zinc, and healthy fats." },
      { name: "Fish or fortified foods", why: "Useful for vitamin D/B12 depending on diet." },
    ],
    avoid: ["Blind megadose supplements", "Repeating the same narrow meals", "Tea immediately with iron-rich meals", "Crash dieting", "Skipping labs"],
    lifestyle: ["Confirm with blood tests", "Pair iron foods with vitamin C", "Get safe sunlight when appropriate"],
    reasoning: "Deficiencies are specific; labs prevent guesswork, while diverse whole foods cover common micronutrient gaps.",
  },
];

export function emptyConditionNotes(): Record<HealthConditionKey, string> {
  return HEALTH_CONDITIONS.reduce(
    (acc, condition) => ({ ...acc, [condition.key]: "" }),
    {} as Record<HealthConditionKey, string>,
  );
}
