import { redirect } from "next/navigation";
import { DashboardShell, type DashboardUser } from "@/components/dashboard/dashboard-shell";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,avatar_url,role")
    .eq("id", user.id)
    .maybeSingle();

  const dashboardUser: DashboardUser = {
    avatarUrl: profile?.avatar_url ?? null,
    email: profile?.email ?? user.email ?? "member@ai-diet-planner.local",
    fullName: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    id: user.id,
    role: profile?.role ?? "user",
  };

  return <DashboardShell user={dashboardUser}>{children}</DashboardShell>;
}
