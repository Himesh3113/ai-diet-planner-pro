import { getProtectedProfileContext } from "@/lib/profile";
import {
  getCategoryLabel,
  getOptionLabel,
  dietTypes,
} from "@/lib/onboarding-options";
import { activityLevels } from "@/lib/onboarding-options";
import { AIAssistantWidget } from "@/components/dashboard/health-dashboard/ai-assistant-widget";
import { MealRecommendationsSection } from "@/components/dashboard/health-dashboard/meal-recommendations-section";
import { WeeklyAnalyticsSection } from "@/components/dashboard/health-dashboard/weekly-analytics-section";
import { DailyRoutineSection } from "@/components/dashboard/health-dashboard/daily-routine-section";
import { HealthConditionsSection } from "@/components/dashboard/health-dashboard/health-conditions-section";
import { NutritionOverviewCards } from "@/components/dashboard/health-dashboard/nutrition-overview-cards";
import { UserSummaryCards } from "@/components/dashboard/health-dashboard/user-summary-cards";
import { FoodLogSection } from "@/components/dashboard/health-dashboard/food-log-section";

export default async function DashboardPage() {
  const { metrics, profile } = await getProtectedProfileContext();

  const trainingCategory =
    metrics?.training_preference === "gym"
      ? getCategoryLabel(metrics?.gym_category)
      : getCategoryLabel(metrics?.non_gym_category);

  const dietLabel = getOptionLabel(dietTypes, metrics?.diet_type);
  const activityLabel = getOptionLabel(activityLevels, metrics?.activity_level);

  const allergiesCount = metrics?.allergies?.length ?? 0;
  const trainingPreferenceLabel =
    metrics?.training_preference === "gym" ? "Gym" : "Non-gym";

  const fullName = profile?.full_name ?? null;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass rounded-lg border border-white/[0.08] p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-neon">
              Health Dashboard V1
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Your personalized health snapshot
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/52 sm:text-base">
              This dashboard surfaces your onboarding profile as clean, actionable modules.
              AI meal planning remains disabled (placeholder UI only).
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                  Training category
                </p>
                <p className="mt-1 truncate text-sm font-bold text-white">
                  {trainingCategory}
                </p>
              </div>
              <div className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                  Diet / activity
                </p>
                <p className="mt-1 truncate text-sm font-bold text-white">
                  {dietLabel} · {activityLabel}
                </p>
              </div>
            </div>
          </div>
        </div>

        <UserSummaryCards
          fullName={fullName}
          age={metrics?.age ?? null}
          gender={metrics?.gender ?? null}
          height={metrics?.height ?? null}
          weight={metrics?.weight ?? null}
          allergiesCount={allergiesCount}
          trainingPreferenceLabel={trainingPreferenceLabel}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <NutritionOverviewCards metrics={metrics} />
        <AIAssistantWidget />
      </section>

      <FoodLogSection metrics={metrics} />

      <MealRecommendationsSection />

      <WeeklyAnalyticsSection />

      <DailyRoutineSection />

      <HealthConditionsSection />
    </div>
  );
}
