import { getProtectedProfileContext } from "@/lib/profile";
import type { Database } from "@/lib/supabase/types";
import { createClient } from "@/utils/supabase/server";
import { ActivityLogger } from "@/components/dashboard/health-dashboard/activity-logger";

type WorkoutSession = Database["public"]["Tables"]["workout_sessions"]["Row"];

export default async function ActivityPage() {
  const { user } = await getProtectedProfileContext();

  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_on", { ascending: false });

  const typedSessions: WorkoutSession[] = sessions ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
          Activity Tracker
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          Logged Sessions & Workouts
        </h2>
        <p className="text-sm text-white/52">
          Track individual sessions, calories expended, and monitor historical workout logs.
        </p>
      </div>

      <ActivityLogger initialSessions={typedSessions} userId={user.id} />
    </div>
  );
}
