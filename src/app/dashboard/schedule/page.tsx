import { DailyRoutineSection } from "@/components/dashboard/health-dashboard/daily-routine-section";
import { HealthConditionsSection } from "@/components/dashboard/health-dashboard/health-conditions-section";

export default function SchedulePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
          Daily Routine Planner
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          Routine Checklist & Schedules
        </h2>
        <p className="text-sm text-white/52">
          Organize meal times, workout segments, water breaks, and recovery protocols into a structured calendar interface.
        </p>
      </div>

      <DailyRoutineSection />
      <HealthConditionsSection />
    </div>
  );
}
