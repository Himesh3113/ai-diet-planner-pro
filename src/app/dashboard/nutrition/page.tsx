import { getProtectedProfileContext } from "@/lib/profile";
import { NutritionOverviewCards } from "@/components/dashboard/health-dashboard/nutrition-overview-cards";
import { FoodLogSection } from "@/components/dashboard/health-dashboard/food-log-section";
import { MealRecommendationsSection } from "@/components/dashboard/health-dashboard/meal-recommendations-section";

export default async function NutritionPage() {
  const { metrics } = await getProtectedProfileContext();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
          Nutrition Hub
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          Macro Targets & Food Diary
        </h2>
        <p className="text-sm text-white/52">
          Track calorie intake, macronutrient distribution, and view recommended diets synced to your metabolic rate.
        </p>
      </div>

      <NutritionOverviewCards metrics={metrics} />
      <FoodLogSection metrics={metrics} />
      <MealRecommendationsSection />
    </div>
  );
}
