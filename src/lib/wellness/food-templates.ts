import type { WellnessFoodItem } from "./types";

export function food(
  name: string,
  benefit: string,
  whyItHelps: string,
  macros: { proteinG: number; carbsG: number; fatsG: number },
  micronutrients: string[],
): WellnessFoodItem {
  return { name, benefit, whyItHelps, micronutrients, ...macros };
}

export const SKIN_FOODS: WellnessFoodItem[] = [
  food("Cucumber", "Hydration & low glycemic", "Cooling fiber reduces insulin spikes linked to breakouts", { proteinG: 1, carbsG: 4, fatsG: 0 }, ["Potassium", "Vitamin K"]),
  food("Carrots", "Beta-carotene support", "Vitamin A precursors support skin cell turnover", { proteinG: 1, carbsG: 10, fatsG: 0 }, ["Vitamin A", "Fiber"]),
  food("Green Tea", "Antioxidant polyphenols", "EGCG may reduce sebum oxidation", { proteinG: 0, carbsG: 0, fatsG: 0 }, ["Catechins"]),
  food("Walnuts", "Omega-3 fats", "Anti-inflammatory fats balance oil signaling", { proteinG: 4, carbsG: 4, fatsG: 18 }, ["Omega-3", "Zinc"]),
  food("Berries", "Low sugar antioxidants", "Anthocyanins support collagen and lower glycemic load", { proteinG: 1, carbsG: 12, fatsG: 0 }, ["Vitamin C"]),
  food("Yogurt", "Probiotics & protein", "Gut-skin axis support when dairy is tolerated", { proteinG: 10, carbsG: 8, fatsG: 3 }, ["Probiotics", "Calcium"]),
  food("Oats", "Slow carbs", "Steady glucose reduces insulin-driven oil production", { proteinG: 5, carbsG: 27, fatsG: 3 }, ["Fiber", "B vitamins"]),
];

export const HAIR_FOODS: WellnessFoodItem[] = [
  food("Eggs", "Complete protein & biotin", "Keratin building blocks for follicle growth", { proteinG: 13, carbsG: 1, fatsG: 11 }, ["Biotin", "B12"]),
  food("Spinach", "Iron & folate", "Supports oxygen delivery to follicles", { proteinG: 3, carbsG: 4, fatsG: 0 }, ["Iron", "Folate"]),
  food("Almonds", "Vitamin E & zinc", "Antioxidant protection for scalp health", { proteinG: 6, carbsG: 6, fatsG: 14 }, ["Vitamin E", "Zinc"]),
  food("Greek Yogurt", "High protein", "Steady amino acids for hair structure", { proteinG: 15, carbsG: 6, fatsG: 0 }, ["Probiotics", "Calcium"]),
  food("Salmon", "Omega-3 & protein", "Reduces inflammation around follicles", { proteinG: 22, carbsG: 0, fatsG: 12 }, ["Omega-3", "Vitamin D"]),
  food("Pumpkin Seeds", "Zinc dense", "Zinc supports hair growth cycles", { proteinG: 9, carbsG: 4, fatsG: 13 }, ["Zinc", "Magnesium"]),
  food("Lentils", "Plant iron & protein", "Affordable protein + iron for vegetarian diets", { proteinG: 18, carbsG: 40, fatsG: 1 }, ["Iron", "Folate"]),
];

export const JOINT_FOODS: WellnessFoodItem[] = [
  food("Turmeric", "Curcumin anti-inflammatory", "Traditional Indian spice supports lower inflammatory load", { proteinG: 1, carbsG: 7, fatsG: 1 }, ["Curcumin"]),
  food("Fatty Fish", "Omega-3 EPA/DHA", "Marine fats reduce joint stiffness signals", { proteinG: 22, carbsG: 0, fatsG: 12 }, ["Omega-3"]),
  food("Ginger", "Anti-nausea & inflammation", "Gingerol supports comfort and circulation", { proteinG: 0, carbsG: 4, fatsG: 0 }, ["Gingerol"]),
  food("Leafy Greens", "Magnesium & K", "Micronutrients for muscle and bone around joints", { proteinG: 3, carbsG: 4, fatsG: 0 }, ["Magnesium", "Vitamin K"]),
  food("Olive Oil", "Monounsaturated fats", "Healthier fat profile vs fried oils", { proteinG: 0, carbsG: 0, fatsG: 14 }, ["Vitamin E"]),
  food("Nuts", "Vitamin E & protein", "Supports connective tissue repair", { proteinG: 6, carbsG: 6, fatsG: 14 }, ["Vitamin E"]),
  food("Beans", "Fiber & plant protein", "Weight-friendly protein for joint load management", { proteinG: 15, carbsG: 35, fatsG: 1 }, ["Fiber", "Iron"]),
];

export const GENERAL_HIGH_PROTEIN: WellnessFoodItem[] = [
  food("Eggs", "Complete protein", "Supports tissue repair and satiety", { proteinG: 13, carbsG: 1, fatsG: 11 }, ["B12"]),
  food("Dal", "Plant protein", "Affordable Indian staple amino acids", { proteinG: 9, carbsG: 20, fatsG: 1 }, ["Iron", "Fiber"]),
  food("Paneer", "Calcium & protein", "Vegetarian protein for muscle and bone", { proteinG: 18, carbsG: 6, fatsG: 20 }, ["Calcium"]),
  food("Chicken", "Lean protein", "High-quality recovery protein", { proteinG: 24, carbsG: 0, fatsG: 8 }, ["B6"]),
  food("Curd", "Probiotics", "Gut-friendly protein source", { proteinG: 8, carbsG: 6, fatsG: 4 }, ["Probiotics"]),
  food("Tofu", "Soy protein", "Plant complete protein option", { proteinG: 15, carbsG: 4, fatsG: 8 }, ["Calcium"]),
  food("Moong Sprouts", "Fresh enzymes", "Light protein with fiber", { proteinG: 7, carbsG: 8, fatsG: 0 }, ["Folate"]),
];
