import type { Json } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type {
  Affordability,
  DietFilter,
  DietGoal,
  PreferredFoodKey,
} from "./constants";
import type { DailyDietPlan } from "./types";

export type UserDietPreferencesRow =
  Database["public"]["Tables"]["user_diet_preferences"]["Row"];

export type GeneratedDietPlanRow =
  Database["public"]["Tables"]["generated_diet_plans"]["Row"];

export type DietPlannerSnapshot = {
  preferences: {
    goal: DietGoal;
    preferredFoods: PreferredFoodKey[];
    dietFilter: DietFilter;
    indianFoodPriority: boolean;
    affordability: Affordability;
  } | null;
  plan: DailyDietPlan | null;
  planSource: "ai" | "fallback" | null;
};

export function mapPreferencesRow(
  row: UserDietPreferencesRow,
): DietPlannerSnapshot["preferences"] {
  return {
    goal: row.goal as DietGoal,
    preferredFoods: (row.preferred_foods ?? []) as PreferredFoodKey[],
    dietFilter: row.diet_filter as DietFilter,
    indianFoodPriority: row.indian_food_priority,
    affordability: row.affordability as Affordability,
  };
}

export function parseMealPlanJson(value: Json | null): DailyDietPlan | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as unknown as DailyDietPlan;
}

export async function fetchDietPlannerSnapshot(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DietPlannerSnapshot> {
  const [prefsResult, planResult] = await Promise.all([
    supabase
      .from("user_diet_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<UserDietPreferencesRow>(),
    supabase
      .from("generated_diet_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<GeneratedDietPlanRow>(),
  ]);

  if (prefsResult.error) throw prefsResult.error;
  if (planResult.error) throw planResult.error;

  return {
    preferences: prefsResult.data ? mapPreferencesRow(prefsResult.data) : null,
    plan: planResult.data ? parseMealPlanJson(planResult.data.meal_plan) : null,
    planSource: planResult.data?.source ?? null,
  };
}

export async function upsertUserDietPreferences(
  supabase: SupabaseClient<Database>,
  args: {
    userId: string;
    goal: DietGoal;
    preferredFoods: PreferredFoodKey[];
    dietFilter: DietFilter;
    indianFoodPriority: boolean;
    affordability: Affordability;
  },
) {
  const { error } = await supabase.from("user_diet_preferences").upsert({
    user_id: args.userId,
    goal: args.goal,
    preferred_foods: args.preferredFoods,
    diet_filter: args.dietFilter,
    indian_food_priority: args.indianFoodPriority,
    affordability: args.affordability,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function insertGeneratedDietPlan(
  supabase: SupabaseClient<Database>,
  args: {
    userId: string;
    plan: DailyDietPlan;
    source: "ai" | "fallback";
  },
) {
  const { error } = await supabase.from("generated_diet_plans").insert({
    user_id: args.userId,
    meal_plan: args.plan as unknown as Json,
    source: args.source,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}
