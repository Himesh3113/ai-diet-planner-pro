import { NextRequest } from "next/server";
import { buildNutritionTargets } from "@/lib/meal-recommendations/nutrition-from-metrics";
import {
  AFFORDABILITY_OPTIONS,
  DIET_GOALS,
  PREFERRED_FOODS,
  type Affordability,
  type DietFilter,
  type DietGoal,
  type PreferredFoodKey,
  PREFERRED_FOOD_KEY_SET,
} from "@/lib/diet-planner/constants";
import { balancePlanToTargets } from "@/lib/diet-planner/balance-plan";
import { buildFallbackDietPlan } from "@/lib/diet-planner/fallback-plan";
import { formatFoodContextForAi } from "@/lib/diet-planner/meal-engine";
import { parseDailyDietPlan } from "@/lib/diet-planner/parse-plan";
import type { DailyDietPlan } from "@/lib/diet-planner/types";
import {
  insertGeneratedDietPlan,
  upsertUserDietPreferences,
} from "@/lib/diet-planner/db";
import { buildWellnessDietContext } from "@/lib/wellness/diet-adaptations";
import { fetchUserWellnessConditions } from "@/lib/wellness/db";
import type { Database } from "@/lib/supabase/types";
import { createClient } from "@/utils/supabase/server";

type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];

const VALID_GOALS = new Set(DIET_GOALS.map((g) => g.value));
const VALID_FOODS = PREFERRED_FOOD_KEY_SET;
const VALID_AFFORDABILITY = new Set(AFFORDABILITY_OPTIONS.map((a) => a.value));

function getOpenRouterModel() {
  const model = process.env.OPENROUTER_MODEL?.trim();
  if (!model) return null;
  if (model !== "openrouter/free" && !model.endsWith(":free")) return null;
  return model;
}

function buildPrompt(args: {
  goal: DietGoal;
  foods: PreferredFoodKey[];
  dietFilter: DietFilter;
  indianPriority: boolean;
  affordability: Affordability;
  targets: ReturnType<typeof buildNutritionTargets>;
  wellnessLines: string[];
}) {
  const foodLabels = args.foods
    .map((k) => PREFERRED_FOODS.find((f) => f.key === k)?.label ?? k)
    .join(", ");

  const foodContext = formatFoodContextForAi(
    args.foods,
    args.affordability,
    args.dietFilter,
  );

  const proteinSplit =
    "Distribute protein: breakfast ~25%, lunch ~35%, dinner ~30%, snacks ~10%. Use realistic Indian portions.";

  return [
    "Generate a realistic ONE-DAY Indian meal plan as strict JSON only. No markdown.",
    `Goal: ${args.goal}`,
    `User-selected food keys (use ONLY these foods): ${foodLabels}`,
    `Diet filter: ${args.dietFilter === "veg" ? "vegetarian only" : "non-vegetarian allowed"}`,
    `Indian food priority: ${args.indianPriority ? "yes — South/North Indian meals, regional portions" : "standard"}`,
    `Affordability: ${args.affordability} — ${args.affordability === "budget" ? "prioritize budget staples (dal, rice, idli, eggs, poha)" : args.affordability === "flexible" ? "premium options OK" : "balanced cost"}`,
    `Daily calorie target ~${args.targets.dailyCalories} kcal, protein ~${args.targets.dailyProteinG}g.`,
    proteinSplit,
    "",
    "Food database (macros per serving):",
    ...foodContext,
    ...(args.wellnessLines.length > 0 ? ["", ...args.wellnessLines] : []),
    "",
    "Return exactly this JSON shape:",
    JSON.stringify({
      breakfast: {
        items: [{ name: "string", portion: "string" }],
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      },
      lunch: { items: [], calories: 0, protein: 0, carbs: 0, fats: 0 },
      dinner: { items: [], calories: 0, protein: 0, carbs: 0, fats: 0 },
      snacks: { items: [], calories: 0, protein: 0, carbs: 0, fats: 0 },
      dailyTotals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
      notes: "one short coaching sentence",
    }),
  ].join("\n");
}

async function callOpenRouter(prompt: string, model: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "AI Diet Planner Pro",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert Indian nutrition coach. Reply with valid JSON only. Never include foods not in the user's allowed list. Respect wellness avoid-list strictly. Use realistic Indian portions and accurate macro estimates.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.35,
      max_completion_tokens: 900,
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? null;
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

    const { data: metrics } = await supabase
      .from("user_metrics")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle<MetricsRow>();

    const metricsForTargets = metrics ? { ...metrics, goal } : null;
    const targets = buildNutritionTargets(metricsForTargets);

    const wellnessRows = await fetchUserWellnessConditions(supabase, user.id);
    const wellnessLines = buildWellnessDietContext(wellnessRows);

    const prompt = buildPrompt({
      goal,
      foods: preferredFoods,
      dietFilter,
      indianPriority: indianFoodPriority,
      affordability,
      targets,
      wellnessLines,
    });

    let plan: DailyDietPlan | null = null;
    let source: "ai" | "fallback" = "fallback";

    const model = getOpenRouterModel();
    if (model) {
      const aiText = await callOpenRouter(prompt, model);
      if (aiText) {
        plan = parseDailyDietPlan(aiText);
        if (plan) source = "ai";
      }
    }

    if (!plan) {
      plan = buildFallbackDietPlan(preferredFoods, goal, {
        dietFilter,
        affordability,
      });
      source = "fallback";
    }

    plan = balancePlanToTargets(
      plan,
      targets.dailyCalories ?? 2200,
      targets.dailyProteinG ?? 120,
    );

    await upsertUserDietPreferences(supabase, {
      userId: user.id,
      goal,
      preferredFoods,
      dietFilter,
      indianFoodPriority,
      affordability,
    });

    await insertGeneratedDietPlan(supabase, {
      userId: user.id,
      plan,
      source,
    });

    return Response.json({ plan, source });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate diet plan.";
    const isMissingTable =
      message.includes("user_diet_preferences") ||
      message.includes("generated_diet_plans") ||
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
