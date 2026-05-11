"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

export type DashboardUser = {
  avatarUrl: null | string;
  email: string;
  fullName: null | string;
  id: string;
  onboardingCompleted: boolean;
  role: string;
};

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/onboarding", icon: ClipboardList, label: "Onboarding" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "#activity", icon: Activity, label: "Activity" },
  { href: "#schedule", icon: CalendarDays, label: "Schedule" },
  { href: "#settings", icon: Settings, label: "Settings" },
];

function getInitials(user: DashboardUser) {
  const label = user.fullName || user.email;
  return label
    .split(/[ @.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function SidebarContent({
  onNavigate,
  user,
}: {
  onNavigate?: () => void;
  user: DashboardUser;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Link className="flex items-center gap-3" href="/dashboard" onClick={onNavigate}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-neon text-black shadow-[0_0_22px_rgba(57,255,20,0.28)]">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-white">AI Diet Planner Pro</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/34">
              {user.onboardingCompleted ? "Dashboard" : "Setup required"}
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href.startsWith("/") && pathname === href;

          return (
            <Link
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-white/54 transition",
                active
                  ? "border border-brand-neon/25 bg-brand-neon/10 text-brand-neon"
                  : "hover:bg-white/[0.06] hover:text-white",
              )}
              href={href}
              key={label}
              onClick={onNavigate}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.08] p-4">
        <div className="glass rounded-lg border border-white/[0.08] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.08] text-sm font-black text-white">
              {getInitials(user)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {user.fullName || "Fitness member"}
              </p>
              <p className="truncate text-xs text-white/40">{user.email}</p>
            </div>
          </div>
          <div className="mt-3 rounded-md border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/38">
            {user.role}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  user,
}: {
  children: ReactNode;
  user: DashboardUser;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleLogout() {
    setIsSigningOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setIsSigningOut(false);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "error",
      });
      return;
    }

    toast({
      title: "Signed out",
      description: "Your session has ended.",
      variant: "success",
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <div
        className="fixed inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="fixed inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(57,255,20,0.08),transparent)]" />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/[0.08] bg-black/30 backdrop-blur-xl lg:block">
        <SidebarContent user={user} />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div
          className={cn(
            "h-full w-[min(86vw,320px)] border-r border-white/[0.08] bg-[#07070b] transition duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex justify-end px-4 py-4">
            <button
              aria-label="Close navigation"
              className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              onClick={() => setMobileOpen(false)}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <SidebarContent onNavigate={() => setMobileOpen(false)} user={user} />
        </div>
      </div>

      <div className="relative z-10 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-background/76 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open navigation"
                className="rounded-lg border border-white/10 p-2 text-white/70 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
                onClick={() => setMobileOpen(true)}
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-neon">
                  Phase 2
                </p>
                <h1 className="text-lg font-black tracking-tight text-white sm:text-xl">
                  Profile Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                aria-label="Notifications"
                className="hidden rounded-lg border border-white/10 p-2 text-white/55 transition hover:bg-white/[0.06] hover:text-white sm:inline-flex"
                type="button"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="hidden min-w-0 text-right sm:block">
                <p className="truncate text-sm font-bold text-white">
                  {user.fullName || "Fitness member"}
                </p>
                <p className="truncate text-xs text-white/40">{user.email}</p>
              </div>
              <Button
                className="h-10 px-3"
                isLoading={isSigningOut}
                onClick={handleLogout}
                type="button"
                variant="secondary"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
