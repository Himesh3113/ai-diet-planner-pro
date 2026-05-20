import Link from "next/link";
import { DailyRoutineSection } from "@/components/dashboard/health-dashboard/daily-routine-section";
import { HeartPulse } from "lucide-react";

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

      <Link
        href="/dashboard/wellness-hub"
        className="glass flex items-center gap-4 rounded-lg border border-brand-neon/20 bg-brand-neon/5 p-5 transition hover:border-brand-neon/40"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-neon/15 text-brand-neon">
          <HeartPulse className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-black text-white">Wellness Hub</p>
          <p className="mt-1 text-xs text-white/50">
            Track conditions, recovery, and AI-personalized guidance across diet, sleep, and training.
          </p>
        </div>
      </Link>
    </div>
  );
}
