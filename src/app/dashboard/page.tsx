import {
  Activity,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Flame,
  Target,
} from "lucide-react";

const widgets = [
  {
    icon: Target,
    label: "Goal setup",
    title: "Personal profile",
    value: "Waiting for onboarding",
  },
  {
    icon: Flame,
    label: "Nutrition",
    title: "Daily targets",
    value: "Not configured",
  },
  {
    icon: Activity,
    label: "Training",
    title: "Activity baseline",
    value: "No data yet",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    label: "Progress",
    title: "Weekly snapshot",
    value: "Empty",
  },
];

const placeholders = [
  "Meal planner module",
  "Macro tracking module",
  "Progress analytics module",
  "AI recommendation module",
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="glass rounded-lg border border-white/[0.08] p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-neon">
              Secure workspace
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Your dashboard foundation is ready.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/52 sm:text-base">
              Phase 1 keeps this space intentionally empty while authentication,
              session persistence, and protected routing settle into place.
            </p>
          </div>
        </div>

        <div className="glass rounded-lg border border-white/[0.08] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-blue/25 bg-brand-blue/10 text-brand-blue">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Phase 1 status</p>
              <p className="text-xs text-white/42">Auth and layout only</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {["Landing", "Email auth", "Route guard", "Dashboard shell"].map((item) => (
              <div
                className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-2"
                key={item}
              >
                <span className="text-sm font-medium text-white/72">{item}</span>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-neon">
                  Ready
                </span>
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
      </section>
    </div>
  );
}
