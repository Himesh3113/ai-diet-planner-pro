export type IndianFoodEntry = {
  key: string;
  name: string;
  serving: string;
  calories: number;
  proteinG: number;
  carbsG?: number;
  fatsG?: number;
};

export const INDIAN_FOODS: IndianFoodEntry[] = [
  { key: "idli-2", name: "Idli", serving: "2 medium", calories: 116, proteinG: 4 },
  { key: "dosa-plain", name: "Plain Dosa", serving: "1 medium", calories: 168, proteinG: 4.2 },
  { key: "dosa-masala", name: "Masala Dosa", serving: "1 medium", calories: 220, proteinG: 5 },
  { key: "upma-1cup", name: "Upma", serving: "1 cup", calories: 250, proteinG: 6 },
  { key: "poha-1cup", name: "Poha", serving: "1 cup", calories: 270, proteinG: 5.5 },
  { key: "chapati-1", name: "Chapati", serving: "1 medium", calories: 120, proteinG: 3.5 },
  { key: "roti-tandoori-1", name: "Tandoori Roti", serving: "1 medium", calories: 110, proteinG: 3 },
  { key: "rice-cooked-1cup", name: "Cooked Rice", serving: "1 cup", calories: 205, proteinG: 4.3 },
  { key: "rice-brown-1cup", name: "Brown Rice", serving: "1 cup", calories: 215, proteinG: 5 },
  { key: "dal-tadka-1cup", name: "Dal Tadka", serving: "1 cup", calories: 198, proteinG: 9 },
  { key: "dal-makhani-1cup", name: "Dal Makhani", serving: "1 cup", calories: 240, proteinG: 10 },
  { key: "moong-dal-1cup", name: "Moong Dal", serving: "1 cup", calories: 180, proteinG: 11 },
  { key: "rajma-1cup", name: "Rajma", serving: "1 cup", calories: 265, proteinG: 13 },
  { key: "chole-1cup", name: "Chole", serving: "1 cup", calories: 280, proteinG: 12 },
  { key: "khichdi-1cup", name: "Khichdi", serving: "1 cup", calories: 230, proteinG: 8 },
  { key: "paneer-bhurji-1cup", name: "Paneer Bhurji", serving: "1 cup", calories: 320, proteinG: 18 },
  { key: "paneer-palak-1cup", name: "Paneer Palak", serving: "1 cup", calories: 280, proteinG: 16 },
  { key: "egg-bhurji-2eggs", name: "Egg Bhurji", serving: "2 eggs", calories: 185, proteinG: 13 },
  { key: "omelette-2eggs", name: "Omelette", serving: "2 eggs", calories: 180, proteinG: 12 },
  { key: "chicken-curry-1cup", name: "Chicken Curry", serving: "1 cup", calories: 285, proteinG: 24 },
  { key: "fish-curry-1cup", name: "Fish Curry", serving: "1 cup", calories: 260, proteinG: 22 },
  { key: "plain-yogurt-1cup", name: "Plain Yogurt", serving: "1 cup", calories: 150, proteinG: 8 },
  { key: "buttermilk-chaas-1glass", name: "Buttermilk", serving: "1 glass", calories: 60, proteinG: 3 },
  { key: "sambar-1cup", name: "Sambar", serving: "1 cup", calories: 130, proteinG: 5 },
  { key: "banana-1", name: "Banana", serving: "1 medium", calories: 105, proteinG: 1.3 },
  { key: "apple-1", name: "Apple", serving: "1 medium", calories: 95, proteinG: 0.5 },
  { key: "dates-3", name: "Dates", serving: "3 pieces", calories: 90, proteinG: 1 },
  { key: "spinach-sabzi-1cup", name: "Spinach Sabzi", serving: "1 cup", calories: 80, proteinG: 4 },
  { key: "mix-veg-1cup", name: "Mixed Vegetables", serving: "1 cup", calories: 90, proteinG: 3 },
  { key: "soyachunks-curry-1cup", name: "Soya Chunks Curry", serving: "1 cup", calories: 220, proteinG: 20 },
  { key: "sprouted-moong-salad-1cup", name: "Sprout Salad", serving: "1 cup", calories: 100, proteinG: 7 },
  { key: "coconut-water-1cup", name: "Coconut Water", serving: "1 cup", calories: 46, proteinG: 0.5 },
  { key: "makhana-1cup", name: "Roasted Makhana", serving: "1 cup", calories: 120, proteinG: 4 },
  { key: "peanuts-roasted-025cup", name: "Roasted Peanuts", serving: "1/4 cup", calories: 210, proteinG: 9 },
];

const FOODS_BY_NAME = new Map(
  INDIAN_FOODS.map((food) => [food.name.trim().toLowerCase(), food]),
);

export function findIndianFoodByName(name: string) {
  return FOODS_BY_NAME.get(name.trim().toLowerCase()) ?? null;
}
