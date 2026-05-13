import type { ReactNode } from "react";
import { UserRoundCheck } from "lucide-react";

type CardKV = {
  label: string;
  value: ReactNode;
};

export function UserSummaryCards({
  fullName,
  age,
  gender,
  height,
  weight,
  allergiesCount,
  trainingPreferenceLabel,
}: {
  fullName: string | null;
  age: number | string | null;
  gender: string | null;
  height: number | string | null;
  weight: number | string | null;
  allergiesCount: number;
  trainingPreferenceLabel: string;
}) {
  const items: CardKV[] = [
    { label: "Age", value: age ?? "-" },
    { label: "Gender", value: gender ?? "-" },
    { label: "Preference", value: trainingPreferenceLabel },
    {
      label: "Allergies",
      value: allergiesCount ? `${allergiesCount}` : "0",
    },
    {
      label: "Height / Weight",
      value:
        height && weight ? `${height} cm / ${weight} kg` : "Not configured",
    },
    {
      label: "Profile",
      value: fullName ? fullName : "Fitness member",
    },
  ];

  return (
    <section className="glass rounded-lg border border-white/[0.08] p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-blue/25 bg-brand-blue/10 text-brand-blue">
          <UserRoundCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">
            {fullName ?? "Fitness member"}
          </p>
          <p className="text-xs text-white/42">User summary</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-3"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
              {item.label}
            </p>
            <p className="mt-1 truncate text-sm font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

