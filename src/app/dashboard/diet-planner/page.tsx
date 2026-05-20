import { DietPlannerSection } from "@/components/dashboard/health-dashboard/diet-planner-section";

export default function DietPlannerPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
          Diet Planner
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          Personalized AI Meal Plans
        </h2>
        <p className="text-sm text-white/52">
          Build a daily plan from foods you actually eat — tuned to your goal,
          diet type, Indian preferences, and budget.
        </p>
      </div>

      <DietPlannerSection />
    </div>
  );
}
