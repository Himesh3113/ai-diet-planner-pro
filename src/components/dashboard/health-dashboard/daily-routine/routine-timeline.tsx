"use client";

import type { TimedBlock } from "@/lib/daily-routine/types";

type Props = {
  title: string;
  blocks: TimedBlock[];
};

export function RoutineTimeline({ title, blocks }: Props) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
        {title}
      </p>
      <ul className="mt-3 space-y-3">
        {blocks.map((b, i) => (
          <li
            key={`${b.timeLabel}-${i}`}
            className="flex gap-3 border-l-2 border-brand-neon/35 pl-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-brand-neon">{b.timeLabel}</p>
              <p className="mt-0.5 text-sm font-bold text-white">{b.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/42">{b.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
