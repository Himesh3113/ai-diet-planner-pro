import { getProtectedProfileContext } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Shield, Moon, Monitor } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const { email, profile, user } = await getProtectedProfileContext();

  // Handle logout via server-action if needed, or simply render the client triggers.
  // We'll render a elegant clean settings page layout.

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
          System Preferences
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          Account & App Settings
        </h2>
        <p className="text-sm text-white/52">
          Manage your account profile, notification controls, and view platform subscription level.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column - details */}
        <div className="md:col-span-2 space-y-6">
          {/* Account Box */}
          <div className="glass rounded-xl border border-white/[0.08] p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-white/70">Account Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-xs text-white/40 font-semibold block">Email Address</span>
                <span className="text-sm text-white font-bold block mt-1">{email}</span>
              </div>
              <div>
                <span className="text-xs text-white/40 font-semibold block">User Role</span>
                <span className="text-sm text-white font-bold block mt-1 capitalize">{profile?.role ?? "Standard User"}</span>
              </div>
            </div>
          </div>

          {/* Notifications toggles */}
          <div className="glass rounded-xl border border-white/[0.08] p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-white/70 flex items-center gap-2">
              <Bell className="h-4 w-4 text-brand-neon" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <span className="text-sm font-bold text-white block">Email Summaries</span>
                  <span className="text-xs text-white/40 block mt-0.5">Receive weekly nutritional recommendations via email</span>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded bg-white/5 border-white/10 text-brand-neon focus:ring-brand-neon h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">Hydration Reminders</span>
                  <span className="text-xs text-white/40 block mt-0.5">Send browser nudge alerts for daily target metrics</span>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded bg-white/5 border-white/10 text-brand-neon focus:ring-brand-neon h-4 w-4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column - System preferences */}
        <div className="space-y-6">
          <div className="glass rounded-xl border border-white/[0.08] p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-white/70 flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-neon" />
              Theme Control
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-brand-neon/10 border border-brand-neon/20 text-brand-neon">
                <span className="text-xs font-bold flex items-center gap-2">
                  <Moon className="h-3.5 w-3.5" />
                  Dark Mode (Active)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-white/40 cursor-not-allowed">
                <span className="text-xs font-semibold flex items-center gap-2">
                  <Monitor className="h-3.5 w-3.5" />
                  System Default
                </span>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl border border-white/[0.08] p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-white/70">Membership Status</h3>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-neon block">Pro Tier Access</span>
              <span className="text-xs text-white/45 block mt-2">Active Plan: Infinite Coach</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
