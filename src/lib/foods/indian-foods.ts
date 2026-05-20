export type IndianFoodEntry = {
  key: string;
  name: string;
  serving: string;
  calories: number;
  proteinG: number;
};

export const INDIAN_FOODS: IndianFoodEntry[] = [
  { key: "idli-2", name: "Idli", serving: "2 medium", calories: 116, proteinG: 4 },
  { key: "dosa-plain", name: "Plain Dosa", serving: "1 medium", calories: 168, proteinG: 4.2 },
  { key: "upma-1cup", name: "Upma", serving: "1 cup", calories: 250, proteinG: 6 },
  { key: "poha-1cup", name: "Poha", serving: "1 cup", calories: 270, proteinG: 5.5 },
  { key: "chapati-1", name: "Chapati", serving: "1 medium", calories: 120, proteinG: 3.5 },
  { key: "rice-cooked-1cup", name: "Cooked Rice", serving: "1 cup", calories: 205, proteinG: 4.3 },
  { key: "dal-1cup", name: "Dal", serving: "1 cup", calories: 198, proteinG: 9 },
  { key: "paneer-bhurji-1cup", name: "Paneer Bhurji", serving: "1 cup", calories: 320, proteinG: 18 },
  { key: "chole-1cup", name: "Chole", serving: "1 cup", calories: 280, proteinG: 12 },
  { key: "rajma-1cup", name: "Rajma", serving: "1 cup", calories: 265, proteinG: 13 },
  { key: "chicken-curry-1cup", name: "Chicken Curry", serving: "1 cup", calories: 285, proteinG: 24 },
  { key: "egg-bhurji-2eggs", name: "Egg Bhurji", serving: "2 eggs", calories: 185, proteinG: 13 },
  { key: "curd-1cup", name: "Curd", serving: "1 cup", calories: 150, proteinG: 8 },
  { key: "sambar-1cup", name: "Sambar", serving: "1 cup", calories: 130, proteinG: 5 },
  { key: "banana-1", name: "Banana", serving: "1 medium", calories: 105, proteinG: 1.3 },
];

const FOODS_BY_NAME = new Map(
  INDIAN_FOODS.map((food) => [food.name.trim().toLowerCase(), food]),
);

export function findIndianFoodByName(name: string) {
  return FOODS_BY_NAME.get(name.trim().toLowerCase()) ?? null;
}
