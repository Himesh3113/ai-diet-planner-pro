import {
  Activity,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Flame,
  Target,
  UserRoundCheck,
} from "lucide-react";
import {
  activityLevels,
  dietTypes,
  getCategoryLabel,
  getOptionLabel,
} from "@/lib/onboarding-options";
import { getProtectedProfileContext } from "@/lib/profile";

const placeholders = [
  "Meal planner module",
  "Macro tracking module",
  "Progress analytics module",
  "AI recommendation module",
];

export default async function DashboardPage() {
  const { metrics, profile } = await getProtectedProfileContext();
  const category =
    metrics?.training_preference === "gym"
      ? metrics.gym_category
      : metrics?.non_gym_category;

  const widgets = [
    {
      icon: Target,
      label: "Goal setup",
      title: "Training category",
      value: getCategoryLabel(category),
    },
    {
      icon: Flame,
      label: "Nutrition",
      title: "Diet preference",
      value: getOptionLabel(dietTypes, metrics?.diet_type),
    },
    {
      icon: Activity,
      label: "Training",
      title: "Activity baseline",
      value: getOptionLabel(activityLevels, metrics?.activity_level),
    },
    {
      icon: ChartNoAxesColumnIncreasing,
      label: "Body profile",
      title: "Current metrics",
      value:
        metrics?.height && metrics.weight
          ? `${metrics.height} cm / ${metrics.weight} kg`
          : "Not configured",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="glass rounded-lg border border-white/[0.08] p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-neon">
              Profile workspace
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Your onboarding profile is active.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/52 sm:text-base">
              Phase 2 stores your personal metrics and food preferences for later modules.
              AI meal planning remains disabled.
            </p>
          </div>
        </div>

        <div className="glass rounded-lg border border-white/[0.08] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-blue/25 bg-brand-blue/10 text-brand-blue">
              <UserRoundCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {profile?.full_name ?? "Fitness member"}
              </p>
              <p className="text-xs text-white/42">Dashboard profile summary</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { label: "Age", value: metrics?.age ? `${metrics.age}` : "-" },
              { label: "Gender", value: metrics?.gender ?? "-" },
              {
                label: "Preference",
                value: metrics?.training_preference
                  ? metrics.training_preference === "gym"
                    ? "Gym"
                    : "Non-gym"
                  : "-",
              },
              {
                label: "Allergies",
                value: metrics?.allergies?.length ? `${metrics.allergies.length}` : "0",
              },
            ].map((item) => (
              <div
                className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-3"
                key={item.label}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                  {item.label}
                </p>
                <p className="mt-1 truncate text-sm font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {widgets.map(({ icon: Icon, label, title, value }) => (
          <div className="glass rounded-lg border border-white/[0.08] p-5" key={title}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                  {label}
                </p>
                <h3 className="mt-3 text-lg font-black text-white">{title}</h3>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-5 text-sm text-white/45">{value}</p>
          </div>
        ))}
      </section>

      <section className="glass rounded-lg border border-white/[0.08] p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
              Upcoming modules
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">Reserved placeholders</h2>
          </div>
          <p className="text-sm text-white/42">No AI, admin, or meal planning tools are active.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {placeholders.map((item) => (
            <div
              className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-white/[0.12] bg-white/[0.025] px-4 text-center text-sm font-semibold text-white/38"
              key={item}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 text-xs text-white/32">
          <ClipboardList className="h-4 w-4 text-brand-neon" />
          Profile data is saved in Supabase user metrics.
        </div>
      </section>
    </div>
  );
}
