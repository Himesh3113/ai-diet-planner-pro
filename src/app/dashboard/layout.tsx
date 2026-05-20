import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardShell, type DashboardUser } from "@/components/dashboard/dashboard-shell";
import { getProtectedProfileContext } from "@/lib/profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, profile, user } = await getProtectedProfileContext();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const dashboardUser: DashboardUser = {
    avatarUrl: profile?.avatar_url ?? null,
    email: profile?.email ?? email,
    fullName: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    id: user.id,
    onboardingCompleted: profile?.onboarding_completed ?? false,
    role: profile?.role ?? "user",
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DashboardShell user={dashboardUser}>{children}</DashboardShell>
    </Suspense>
  );
}
