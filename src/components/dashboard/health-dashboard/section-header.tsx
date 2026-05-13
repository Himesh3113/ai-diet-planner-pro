import type { ReactNode } from "react";

export function SectionHeader({
  kicker,
  title,
  description,
  right,
}: {
  kicker: string;
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
          {kicker}
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/52 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

