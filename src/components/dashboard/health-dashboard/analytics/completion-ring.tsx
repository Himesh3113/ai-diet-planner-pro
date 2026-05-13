"use client";

const NEON_RING = "#39FF14";

type Props = {
  percent: number;
  subtitle?: string;
};

export function CompletionRing({ percent, subtitle }: Props) {
  const safe = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative h-36 w-36 sm:h-40 sm:w-40"
        role="img"
        aria-label={`Weekly readiness ${safe} percent`}
      >
        <div
          className="absolute inset-0 rounded-full p-1"
          style={{
            background: `conic-gradient(${NEON_RING} ${safe * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
          }}
        />
        <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full border border-white/[0.06] bg-black/55">
          <span className="text-3xl font-black tabular-nums text-white sm:text-4xl">
            {safe}
            <span className="text-lg font-bold text-white/45">%</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
            Week score
          </span>
        </div>
      </div>
      {subtitle ? (
        <p className="max-w-[14rem] text-center text-xs leading-relaxed text-white/40">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
