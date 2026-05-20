export const DIET_GOALS = [
  { value: "bulking", label: "Bulking", description: "Calorie surplus for muscle gain" },
  { value: "fat_loss", label: "Fat Loss", description: "Moderate deficit to cut body fat" },
  { value: "lean_bulk", label: "Lean Bulk", description: "Small surplus, minimal fat gain" },
  { value: "weight_gain", label: "Weight Gain", description: "Higher surplus for scale gain" },
  { value: "maintenance", label: "Maintenance", description: "Stay at current weight" },
] as const;

export type DietGoal = (typeof DIET_GOALS)[number]["value"];

export type FoodTag =
  | "veg"
  | "non_veg"
  | "budget"
  | "moderate"
  | "flexible"
  | "indian"
  | "high_protein"
  | "skin_friendly"
  | "anti_inflammatory"
  | "snack"
  | "fruit"
  | "dairy";

export type PreferredFoodKey =
  | "eggs"
  | "chicken"
  | "rice"
  | "oats"
  | "milk"
  | "paneer"
  | "peanut_butter"
  | "bananas"
  | "dal"
  | "curd"
  | "chapati"
  | "idli"
  | "dosa"
  | "fruits"
  | "vegetables"
  | "soy_chunks"
  | "fish"
  | "spinach"
  | "almonds"
  | "walnuts"
  | "berries"
  | "cucumber"
  | "carrots"
  | "green_tea"
  | "yogurt"
  | "lentils"
  | "salmon"
  | "pumpkin_seeds"
  | "turmeric_meals"
  | "ginger_tea"
  | "moong_dal"
  | "brown_rice"
  | "tofu"
  | "sprouts"
  | "dates"
  | "apple"
  | "buttermilk"
  | "poha"
  | "upma"
  | "mixed_nuts"
  | "flaxseed"
  | "sweet_potato"
  | "rajma"
  | "chole"
  | "khichdi"
  | "coconut_water"
  | "makhana"
  | "roasted_chana";

export const PREFERRED_FOODS: {
  key: PreferredFoodKey;
  label: string;
  tags: FoodTag[];
}[] = [
  { key: "eggs", label: "Eggs", tags: ["non_veg", "budget", "indian", "high_protein"] },
  { key: "chicken", label: "Chicken", tags: ["non_veg", "moderate", "indian", "high_protein"] },
  { key: "fish", label: "Fish", tags: ["non_veg", "moderate", "indian", "high_protein", "anti_inflammatory"] },
  { key: "salmon", label: "Salmon / fatty fish", tags: ["non_veg", "flexible", "high_protein", "anti_inflammatory"] },
  { key: "rice", label: "Rice", tags: ["veg", "budget", "indian"] },
  { key: "brown_rice", label: "Brown rice", tags: ["veg", "moderate", "indian"] },
  { key: "oats", label: "Oats", tags: ["veg", "budget", "indian", "skin_friendly"] },
  { key: "milk", label: "Milk", tags: ["veg", "budget", "indian", "dairy"] },
  { key: "paneer", label: "Paneer", tags: ["veg", "moderate", "indian", "high_protein", "dairy"] },
  { key: "yogurt", label: "Yogurt / curd bowl", tags: ["veg", "budget", "indian", "dairy", "skin_friendly"] },
  { key: "curd", label: "Curd", tags: ["veg", "budget", "indian", "dairy"] },
  { key: "buttermilk", label: "Buttermilk (chaas)", tags: ["veg", "budget", "indian", "dairy"] },
  { key: "peanut_butter", label: "Peanut butter", tags: ["veg", "budget", "indian", "high_protein"] },
  { key: "bananas", label: "Bananas", tags: ["veg", "budget", "indian", "fruit"] },
  { key: "apple", label: "Apple", tags: ["veg", "budget", "fruit", "skin_friendly"] },
  { key: "dates", label: "Dates", tags: ["veg", "budget", "indian", "fruit", "snack"] },
  { key: "berries", label: "Berries", tags: ["veg", "moderate", "fruit", "skin_friendly"] },
  { key: "fruits", label: "Mixed fruits", tags: ["veg", "budget", "indian", "fruit"] },
  { key: "dal", label: "Dal", tags: ["veg", "budget", "indian", "high_protein"] },
  { key: "moong_dal", label: "Moong dal", tags: ["veg", "budget", "indian", "high_protein"] },
  { key: "lentils", label: "Lentils / masoor", tags: ["veg", "budget", "indian", "high_protein"] },
  { key: "rajma", label: "Rajma", tags: ["veg", "budget", "indian", "high_protein"] },
  { key: "chole", label: "Chole", tags: ["veg", "budget", "indian", "high_protein"] },
  { key: "chapati", label: "Chapati", tags: ["veg", "budget", "indian"] },
  { key: "idli", label: "Idli", tags: ["veg", "budget", "indian"] },
  { key: "dosa", label: "Dosa", tags: ["veg", "budget", "indian"] },
  { key: "poha", label: "Poha", tags: ["veg", "budget", "indian"] },
  { key: "upma", label: "Upma", tags: ["veg", "budget", "indian"] },
  { key: "khichdi", label: "Khichdi", tags: ["veg", "budget", "indian", "anti_inflammatory"] },
  { key: "vegetables", label: "Vegetables", tags: ["veg", "budget", "indian", "skin_friendly"] },
  { key: "spinach", label: "Spinach", tags: ["veg", "budget", "indian", "high_protein"] },
  { key: "carrots", label: "Carrots", tags: ["veg", "budget", "skin_friendly"] },
  { key: "cucumber", label: "Cucumber", tags: ["veg", "budget", "skin_friendly"] },
  { key: "sweet_potato", label: "Sweet potato", tags: ["veg", "moderate", "indian"] },
  { key: "soy_chunks", label: "Soy chunks", tags: ["veg", "budget", "indian", "high_protein"] },
  { key: "tofu", label: "Tofu", tags: ["veg", "moderate", "high_protein"] },
  { key: "sprouts", label: "Sprouts", tags: ["veg", "budget", "indian", "high_protein"] },
  { key: "almonds", label: "Almonds", tags: ["veg", "moderate", "snack", "skin_friendly"] },
  { key: "walnuts", label: "Walnuts", tags: ["veg", "moderate", "snack", "anti_inflammatory"] },
  { key: "pumpkin_seeds", label: "Pumpkin seeds", tags: ["veg", "moderate", "snack", "high_protein"] },
  { key: "mixed_nuts", label: "Mixed nuts", tags: ["veg", "moderate", "snack"] },
  { key: "flaxseed", label: "Flaxseed", tags: ["veg", "budget", "anti_inflammatory"] },
  { key: "makhana", label: "Makhana (fox nuts)", tags: ["veg", "budget", "snack"] },
  { key: "roasted_chana", label: "Roasted chana", tags: ["veg", "budget", "snack", "high_protein"] },
  { key: "green_tea", label: "Green tea", tags: ["veg", "budget", "skin_friendly"] },
  { key: "ginger_tea", label: "Ginger tea", tags: ["veg", "budget", "anti_inflammatory"] },
  { key: "turmeric_meals", label: "Turmeric-based meals", tags: ["veg", "budget", "indian", "anti_inflammatory"] },
  { key: "coconut_water", label: "Coconut water", tags: ["veg", "budget", "indian", "fruit"] },
];

export const AFFORDABILITY_OPTIONS = [
  { value: "budget", label: "Budget", tag: "Low-cost staples" },
  { value: "moderate", label: "Moderate", tag: "Balanced cost" },
  { value: "flexible", label: "Flexible", tag: "Premium options OK" },
] as const;

export type Affordability = (typeof AFFORDABILITY_OPTIONS)[number]["value"];

export type DietFilter = "veg" | "non_veg";
