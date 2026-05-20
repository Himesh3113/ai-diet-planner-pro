import { WorkoutPlannerSection } from "@/components/dashboard/health-dashboard/workout-planner-section";

export default function WorkoutPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
          Workout Hub
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          AI Training Planner
        </h2>
        <p className="text-sm text-white/52">
          Generate structured home or gym workout splits, track dynamic exercise goals, and save your daily progression.
        </p>
      </div>

      <WorkoutPlannerSection />
    </div>
  );
}
