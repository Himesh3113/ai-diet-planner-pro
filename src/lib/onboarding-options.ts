export const activityLevels = [
  { label: "Sedentary", value: "sedentary" },
  { label: "Light", value: "light" },
  { label: "Moderate", value: "moderate" },
  { label: "Active", value: "active" },
  { label: "Very active", value: "very_active" },
] as const;

export const genders = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
] as const;

export const dietTypes = [
  { label: "Veg", value: "veg" },
  { label: "Non-veg", value: "non_veg" },
] as const;

export const trainingPreferences = [
  { label: "Gym", value: "gym" },
  { label: "Non-gym", value: "non_gym" },
] as const;

export const gymCategories = [
  { label: "Bulking", value: "bulking" },
  { label: "Cutting", value: "cutting" },
  { label: "Muscle Building", value: "muscle_building" },
  { label: "Fat Loss", value: "fat_loss" },
  { label: "Lean Bulk", value: "lean_bulk" },
  { label: "Strength Training", value: "strength_training" },
] as const;

export const nonGymCategories = [
  { label: "Weight Loss", value: "weight_loss" },
  { label: "Weight Gain", value: "weight_gain" },
  { label: "Healthy Lifestyle", value: "healthy_lifestyle" },
  { label: "Diabetic Diet", value: "diabetic_diet" },
  { label: "Maintenance Diet", value: "maintenance_diet" },
] as const;

export const commonAllergies = [
  "Dairy",
  "Eggs",
  "Gluten",
  "Peanuts",
  "Seafood",
  "Soy",
  "Tree nuts",
] as const;

export const commonFoodPreferences = [
  "High protein",
  "Indian meals",
  "Low carb",
  "Meal prep friendly",
  "Quick breakfasts",
  "Rice based meals",
  "Spicy food",
  "Workout snacks",
] as const;

export type ActivityLevel = (typeof activityLevels)[number]["value"];
export type DietType = (typeof dietTypes)[number]["value"];
export type Gender = (typeof genders)[number]["value"];
export type GymCategory = (typeof gymCategories)[number]["value"];
export type NonGymCategory = (typeof nonGymCategories)[number]["value"];
export type TrainingPreference = (typeof trainingPreferences)[number]["value"];

export function getCategoryLabel(value?: null | string) {
  return (
    [...gymCategories, ...nonGymCategories].find((option) => option.value === value)?.label ??
    "Not selected"
  );
}

export function getOptionLabel<T extends readonly { label: string; value: string }[]>(
  options: T,
  value?: null | string,
) {
  return options.find((option) => option.value === value)?.label ?? "Not selected";
}
