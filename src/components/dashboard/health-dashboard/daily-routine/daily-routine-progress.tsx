"use client";

import type { RoutineChecklistId, RoutineChecklistItem } from "@/lib/daily-routine/types";

type Props = {
  items: RoutineChecklistItem[];
  state: Record<RoutineChecklistId, boolean>;
  onToggle: (id: RoutineChecklistId) => void;
};

export function DailyRoutineProgress({ items, state, onToggle }: Props) {
  const done = items.filter((i) => state[i.id]).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
            Today&apos;s progress
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-white">
            {done}
            <span className="text-lg text-white/35">/{items.length}</span>
          </p>
        </div>
        <p className="text-xs font-bold text-brand-neon">{pct}%</p>
      </div>
      <div
        className="mt-3 h-2 rounded-full bg-white/[0.06]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Daily routine completion"
      >
        <div
          className="h-full rounded-full bg-brand-neon transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto sm:max-h-none">
        {items.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-2 py-1.5 hover:border-white/[0.06] hover:bg-white/[0.02]">
              <input
                type="checkbox"
                checked={Boolean(state[item.id])}
                onChange={() => onToggle(item.id)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/[0.06] text-brand-neon focus:ring-brand-neon/40"
              />
              <span className="text-xs leading-snug text-white/65">{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] leading-relaxed text-white/28">
        Saved on this device for today only. Resets at midnight local time.
      </p>
    </div>
  );
}
