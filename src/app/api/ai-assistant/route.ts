import { NextRequest } from "next/server";
import { buildNutritionTargets } from "@/lib/meal-recommendations/nutrition-from-metrics";
import { contextFromMetrics } from "@/lib/ai-assistant/context-from-metrics";
import type { Database } from "@/lib/supabase/types";
import { createClient } from "@/utils/supabase/server";

type ChatRole = "user" | "assistant" | "system";
type ChatMessage = { role: ChatRole; content: string };
type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];
type FoodEntry = Database["public"]["Tables"]["food_entries"]["Row"];
type ProgressLog = Database["public"]["Tables"]["daily_progress_logs"]["Row"];
type HealthNotesRow = {
  acne: string | null;
  migraine: string | null;
  knee_pain: string | null;
  hair_fall: string | null;
};

const MAX_MESSAGES_PER_HOUR = 20;
const MAX_PROMPT_CHARS = 1200;

function getOpenRouterModel() {
  const model = process.env.OPENROUTER_MODEL?.trim();
  if (!model) {
    throw new Error("OPENROUTER_MODEL is not configured.");
  }
  if (model !== "openrouter/free" && !model.endsWith(":free")) {
    throw new Error("OPENROUTER_MODEL must be a free OpenRouter model.");
  }
  return model;
}

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysAgoKey(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function recentFoodSummary(entries: FoodEntry[]) {
  const today = todayKey();
  const todayEntries = entries.filter((entry) => entry.logged_on === today);
  const totalCalories = todayEntries.reduce((sum, entry) => sum + entry.calories, 0);
  const totalProtein = todayEntries.reduce(
    (sum, entry) => sum + Number(entry.protein_g),
    0,
  );
  const lines = todayEntries.slice(0, 12).map(
    (entry) =>
      `${entry.meal_type}: ${entry.food_name} (${entry.quantity}, ${entry.calories} kcal, ${entry.protein_g}g protein)`,
  );

  return {
    totalCalories,
    totalProtein: Math.round(totalProtein * 10) / 10,
    lines,
  };
}

function buildContext(args: {
  metrics: MetricsRow | null;
  notes: HealthNotesRow | null;
  foodEntries: FoodEntry[];
  progressLogs: ProgressLog[];
}) {
  const targets = buildNutritionTargets(args.metrics);
  const food = recentFoodSummary(args.foodEntries);
  const latestProgress = args.progressLogs[0] ?? null;

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
    `Hydration/progress: ${JSON.stringify({
      latestDate: latestProgress?.logged_on ?? null,
      waterMl: latestProgress?.water_ml ?? 0,
      snapshotWeightKg: latestProgress?.weight_kg ?? null,
      snapshotBmi: latestProgress?.bmi ?? null,
    })}`,
    `Health notes: ${JSON.stringify(args.notes ?? {})}`,
  ].join("\n");
}

function systemPrompt(context: string) {
  return [
    "You are a careful AI nutrition assistant inside AI Diet Planner Pro.",
    "Use the provided user context to answer nutrition, hydration, food logging, wellness, and fitness-fueling questions.",
    "Safety rules:",
    "- Do not diagnose, treat, or claim to cure any medical condition.",
    "- Do not recommend dangerous restriction, dehydration, purging, extreme fasting, unsafe supplements, or medication changes.",
    "- For diabetes, migraines, hair loss, acne, pain, pregnancy, eating disorders, or disease-specific advice, encourage the user to work with a qualified clinician.",
    "- Keep answers practical and concise: 2-5 short paragraphs or bullets.",
    "- Include a short wellness disclaimer at the end of every response.",
    "- If data is missing, say what is missing and give safe general guidance.",
    context,
  ].join("\n\n");
}

async function enforceRateLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const now = new Date();
  const { data } = await supabase
    .from("ai_assistant_rate_limits")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    await supabase.from("ai_assistant_rate_limits").insert({
      user_id: userId,
      window_start: now.toISOString(),
      message_count: 1,
    });
    return null;
  }

  const windowStart = new Date(data.window_start);
  const elapsedMs = now.getTime() - windowStart.getTime();
  if (elapsedMs >= 60 * 60 * 1000) {
    await supabase
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

  await supabase
    .from("ai_assistant_rate_limits")
    .update({ message_count: data.message_count + 1 })
    .eq("user_id", userId);
  return null;
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
      max_completion_tokens: 650,
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
      return Response.json({ error: rateLimitError }, { status: 429 });
    }

    const since = daysAgoKey(13);
    const [{ data: metrics }, { data: notes }, { data: foods }, { data: progress }] =
      await Promise.all([
        supabase
          .from("user_metrics")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle<MetricsRow>(),
        supabase
          .from("health_condition_notes")
          .select("acne, migraine, knee_pain, hair_fall")
          .eq("user_id", user.id)
          .maybeSingle<HealthNotesRow>(),
        supabase
          .from("food_entries")
          .select("*")
          .eq("user_id", user.id)
          .gte("logged_on", since)
          .order("logged_on", { ascending: false }),
        supabase
          .from("daily_progress_logs")
          .select("*")
          .eq("user_id", user.id)
          .gte("logged_on", since)
          .order("logged_on", { ascending: false }),
      ]);

    const model = getOpenRouterModel();
    // Build a concise context for the AI using the fetched data
    const context = buildContext({
      metrics: metrics ?? null,
      notes,
      foodEntries: foods ?? [],
      progressLogs: progress ?? [],
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

    await supabase.from("ai_assistant_messages").insert({
      user_id: user.id,
      role: "user",
      content: userMessage,
      model,
    });

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
            await supabase.from("ai_assistant_messages").insert({
              user_id: user.id,
              role: "assistant",
              content: assistantText,
              model,
            });
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
