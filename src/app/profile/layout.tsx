import { DashboardShell, type DashboardUser } from "@/components/dashboard/dashboard-shell";
import { getProtectedProfileContext } from "@/lib/profile";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, profile, user } = await getProtectedProfileContext();

  const dashboardUser: DashboardUser = {
    avatarUrl: profile?.avatar_url ?? null,
    email: profile?.email ?? email,
    fullName: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    id: user.id,
    onboardingCompleted: profile?.onboarding_completed ?? false,
    role: profile?.role ?? "user",
  };

  return <DashboardShell user={dashboardUser}>{children}</DashboardShell>;
}
