"use client";

import { Award } from "lucide-react";
import type { AnalyticsBadge } from "@/lib/weekly-analytics/types";

type Props = {
  badges: AnalyticsBadge[];
};

export function AnalyticsBadgeGrid({ badges }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {badges.map((b) => (
        <div
          key={b.id}
          className={`rounded-lg border px-3 py-2.5 transition-colors ${
            b.unlocked
              ? "border-brand-neon/35 bg-brand-neon/[0.06]"
              : "border-white/[0.06] bg-white/[0.02] opacity-45"
          }`}
        >
          <div className="flex items-start gap-2">
            <Award
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                b.unlocked ? "text-brand-neon" : "text-white/25"
              }`}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-[11px] font-black leading-tight text-white">
                {b.title}
              </p>
              <p className="mt-1 text-[10px] leading-snug text-white/38">
                {b.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
