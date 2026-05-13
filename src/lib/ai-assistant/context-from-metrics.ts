/**
 * Helper utilities to extract a concise context string from user metrics.
 * This module is used by the AI assistant API route to build the system prompt.
 */
import type { Database } from '@/lib/supabase/types';

type MetricsRow = Database['public']['Tables']['user_metrics']['Row'];

/**
 * Convert a MetricsRow into a plain object containing only the fields that are
 * relevant for the AI assistant. Undefined values are omitted so the context
 * string stays compact.
 */
export function contextFromMetrics(metrics: MetricsRow | null) {
  if (!metrics) return {};
  const {
    age,
    gender,
    height,
    weight,
    goal,
    activity_level,
    diet_type,
    allergies,
    food_preferences,
    training_preference,
  } = metrics;
  return {
    age: age ?? null,
    gender: gender ?? null,
    heightCm: height ?? null,
    weightKg: weight ?? null,
    goal: goal ?? null,
    activityLevel: activity_level ?? null,
    dietType: diet_type ?? null,
    allergies: allergies ?? [],
    foodPreferences: food_preferences ?? [],
    trainingPreference: training_preference ?? null,
  };
}
