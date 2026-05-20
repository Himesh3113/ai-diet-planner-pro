import { getProtectedProfileContext } from "@/lib/profile";
import type { Database } from "@/lib/supabase/types";
import { createClient } from "@/utils/supabase/server";
import { DashboardOverview } from "@/components/dashboard/health-dashboard/dashboard-overview";
import { MealRecommendationsSection } from "@/components/dashboard/health-dashboard/meal-recommendations-section";
import { ProgressAnalyticsSection } from "@/components/dashboard/health-dashboard/progress-analytics-section";

type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];

export default async function DashboardPage() {
  const { metrics, profile, user } = await getProtectedProfileContext();

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const startTrendDate = new Date();
  startTrendDate.setDate(startTrendDate.getDate() - 3);
  const startTrendStr = startTrendDate.toISOString().split("T")[0];

  const [
    { data: todayFoodLogs },
    { data: todayHydrationLogs },
    { data: todaySleepLogs },
    { data: recentHydration },
    { data: recentFood },
  ] = await Promise.all([
    supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("logged_on", today),
    supabase
      .from("hydration_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("logged_on", today),
    supabase
      .from("sleep_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("logged_on", today),
    supabase
      .from("hydration_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_on", startTrendStr)
      .lte("logged_on", today)
      .order("logged_on", { ascending: true }),
    supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_on", startTrendStr)
      .lte("logged_on", today),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <DashboardOverview
        user={user}
        metrics={metrics as MetricsRow | null}
        profile={
          profile
            ? {
                full_name: profile.full_name,
                email: profile.email,
                avatar_url: profile.avatar_url,
                role: profile.role ?? "user",
                onboarding_completed: profile.onboarding_completed ?? false,
              }
            : null
        }
        initialFoodLogs={todayFoodLogs ?? []}
        initialHydrationLogs={todayHydrationLogs ?? []}
        initialSleepLogs={todaySleepLogs ?? []}
        recentHydration={recentHydration ?? []}
        recentFood={recentFood ?? []}
      />

      <MealRecommendationsSection />

      <ProgressAnalyticsSection metrics={metrics} />
    </div>
  );
}
