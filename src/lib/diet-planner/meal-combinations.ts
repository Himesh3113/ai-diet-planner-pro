import type { MealSlot } from "./types";

export type MealCombination = {
  id: string;
  title: string;
  description: string;
  slot: MealSlot;
  foodKeys: string[];
  tags: ("budget" | "high_protein" | "south_indian" | "north_indian")[];
};

export const MEAL_COMBINATIONS: MealCombination[] = [
  {
    id: "idli-sambar-eggs",
    title: "Idli + Sambar + Eggs",
    description: "Classic South Indian breakfast with protein boost",
    slot: "breakfast",
    foodKeys: ["idli-2", "sambar-1cup", "boiled-eggs-2"],
    tags: ["budget", "high_protein", "south_indian"],
  },
  {
    id: "rice-dal-chicken",
    title: "Rice + Dal + Chicken Curry",
    description: "Everyday Indian lunch plate",
    slot: "lunch",
    foodKeys: ["rice-cooked-1cup", "dal-tadka-1cup", "chicken-curry-1cup"],
    tags: ["high_protein"],
  },
  {
    id: "chapati-paneer",
    title: "Chapati + Paneer Curry",
    description: "North Indian vegetarian dinner",
    slot: "dinner",
    foodKeys: ["chapati-1", "chapati-1", "paneer-curry-1cup", "veg-curry-1cup"],
    tags: ["high_protein", "north_indian"],
  },
  {
    id: "oats-banana-pb",
    title: "Oats + Banana + Peanut Butter",
    description: "Quick high-fiber breakfast",
    slot: "breakfast",
    foodKeys: ["oats-1bowl", "banana-1", "peanut-butter-2tbsp"],
    tags: ["budget", "high_protein"],
  },
  {
    id: "poha-sprouts",
    title: "Poha + Sprouts",
    description: "Light Maharashtrian-style start",
    slot: "breakfast",
    foodKeys: ["poha-1cup", "sprouted-moong-salad-1cup"],
    tags: ["budget"],
  },
  {
    id: "curd-rice-sambar",
    title: "Curd Rice + Sambar",
    description: "Cooling South Indian lunch",
    slot: "lunch",
    foodKeys: ["curd-rice-1cup", "sambar-1cup"],
    tags: ["budget", "south_indian"],
  },
  {
    id: "rajma-chawal",
    title: "Rajma + Rice",
    description: "Comfort North Indian meal",
    slot: "lunch",
    foodKeys: ["rajma-1cup", "rice-cooked-1cup", "plain-yogurt-1cup"],
    tags: ["budget", "high_protein"],
  },
  {
    id: "chole-bhature-style",
    title: "Chole + Chapati",
    description: "Protein-rich vegetarian plate",
    slot: "lunch",
    foodKeys: ["chole-1cup", "chapati-1", "chapati-1"],
    tags: ["budget", "high_protein"],
  },
  {
    id: "fish-rice-veg",
    title: "Fish Curry + Rice + Veg",
    description: "Coastal balanced dinner",
    slot: "dinner",
    foodKeys: ["fish-curry-1cup", "rice-cooked-1cup", "veg-curry-1cup"],
    tags: ["high_protein"],
  },
  {
    id: "khichdi-curd",
    title: "Khichdi + Curd",
    description: "Easy digest dinner",
    slot: "dinner",
    foodKeys: ["khichdi-1cup", "plain-yogurt-1cup"],
    tags: ["budget"],
  },
  {
    id: "eggs-fruit-snack",
    title: "Boiled Eggs + Fruit Bowl",
    description: "Afternoon protein snack",
    slot: "snacks",
    foodKeys: ["boiled-eggs-2", "fruit-bowl-1cup"],
    tags: ["budget", "high_protein"],
  },
  {
    id: "shake-peanuts",
    title: "Protein Shake + Peanuts",
    description: "Gym-friendly Indian snack",
    slot: "snacks",
    foodKeys: ["protein-shake-1", "peanuts-roasted-025cup"],
    tags: ["high_protein"],
  },
];

export const BUDGET_MEAL_HIGHLIGHTS = MEAL_COMBINATIONS.filter((c) =>
  c.tags.includes("budget"),
).slice(0, 6);

export const HIGH_PROTEIN_MEAL_HIGHLIGHTS = MEAL_COMBINATIONS.filter((c) =>
  c.tags.includes("high_protein"),
).slice(0, 6);
