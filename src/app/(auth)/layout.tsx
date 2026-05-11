import { ReactNode, Suspense } from "react";
import Link from "next/link";
import { Activity, Apple, Dumbbell, ShieldCheck } from "lucide-react";
import { AuthStatusToast } from "@/components/auth/auth-status-toast";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background text-white noise-bg">
      <Suspense fallback={null}>
        <AuthStatusToast />
      </Suspense>
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(57,255,20,0.08),transparent)]" />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(90deg,rgba(0,240,255,0.08),transparent)]" />

      <div className="relative z-10 grid min-h-screen w-full lg:grid-cols-[1.04fr_0.96fr]">
        <aside className="hidden border-r border-white/[0.08] px-10 py-8 lg:flex lg:flex-col lg:justify-between">
          <Link href="/" className="flex w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-neon text-black shadow-[0_0_26px_rgba(57,255,20,0.32)]">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-extrabold tracking-tight">AI Diet Planner Pro</p>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/35">
                Fitness OS
              </p>
            </div>
          </Link>

          <div className="max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-neon/20 bg-brand-neon/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
              Secure beta access
            </div>
            <h2 className="text-5xl font-black leading-[1.02] tracking-tight">
              Premium nutrition access for serious training.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/52">
              Phase 1 establishes the secure account foundation. Meal planning and AI
              intelligence stay out until the auth layer is rock solid.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "Supabase auth" },
                { icon: Activity, label: "Session guard" },
                { icon: Apple, label: "Planner ready" },
              ].map(({ icon: Icon, label }) => (
                <div className="glass rounded-lg border border-white/[0.08] p-4" key={label}>
                  <Icon className="mb-4 h-5 w-5 text-brand-neon" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="max-w-md text-xs leading-5 text-white/32">
            Built for secure onboarding before advanced nutrition features are introduced.
          </p>
        </aside>

        <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[460px]">
            <div className="mb-8 flex items-center justify-center lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-neon text-black shadow-[0_0_22px_rgba(57,255,20,0.28)]">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-extrabold">AI Diet Planner Pro</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                    Fitness OS
                  </p>
                </div>
              </Link>
            </div>

            <div className="glass relative overflow-hidden rounded-lg border border-white/[0.08] p-6 shadow-2xl shadow-black/35 sm:p-8">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(57,255,20,0.85),transparent)]" />
              <div className="relative">{children}</div>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-white/35">
              Protected by Supabase session cookies and route-level access control.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
