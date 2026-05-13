import type { MealSlot, MealTemplate } from "./types";

const MEAL_TEMPLATES: MealTemplate[] = [
  // Breakfast
  {
    id: "bf-oats-berry",
    slot: "breakfast",
    title: "Steel-cut oats with berries and cinnamon",
    estimatedKcal: 380,
    estimatedProteinG: 14,
    tags: ["vegetarian", "diabetes_friendly", "acne_friendly", "contains_gluten"],
    healthExplanation:
      "Fiber-rich carbs with a low glycemic load help steady glucose and support clear-skin routines.",
  },
  {
    id: "bf-greek-parfait",
    slot: "breakfast",
    title: "Greek yogurt parfait with oats and seeds",
    estimatedKcal: 420,
    estimatedProteinG: 28,
    tags: [
      "vegetarian",
      "diabetes_friendly",
      "hair_support",
      "contains_dairy",
      "high_protein",
    ],
    healthExplanation:
      "High protein supports muscle repair; dairy can be swapped for soy if acne-sensitive.",
  },
  {
    id: "bf-egg-veg",
    slot: "breakfast",
    title: "Vegetable omelet with whole-grain toast",
    estimatedKcal: 410,
    estimatedProteinG: 26,
    tags: [
      "vegetarian",
      "diabetes_friendly",
      "joint_support",
      "contains_eggs",
      "contains_gluten",
      "high_protein",
    ],
    healthExplanation:
      "Eggs plus colorful vegetables add protein and polyphenols that complement joint-friendly eating.",
  },
  {
    id: "bf-tofu-scramble",
    slot: "breakfast",
    title: "Tofu scramble with spinach and tomatoes",
    estimatedKcal: 360,
    estimatedProteinG: 22,
    tags: ["vegetarian", "acne_friendly", "hair_support", "high_protein"],
    healthExplanation:
      "Plant protein and iron-rich greens support hair density goals without relying on dairy.",
  },
  {
    id: "bf-smoothie",
    slot: "breakfast",
    title: "Protein smoothie (banana, spinach, whey or pea protein)",
    estimatedKcal: 340,
    estimatedProteinG: 30,
    tags: ["vegetarian", "hair_support", "high_protein", "contains_dairy"],
    healthExplanation:
      "Liquid calories are easy to hit protein targets with—choose pea protein if dairy is a concern.",
  },
  {
    id: "bf-idli-sambar",
    slot: "breakfast",
    title: "Idli with sambar and coconut chutney (light)",
    estimatedKcal: 390,
    estimatedProteinG: 14,
    tags: ["vegetarian", "diabetes_friendly", "acne_friendly", "joint_support"],
    healthExplanation:
      "Fermented grains plus lentil stew offer steady energy and plant compounds that support joints.",
  },
  // Lunch
  {
    id: "ln-quinoa-bowl",
    slot: "lunch",
    title: "Quinoa bowl with chickpeas, greens, and tahini",
    estimatedKcal: 520,
    estimatedProteinG: 22,
    tags: ["vegetarian", "diabetes_friendly", "acne_friendly", "hair_support"],
    healthExplanation:
      "Mineral-rich plants and complete proteins from quinoa support hair and steady glucose.",
  },
  {
    id: "ln-grilled-chicken",
    slot: "lunch",
    title: "Grilled chicken salad with olive oil vinaigrette",
    estimatedKcal: 480,
    estimatedProteinG: 42,
    tags: ["diabetes_friendly", "joint_support", "high_protein"],
    healthExplanation:
      "Lean protein and unsaturated fats align with glucose control and anti-inflammatory patterns.",
  },
  {
    id: "ln-lentil-dal",
    slot: "lunch",
    title: "Masoor dal with brown rice and cucumber raita (yogurt optional)",
    estimatedKcal: 550,
    estimatedProteinG: 24,
    tags: ["vegetarian", "diabetes_friendly", "hair_support", "contains_dairy"],
    healthExplanation:
      "Pulses plus whole grains give sustained energy; swap raita for plant yogurt if needed.",
  },
  {
    id: "ln-salmon",
    slot: "lunch",
    title: "Baked salmon with roasted vegetables",
    estimatedKcal: 560,
    estimatedProteinG: 38,
    tags: [
      "diabetes_friendly",
      "joint_support",
      "hair_support",
      "contains_seafood",
      "high_protein",
    ],
    healthExplanation:
      "Omega-3 rich fish supports joint comfort and scalp health when paired with colorful produce.",
  },
  {
    id: "ln-tofu-stirfry",
    slot: "lunch",
    title: "Tofu stir-fry with mixed vegetables and brown rice",
    estimatedKcal: 510,
    estimatedProteinG: 28,
    tags: ["vegetarian", "diabetes_friendly", "acne_friendly", "high_protein"],
    healthExplanation:
      "High volume, moderate carbs—useful for fat-loss goals while keeping protein adequate.",
  },
  {
    id: "ln-turkey-wrap",
    slot: "lunch",
    title: "Whole-wheat turkey wrap with hummus and greens",
    estimatedKcal: 490,
    estimatedProteinG: 32,
    tags: ["diabetes_friendly", "joint_support", "contains_gluten", "high_protein"],
    healthExplanation:
      "Portable lean protein with fiber-forward wrap supports active days without big glucose spikes.",
  },
  // Dinner
  {
    id: "dn-turkey-meatballs",
    slot: "dinner",
    title: "Turkey meatballs with zucchini noodles and marinara",
    estimatedKcal: 520,
    estimatedProteinG: 40,
    tags: ["diabetes_friendly", "acne_friendly", "high_protein"],
    healthExplanation:
      "Lower refined carb load while keeping protein high—helpful for cuts and steady energy.",
  },
  {
    id: "dn-mackerel",
    slot: "dinner",
    title: "Grilled mackerel with lentils and steamed broccoli",
    estimatedKcal: 580,
    estimatedProteinG: 42,
    tags: [
      "diabetes_friendly",
      "joint_support",
      "hair_support",
      "contains_seafood",
      "high_protein",
    ],
    healthExplanation:
      "Oily fish plus legumes stacks protein with omega-3s for recovery-focused goals.",
  },
  {
    id: "dn-paneer-curry",
    slot: "dinner",
    title: "Paneer curry with cauliflower rice",
    estimatedKcal: 540,
    estimatedProteinG: 28,
    tags: ["vegetarian", "diabetes_friendly", "hair_support", "contains_dairy", "high_protein"],
    healthExplanation:
      "Cauliflower rice lowers carb load versus white rice while keeping satiety from dairy protein.",
  },
  {
    id: "dn-chickpea-stew",
    slot: "dinner",
    title: "Chickpea and vegetable stew with side salad",
    estimatedKcal: 480,
    estimatedProteinG: 20,
    tags: ["vegetarian", "diabetes_friendly", "acne_friendly", "joint_support"],
    healthExplanation:
      "Fiber-heavy dinner supports overnight glucose stability and skin-friendly meal patterns.",
  },
  {
    id: "dn-steak",
    slot: "dinner",
    title: "Lean sirloin with sweet potato and asparagus",
    estimatedKcal: 620,
    estimatedProteinG: 48,
    tags: ["diabetes_friendly", "hair_support", "high_protein"],
    healthExplanation:
      "Iron-rich red meat can support hair goals when portions match surplus or maintenance calories.",
  },
  {
    id: "dn-mushroom-risotto",
    slot: "dinner",
    title: "Mushroom barley risotto with side Greek salad",
    estimatedKcal: 560,
    estimatedProteinG: 18,
    tags: ["vegetarian", "diabetes_friendly", "joint_support", "contains_dairy", "contains_gluten"],
    healthExplanation:
      "Barley offers beta-glucans for glycemic control; mushrooms add savory depth without excess fat.",
  },
  // Snacks
  {
    id: "sn-cottage",
    slot: "snack",
    title: "Cottage cheese with cherry tomatoes",
    estimatedKcal: 180,
    estimatedProteinG: 22,
    tags: ["vegetarian", "diabetes_friendly", "hair_support", "contains_dairy", "high_protein"],
    healthExplanation:
      "Casein-rich snack bridges long gaps between meals for muscle retention.",
  },
  {
    id: "sn-apple-nuts",
    slot: "snack",
    title: "Apple slices with almond butter",
    estimatedKcal: 220,
    estimatedProteinG: 6,
    tags: ["vegetarian", "diabetes_friendly", "joint_support", "contains_nuts"],
    healthExplanation:
      "Fiber plus healthy fats blunt glucose rise—skip nuts if allergic.",
  },
  {
    id: "sn-hummus",
    slot: "snack",
    title: "Carrot and cucumber sticks with hummus",
    estimatedKcal: 160,
    estimatedProteinG: 6,
    tags: ["vegetarian", "diabetes_friendly", "acne_friendly", "joint_support"],
    healthExplanation:
      "Crunchy, low-GI volume snack that pairs well with hydration goals.",
  },
  {
    id: "sn-edamame",
    slot: "snack",
    title: "Steamed edamame with sea salt",
    estimatedKcal: 190,
    estimatedProteinG: 17,
    tags: ["vegetarian", "diabetes_friendly", "hair_support", "high_protein"],
    healthExplanation:
      "Complete plant protein useful between meals for strength or fat-loss programs.",
  },
  {
    id: "sn-protein-bar",
    slot: "snack",
    title: "Low-sugar protein bar (check label for allergens)",
    estimatedKcal: 200,
    estimatedProteinG: 18,
    tags: [
      "diabetes_friendly",
      "high_protein",
      "contains_nuts",
      "contains_gluten",
      "contains_dairy",
    ],
    healthExplanation:
      "Convenient when training—verify ingredients against your saved allergy list.",
  },
  {
    id: "sn-greek-cup",
    slot: "snack",
    title: "Single-serve Greek yogurt with chia",
    estimatedKcal: 170,
    estimatedProteinG: 16,
    tags: ["vegetarian", "diabetes_friendly", "hair_support", "contains_dairy", "high_protein"],
    healthExplanation:
      "Chia adds fiber for steadier digestion and glucose curves.",
  },
];

export function getMealTemplates(): readonly MealTemplate[] {
  return MEAL_TEMPLATES;
}

export function templatesForSlot(slot: MealSlot): MealTemplate[] {
  return MEAL_TEMPLATES.filter((t) => t.slot === slot);
}
