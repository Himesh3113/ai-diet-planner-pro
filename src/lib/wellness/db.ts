import type { Json } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getCatalogEntry } from "./catalog";
import { getConditionProfile } from "./condition-profiles";
import type { WellnessSeverity, WellnessStatus } from "./types";

export type WellnessConditionRow =
  Database["public"]["Tables"]["wellness_conditions"]["Row"];

export type WellnessLogRow = Database["public"]["Tables"]["wellness_logs"]["Row"];

export type WellnessRecommendationRow =
  Database["public"]["Tables"]["wellness_recommendations"]["Row"];

export type RecoveryProgressRow =
  Database["public"]["Tables"]["recovery_progress"]["Row"];

export async function fetchUserWellnessConditions(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("wellness_conditions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchWellnessHubData(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const start = weekAgo.toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  const [conditions, logs, recommendations, progress, hydration, sleep] =
    await Promise.all([
      supabase
        .from("wellness_conditions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("wellness_logs")
        .select("*")
        .eq("user_id", userId)
        .order("logged_at", { ascending: false })
        .limit(30),
      supabase
        .from("wellness_recommendations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("recovery_progress")
        .select("*")
        .eq("user_id", userId)
        .gte("recorded_on", start)
        .lte("recorded_on", today)
        .order("recorded_on", { ascending: true }),
      supabase
        .from("hydration_logs")
        .select("logged_on, water_ml")
        .eq("user_id", userId)
        .gte("logged_on", start)
        .lte("logged_on", today)
        .order("logged_on", { ascending: true }),
      supabase
        .from("sleep_logs")
        .select("logged_on, duration_hours, quality_score")
        .eq("user_id", userId)
        .gte("logged_on", start)
        .lte("logged_on", today)
        .order("logged_on", { ascending: true }),
    ]);

  if (conditions.error) throw conditions.error;
  if (logs.error) throw logs.error;
  if (recommendations.error) throw recommendations.error;
  if (progress.error) throw progress.error;
  if (hydration.error) throw hydration.error;
  if (sleep.error) throw sleep.error;

  return {
    conditions: conditions.data ?? [],
    logs: logs.data ?? [],
    recommendations: recommendations.data ?? [],
    progress: progress.data ?? [],
    hydration: hydration.data ?? [],
    sleep: sleep.data ?? [],
  };
}

export async function upsertWellnessCondition(
  supabase: SupabaseClient<Database>,
  args: {
    userId: string;
    conditionKey: string;
    severity: WellnessSeverity;
    status: WellnessStatus;
    symptoms?: string[];
    notes?: string | null;
    hydrationTargetMl?: number;
    sleepTargetHours?: number;
    recoveryProgress?: number;
    id?: string;
  },
) {
  const meta = getCatalogEntry(args.conditionKey);
  if (!meta) throw new Error("Unknown wellness condition.");

  const payload = {
    user_id: args.userId,
    condition_key: args.conditionKey,
    severity: args.severity,
    status: args.status,
    symptoms: args.symptoms ?? [],
    notes: args.notes ?? null,
    hydration_target_ml: args.hydrationTargetMl ?? meta.defaultHydrationMl,
    sleep_target_hours: args.sleepTargetHours ?? meta.defaultSleepHours,
    recovery_progress: args.recoveryProgress ?? 0,
    stress_impact: meta.stressImpact,
    energy_impact: meta.energyImpact,
    skin_impact: meta.skinImpact,
    updated_at: new Date().toISOString(),
  };

  if (args.id) {
    const { data, error } = await supabase
      .from("wellness_conditions")
      .update(payload)
      .eq("id", args.id)
      .eq("user_id", args.userId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("wellness_conditions")
    .upsert(payload, { onConflict: "user_id,condition_key" })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWellnessCondition(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
) {
  const { error } = await supabase
    .from("wellness_conditions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function markWellnessRecovered(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from("wellness_conditions")
    .update({
      status: "recovered",
      recovery_progress: 100,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;

  await supabase.from("wellness_logs").insert({
    user_id: userId,
    wellness_condition_id: id,
    log_type: "milestone",
    message: "Marked as recovered",
    metadata: { status: "recovered" } as Json,
  });

  return data;
}

export async function seedRecommendationsForCondition(
  supabase: SupabaseClient<Database>,
  userId: string,
  conditionId: string,
  conditionKey: string,
) {
  const profile = getConditionProfile(conditionKey);
  if (!profile) return;

  await supabase
    .from("wellness_recommendations")
    .delete()
    .eq("wellness_condition_id", conditionId)
    .eq("user_id", userId);

  const foodLines = profile.recommendedFoods
    .map((f) => `${f.name}: ${f.whyItHelps}`)
    .join(" | ");
  const avoidLines = profile.foodsToAvoid.map((f) => `${f.name} — ${f.reason}`).join(" | ");
  const suppLines = profile.supplements
    .map((s) => `${s.name} (${s.timing}): ${s.benefits}`)
    .join(" | ");

  const rows = [
    {
      user_id: userId,
      wellness_condition_id: conditionId,
      category: "overview",
      title: "Condition overview",
      content: profile.overview,
      priority: 12,
    },
    {
      user_id: userId,
      wellness_condition_id: conditionId,
      category: "nutrition",
      title: "Recommended foods (7)",
      content: foodLines,
      priority: 10,
    },
    {
      user_id: userId,
      wellness_condition_id: conditionId,
      category: "avoid",
      title: "Foods to avoid",
      content: avoidLines,
      priority: 9,
    },
    {
      user_id: userId,
      wellness_condition_id: conditionId,
      category: "supplement",
      title: "Supplement guidance",
      content: suppLines,
      priority: 8,
    },
    {
      user_id: userId,
      wellness_condition_id: conditionId,
      category: "routine",
      title: "Daily wellness routine",
      content: profile.dailyRoutine
        .map((r) => `${r.period}: ${r.items.join("; ")}`)
        .join(" || "),
      priority: 7,
    },
    {
      user_id: userId,
      wellness_condition_id: conditionId,
      category: "exercise",
      title: "Movement",
      content: profile.recommendedExercises.join(" · "),
      priority: 6,
    },
    ...profile.aiInsights.slice(0, 3).map((msg, i) => ({
      user_id: userId,
      wellness_condition_id: conditionId,
      category: "insight",
      title: "AI insight",
      content: msg,
      priority: 5 - i,
    })),
  ];

  await supabase.from("wellness_recommendations").insert(rows);

  await supabase.from("wellness_logs").insert({
    user_id: userId,
    wellness_condition_id: conditionId,
    log_type: "milestone",
    message: `Detailed wellness profile generated for ${profile.title}`,
    metadata: { conditionKey, profileTitle: profile.title } as Json,
  });
}

export async function recordRecoverySnapshot(
  supabase: SupabaseClient<Database>,
  userId: string,
  conditionId: string,
  scores: {
    recovery: number;
    energy: number;
    sleep: number;
    skin: number;
    nutrition: number;
    stress: number;
  },
) {
  const today = new Date().toISOString().split("T")[0];
  const { error } = await supabase.from("recovery_progress").upsert(
    {
      user_id: userId,
      wellness_condition_id: conditionId,
      recovery_score: scores.recovery,
      energy_score: scores.energy,
      sleep_score: scores.sleep,
      skin_score: scores.skin,
      nutrition_score: scores.nutrition,
      stress_score: scores.stress,
      recorded_on: today,
    },
    { onConflict: "wellness_condition_id,recorded_on" },
  );
  if (error) throw error;
}
