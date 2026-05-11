import { ReactNode } from "react";
import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden noise-bg">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-brand-neon/15 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-brand-blue/15 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[30%] w-[450px] h-[450px] bg-brand-purple/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000"></div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      ></div>

      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-md">
          {/* Floating fitness elements */}
          <div className="absolute -top-8 -left-8 w-16 h-16 rounded-2xl bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center animate-float">
            <span className="text-2xl">💪</span>
          </div>
          <div className="absolute -bottom-4 -right-4 w-14 h-14 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center animate-float animation-delay-2000">
            <span className="text-xl">🥗</span>
          </div>
          <div className="absolute top-1/2 -right-12 w-12 h-12 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center animate-float animation-delay-4000">
            <span className="text-lg">⚡</span>
          </div>

          <div className="glass rounded-3xl p-10 border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-neon to-brand-blue flex items-center justify-center shadow-lg shadow-brand-neon/20">
                <Dumbbell className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  AI Diet Planner
                </h1>
                <p className="text-xs text-foreground/40 font-medium tracking-widest uppercase">
                  Pro Edition
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-foreground leading-tight mb-4">
              Transform your body with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-neon via-brand-blue to-brand-purple">
                AI-powered nutrition
              </span>
            </h2>

            <p className="text-foreground/50 text-base leading-relaxed mb-8">
              Personalized meal plans, real-time calorie tracking, and smart
              recommendations — all designed around your unique fitness goals.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {[
                "Smart Meal Plans",
                "Macro Tracking",
                "AI Recommendations",
                "Progress Analytics",
              ].map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-foreground/70"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-6 flex gap-4">
            {[
              { label: "Active Users", value: "12K+" },
              { label: "Meals Planned", value: "1.2M" },
              { label: "Avg. Rating", value: "4.9★" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex-1 glass rounded-xl p-3 text-center border border-white/[0.04]"
              >
                <div className="text-lg font-bold text-brand-neon">
                  {stat.value}
                </div>
                <div className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Mobile-only brand header */}
        <div className="lg:hidden sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <Link href="/" className="flex justify-center items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-neon to-brand-blue flex items-center justify-center shadow-lg shadow-brand-neon/20">
              <Dumbbell className="w-5 h-5 text-black" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              AI Diet Planner Pro
            </h2>
          </Link>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-[440px]">
          <div className="glass rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/20 border border-white/[0.06] relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-neon/60 to-transparent"></div>

            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>

            <div className="relative z-10">{children}</div>
          </div>

          {/* Footer text */}
          <p className="mt-8 text-center text-xs text-foreground/30">
            By signing in, you agree to our{" "}
            <Link
              href="#"
              className="text-foreground/50 hover:text-foreground/70 transition-colors underline underline-offset-2"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="text-foreground/50 hover:text-foreground/70 transition-colors underline underline-offset-2"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
