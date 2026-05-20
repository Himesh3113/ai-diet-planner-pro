"use client";

import { cn } from "@/lib/utils";

export function WellnessScoreRing({
  label,
  value,
  accent = "text-brand-neon",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-white/10"
            fill="none"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            className={cn("stroke-current transition-all duration-700", accent)}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-lg font-black", accent)}>{value}</span>
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{label}</p>
    </div>
  );
}
