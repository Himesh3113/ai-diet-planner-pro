import { SleepTrackingSection } from "@/components/dashboard/health-dashboard/sleep-tracking-section";

export default function SleepPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
          Sleep & Recovery
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          Circadian Rhythm Tracker
        </h2>
        <p className="text-sm text-white/52">
          Monitor your sleep cycles, log sleep quality indexes, and analyze recovery metrics for maximum energy levels.
        </p>
      </div>

      <SleepTrackingSection />
    </div>
  );
}
