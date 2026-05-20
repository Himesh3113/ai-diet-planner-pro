import { NextRequest } from "next/server";
import {
  AFFORDABILITY_OPTIONS,
  DIET_GOALS,
  PREFERRED_FOODS,
  type Affordability,
  type DietFilter,
  type DietGoal,
  type PreferredFoodKey,
} from "@/lib/diet-planner/constants";
import {
  fetchDietPlannerSnapshot,
  upsertUserDietPreferences,
} from "@/lib/diet-planner/db";
import { createClient } from "@/utils/supabase/server";

const VALID_GOALS = new Set(DIET_GOALS.map((g) => g.value));
const VALID_FOODS = new Set(PREFERRED_FOODS.map((f) => f.key));
const VALID_AFFORDABILITY = new Set(AFFORDABILITY_OPTIONS.map((a) => a.value));

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return Response.json({ error: "Not authenticated." }, { status: 401 });
    }

    const snapshot = await fetchDietPlannerSnapshot(supabase, user.id);
    return Response.json(snapshot);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load diet planner data.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      goal?: string;
      preferredFoods?: string[];
      dietFilter?: string;
      indianFoodPriority?: boolean;
      affordability?: string;
    };

    const goal = body.goal as DietGoal;
    if (!goal || !VALID_GOALS.has(goal)) {
      return Response.json({ error: "Invalid diet goal." }, { status: 400 });
    }

    const preferredFoods = (body.preferredFoods ?? []).filter((f): f is PreferredFoodKey =>
      VALID_FOODS.has(f as PreferredFoodKey),
    );
    if (preferredFoods.length === 0) {
      return Response.json(
        { error: "Select at least one preferred food." },
        { status: 400 },
      );
    }

    const dietFilter: DietFilter =
      body.dietFilter === "non_veg" ? "non_veg" : "veg";
    const indianFoodPriority = body.indianFoodPriority !== false;
    const affordability = VALID_AFFORDABILITY.has(body.affordability as Affordability)
      ? (body.affordability as Affordability)
      : "moderate";

    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return Response.json({ error: "Not authenticated." }, { status: 401 });
    }

    await upsertUserDietPreferences(supabase, {
      userId: user.id,
      goal,
      preferredFoods,
      dietFilter,
      indianFoodPriority,
      affordability,
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save preferences.";
    const isMissingTable =
      message.includes("user_diet_preferences") ||
      message.includes("schema cache") ||
      message.includes("does not exist");

    return Response.json(
      {
        error: isMissingTable
          ? "Diet planner tables are missing. Apply supabase/migrations/20260520160000_diet_planner_tables.sql in Supabase."
          : message,
      },
      { status: 500 },
    );
  }
}
