import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function getProtectedProfileContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: metrics }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name,email,avatar_url,role,onboarding_completed")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("user_metrics").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  return {
    email: user.email ?? profile?.email ?? "",
    metrics,
    profile,
    user,
  };
}
