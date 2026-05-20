import { getProtectedProfileContext } from "@/lib/profile";
import { WeeklyAnalyticsSection } from "@/components/dashboard/health-dashboard/weekly-analytics-section";
import { ProgressAnalyticsSection } from "@/components/dashboard/health-dashboard/progress-analytics-section";

export default async function AnalyticsPage() {
  const { metrics } = await getProtectedProfileContext();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
          Analytics Hub
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          Weekly Progress & Metrics Overview
        </h2>
        <p className="text-sm text-white/52">
          Compare your maintenance levels with logged daily averages to ensure long-term consistency.
        </p>
      </div>

      <ProgressAnalyticsSection metrics={metrics} />
      <WeeklyAnalyticsSection />
    </div>
  );
}
