import { NextRequest } from "next/server";
import { buildNutritionTargets } from "@/lib/meal-recommendations/nutrition-from-metrics";
import { WELLNESS_CATALOG_BY_KEY } from "@/lib/wellness/catalog";
import type { Database } from "@/lib/supabase/types";
import { createClient } from "@/utils/supabase/server";

type ChatRole = "user" | "assistant" | "system";
type ChatMessage = { role: ChatRole; content: string };

// Types for database rows
type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];
type FoodEntry = Database["public"]["Tables"]["food_logs"]["Row"];
type HydrationLog = Database["public"]["Tables"]["hydration_logs"]["Row"];
type HealthNote = Database["public"]["Tables"]["health_notes"]["Row"];

const MAX_MESSAGES_PER_HOUR = 20;
const MAX_PROMPT_CHARS = 1200;

function getOpenRouterModel() {
  const model = process.env.OPENROUTER_MODEL?.trim();
  if (!model) {
    throw new Error("OPENROUTER_MODEL is not configured.");
  }
  return model;
}

// Helper to get today's date key (YYYY-MM-DD)
function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysAgoKey(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Summarize recent food entries for the context
function recentFoodSummary(entries: FoodEntry[]) {
  const today = todayKey();
  const todayEntries = entries.filter((e) => e.logged_on === today);
  const totalCalories = todayEntries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = todayEntries.reduce((sum, e) => sum + Number(e.protein_g), 0);
  const lines = todayEntries.slice(0, 12).map(
    (e) => `${e.meal_type}: ${e.food_name} (${e.quantity}, ${e.calories} kcal, ${e.protein_g}g protein)`,
  );
  return { totalCalories, totalProtein: Math.round(totalProtein * 10) / 10, lines };
}

// Helper to build a concise context string for the AI assistant
type WellnessRow = Database["public"]["Tables"]["wellness_conditions"]["Row"];

function buildContext(args: {
  metrics: MetricsRow | null;
  notes: HealthNote[];
  wellness: WellnessRow[];
  foodEntries: FoodEntry[];
  hydrationLogs: HydrationLog[];
}) {
  const targets = buildNutritionTargets(args.metrics);
  const food = recentFoodSummary(args.foodEntries);
  const todayHydration = args.hydrationLogs.find((log) => log.logged_on === todayKey());
  const notesByCondition = Object.fromEntries(
    args.notes.map((note) => [note.condition_key, note.note]),
  );

  return [
    "USER CONTEXT",
    `Metrics: ${JSON.stringify({
      age: args.metrics?.age ?? null,
      gender: args.metrics?.gender ?? null,
      heightCm: args.metrics?.height ?? null,
      weightKg: args.metrics?.weight ?? null,
      goal: args.metrics?.goal ?? null,
      activityLevel: args.metrics?.activity_level ?? null,
      dietType: args.metrics?.diet_type ?? null,
      allergies: args.metrics?.allergies ?? [],
      foodPreferences: args.metrics?.food_preferences ?? [],
      trainingPreference: args.metrics?.training_preference ?? null,
    })}`,
    `Nutrition targets: ${JSON.stringify({
      dailyCalories: targets.dailyCalories,
      dailyProteinG: targets.dailyProteinG,
      hydrationMl: targets.hydrationMl,
      bmi: targets.bmi != null ? Math.round(targets.bmi * 10) / 10 : null,
    })}`,
    `Today's food totals: ${food.totalCalories} kcal, ${food.totalProtein}g protein.`,
    `Today's food entries: ${food.lines.length ? food.lines.join("; ") : "none logged yet"}.`,
    `Hydration logs: ${JSON.stringify({
      todayWaterMl: todayHydration?.water_ml ?? 0,
      recentTrackedDays: args.hydrationLogs.map((log) => ({
        date: log.logged_on,
        waterMl: log.water_ml,
      })),
    })}`,
    `Health notes: ${JSON.stringify(notesByCondition)}`,
    `Wellness Hub (active conditions): ${JSON.stringify(
      args.wellness
        .filter((w) => w.status !== "recovered")
        .map((w) => ({
          key: w.condition_key,
          title: WELLNESS_CATALOG_BY_KEY[w.condition_key]?.title ?? w.condition_key,
          status: w.status,
          severity: w.severity,
          symptoms: w.symptoms,
        })),
    )}`,
  ].join("\n");
}

// System prompt wrapper for the AI assistant
function systemPrompt(context: string) {
  return [
    "You are a premium AI nutrition assistant inside AI Diet Planner Pro.",
    "Use the provided user context to answer nutrition, hydration, food logging, wellness, and fitness-fueling questions with practical daily food guidance.",
    "Answer style:",
    "- Be concise: normally 4-7 bullets total, no long essays.",
    "- Recommend only the 3-5 most useful foods or actions for the question.",
    "- For each food recommendation, include a short 'why it helps' reason tied to protein, fiber, glycemic load, minerals, hydration, inflammation, sleep, or recovery.",
    "- Include 'prefer' and 'avoid/limit' only when useful; avoid giant food lists.",
    "- Use everyday foods a normal person can actually eat today.",
    "- If the user's food log is available, reference the calorie/protein gap directly.",
    "Safety rules:",
    "- Do not diagnose, treat, or claim to cure any medical condition.",
    "- Do not recommend dangerous restriction, dehydration, purging, extreme fasting, unsafe supplements, or medication changes.",
    "- For diabetes, migraines, hair loss, acne, pain, pregnancy, eating disorders, or disease-specific advice, encourage the user to work with a qualified clinician.",
    "- End with one short medical safety line only when the topic is disease-specific or symptoms are persistent/severe.",
    "- If data is missing, say what is missing and give safe general guidance.",
    context,
  ].join("\n\n");
}

async function enforceRateLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const now = new Date();
    const { data } = await db
      .from("ai_assistant_rate_limits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) {
      await db.from("ai_assistant_rate_limits").insert({
        user_id: userId,
        window_start: now.toISOString(),
        message_count: 1,
      });
      return null;
    }

    const windowStart = new Date(data.window_start as string);
    const elapsedMs = now.getTime() - windowStart.getTime();
    if (elapsedMs >= 60 * 60 * 1000) {
      await db
        .from("ai_assistant_rate_limits")
        .update({ window_start: now.toISOString(), message_count: 1 })
        .eq("user_id", userId);
      return null;
    }

    if (data.message_count >= MAX_MESSAGES_PER_HOUR) {
      const retryAt = new Date(windowStart.getTime() + 60 * 60 * 1000);
      return `Rate limit reached. Try again after ${retryAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}.`;
    }

    await db
      .from("ai_assistant_rate_limits")
      .update({ message_count: data.message_count + 1 })
      .eq("user_id", userId);
    return null;
  } catch {
    return "Assistant is temporarily unavailable. Please try again in a minute.";
  }
}

async function openRouterStream(messages: ChatMessage[], model: string, attempt = 0) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

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
      messages,
      stream: true,
      temperature: 0.4,
      max_completion_tokens: 420,
    }),
  });

  if (!response.ok || !response.body) {
    const retryable = response.status === 429 || response.status >= 500;
    if (retryable && attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 900));
      return openRouterStream(messages, model, 1);
    }
    const details = await response.text().catch(() => "");
    throw new Error(
      `OpenRouter request failed (${response.status})${details ? `: ${details.slice(0, 180)}` : ""}`,
    );
  }

  return response;
}

function parseOpenRouterChunk(raw: string) {
  const lines = raw.split("\n");
  const textParts: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const parsed = JSON.parse(payload) as {
        choices?: { delta?: { content?: string } }[];
      };
      const content = parsed.choices?.[0]?.delta?.content;
      if (content) textParts.push(content);
    } catch {
      // Ignore partial event lines; the stream transform buffers across chunks.
    }
  }
  return textParts.join("");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      message?: string;
      history?: { role: "user" | "assistant"; content: string }[];
    };

    const userMessage = body.message?.trim() ?? "";
    if (!userMessage || userMessage.length > MAX_PROMPT_CHARS) {
      return Response.json(
        { error: `Message must be between 1 and ${MAX_PROMPT_CHARS} characters.` },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) {
      return Response.json({ error: "Not authenticated." }, { status: 401 });
    }

    const rateLimitError = await enforceRateLimit(supabase, user.id);
    if (rateLimitError) {
      const status = rateLimitError.startsWith("Rate limit reached") ? 429 : 503;
      return Response.json({ error: rateLimitError }, { status });
    }

    const since = daysAgoKey(13);

    const { data: metrics, error: metricsErr } = await supabase
      .from("user_metrics")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle<MetricsRow>();

    if (metricsErr) {
      return Response.json(
        { error: metricsErr.message || "Could not load user metrics." },
        { status: 500 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { data: notesRaw, error: notesErr } = await db
      .from("health_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (notesErr) {
      console.error("AI assistant health notes database error", notesErr);
    }
    const notes: HealthNote[] = notesErr || !notesRaw ? [] : notesRaw;

    const { data: foodsRaw, error: foodsErr } = await db
      .from("food_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_on", since)
      .order("logged_on", { ascending: false });

    if (foodsErr) {
      console.error("AI assistant food logs database error", foodsErr);
    }

    const foods: FoodEntry[] =
      foodsErr || !foodsRaw
        ? []
        : (foodsRaw as FoodEntry[]).filter(
            (row) =>
              typeof row.logged_on === "string" &&
              typeof row.food_name === "string" &&
              typeof row.calories === "number",
          );

    const { data: hydrationRaw, error: hydrationErr } = await db
      .from("hydration_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_on", since)
      .order("logged_on", { ascending: false });

    if (hydrationErr) {
      console.error("AI assistant hydration logs database error", hydrationErr);
    }
    const hydrationLogs: HydrationLog[] =
      hydrationErr || !hydrationRaw
        ? []
        : (hydrationRaw as HydrationLog[]).filter(
            (row) => typeof row.logged_on === "string",
          );

    const { data: wellnessRaw } = await db
      .from("wellness_conditions")
      .select("*")
      .eq("user_id", user.id);
    const wellness: WellnessRow[] = wellnessRaw ?? [];

    const model = getOpenRouterModel();
    const context = buildContext({
      metrics: metrics ?? null,
      notes,
      wellness,
      foodEntries: foods ?? [],
      hydrationLogs,
    });

    const history = (body.history ?? [])
      .filter(
        (message) =>
          (message.role === "user" || message.role === "assistant") &&
          message.content.trim().length > 0,
      )
      .slice(-8);

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt(context) },
      ...history,
      { role: "user", content: userMessage },
    ];

    try {
      await db.from("ai_assistant_messages").insert({
        user_id: user.id,
        role: "user",
        content: userMessage,
        model,
      });
    } catch {
      // Optional table
    }

    const upstream = await openRouterStream(messages, model);
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";
    let assistantText = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split("\n\n");
            buffer = parts.pop() ?? "";
            for (const part of parts) {
              const text = parseOpenRouterChunk(part);
              if (!text) continue;
              assistantText += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          if (buffer) {
            const text = parseOpenRouterChunk(buffer);
            if (text) {
              assistantText += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          if (assistantText.trim()) {
            try {
              await db.from("ai_assistant_messages").insert({
                user_id: user.id,
                role: "assistant",
                content: assistantText,
                model,
              });
            } catch {
              // Optional table
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-OpenRouter-Model": model,
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Assistant request failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
