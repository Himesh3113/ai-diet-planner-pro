"use client";

import type { InsightCard } from "@/lib/daily-routine/types";

const accentClass: Record<InsightCard["accent"], string> = {
  default: "border-white/[0.08]",
  diabetes: "border-amber-400/25 bg-amber-400/[0.04]",
  skin: "border-brand-pink/30 bg-brand-pink/[0.05]",
  joint: "border-brand-purple/30 bg-brand-purple/[0.05]",
  hair: "border-brand-blue/30 bg-brand-blue/[0.05]",
  goal: "border-brand-neon/35 bg-brand-neon/[0.05]",
};

export function RoutineInsightCard({ card }: { card: InsightCard }) {
  return (
    <article
      className={`rounded-lg border px-4 py-3 ${accentClass[card.accent]}`}
    >
      <p className="text-xs font-black text-white">{card.title}</p>
      <p className="mt-2 text-xs leading-relaxed text-white/45">{card.body}</p>
    </article>
  );
}
