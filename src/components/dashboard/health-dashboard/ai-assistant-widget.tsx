"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  Droplets,
  Flame,
  HeartPulse,
  Scale,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase/types";
import { createClient } from "@/utils/supabase/client";

type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];

type HealthNotesRow = {
  user_id: string;
  acne: string | null;
  migraine: string | null;
  knee_pain: string | null;
  hair_fall: string | null;
};

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function round(n: number, digits = 0) {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

function activityMultiplier(level: MetricsRow["activity_level"]) {
  switch (level) {
    case "sedentary":
      return 1.2;
    case "light":
      return 1.375;
    case "moderate":
      return 1.55;
    case "active":
      return 1.725;
    case "very_active":
      return 1.9;
    default:
      return 1.55;
  }
}

function goalCaloriesDelta(goal: MetricsRow["goal"]) {
  switch (goal) {
    case "bulking":
    case "lean_bulk":
    case "muscle_building":
    case "weight_gain":
      return 300;
    case "cutting":
    case "fat_loss":
    case "weight_loss":
      return -300;
    default:
      return 0;
  }
}

function genderFactor(gender: MetricsRow["gender"]) {
  switch (gender) {
    case "female":
      return -161;
    case "male":
    default:
      return 5;
  }
}

function bmiKgM2(weightKg: number, heightCm: number) {
  const hM = heightCm / 100;
  if (hM <= 0) return null;
  return weightKg / (hM * hM);
}

function dailyCalories(args: {
  age: number;
  gender: MetricsRow["gender"];
  heightCm: number;
  weightKg: number;
  activityLevel: MetricsRow["activity_level"];
  goal: MetricsRow["goal"];
}) {
  const bmr =
    10 * args.weightKg +
    6.25 * args.heightCm -
    5 * args.age +
    genderFactor(args.gender);
  const tdee = bmr * activityMultiplier(args.activityLevel);
  const delta = goalCaloriesDelta(args.goal);
  return Math.max(1200, Math.round(tdee + delta));
}

function proteinPerKg(goal: MetricsRow["goal"]): number {
  switch (goal) {
    case "muscle_building":
    case "lean_bulk":
    case "bulking":
      return 1.6;
    case "fat_loss":
    case "cutting":
    case "weight_loss":
      return 1.8;
    case "strength_training":
      return 1.5;
    default:
      return 1.2;
  }
}

function proteinTargetGrams(weightKg: number, goal: MetricsRow["goal"]) {
  return Math.round(weightKg * proteinPerKg(goal));
}

function waterIntakeMlTarget(weightKg: number) {
  return Math.round(clamp(weightKg * 35, 1500, 4500));
}

function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "underweight range";
  if (bmi < 25) return "healthy weight range for many adults";
  if (bmi < 30) return "overweight range";
  return "obesity range";
}

function goalLabel(goal: MetricsRow["goal"]): string {
  switch (goal) {
    case "bulking":
    case "lean_bulk":
    case "muscle_building":
    case "weight_gain":
      return "muscle gain / surplus";
    case "cutting":
    case "fat_loss":
    case "weight_loss":
      return "fat loss / deficit";
    case "diabetic_diet":
      return "diabetes-aware eating";
    case "strength_training":
      return "strength performance";
    case "maintenance":
    case "maintenance_diet":
    case "healthy_lifestyle":
      return "maintenance / healthy lifestyle";
    default:
      return "your selected goal";
  }
}

function activityLabel(level: MetricsRow["activity_level"]): string {
  switch (level) {
    case "sedentary":
      return "sedentary";
    case "light":
      return "lightly active";
    case "moderate":
      return "moderately active";
    case "active":
      return "active";
    case "very_active":
      return "very active";
    default:
      return "moderately active (default)";
  }
}

function noteHasContent(s: string | null | undefined) {
  return typeof s === "string" && s.trim().length > 0;
}

type RecCard = {
  id: string;
  title: string;
  body: string;
  icon: "flame" | "droplets" | "scale" | "activity" | "heart" | "bot";
};

function CardIcon({ kind }: { kind: RecCard["icon"] }) {
  const cls = "h-4 w-4 shrink-0 text-brand-neon";
  switch (kind) {
    case "flame":
      return <Flame className={cls} aria-hidden />;
    case "droplets":
      return <Droplets className={cls} aria-hidden />;
    case "scale":
      return <Scale className={cls} aria-hidden />;
    case "activity":
      return <Activity className={cls} aria-hidden />;
    case "heart":
      return <HeartPulse className={cls} aria-hidden />;
    default:
      return <Bot className={cls} aria-hidden />;
  }
}

function buildRecommendationCards(
  metrics: MetricsRow | null,
  notes: HealthNotesRow | null,
): { summary: string; cards: RecCard[] } {
  if (!metrics) {
    return {
      summary:
        "Complete onboarding and save your metrics to unlock personalized nutrition guidance derived from your profile.",
      cards: [
        {
          id: "setup",
          title: "Finish your profile",
          body: "Height, weight, age, goal, and activity unlock calorie, protein, and hydration estimates—no external services required.",
          icon: "bot",
        },
      ],
    };
  }

  const heightCm = metrics.height ?? null;
  const weightKg = metrics.weight ?? null;
  const age = metrics.age ?? null;
  const canFullCalc =
    heightCm != null &&
    weightKg != null &&
    age != null &&
    heightCm > 0 &&
    weightKg > 0 &&
    age > 0;

  const goal = metrics.goal ?? null;
  const activityLevel = metrics.activity_level ?? null;
  const gender = metrics.gender ?? null;

  let calories: number | null = null;
  let bmi: number | null = null;
  if (canFullCalc && heightCm != null && weightKg != null && age != null) {
    bmi = bmiKgM2(weightKg, heightCm);
    calories = dailyCalories({
      age,
      gender,
      heightCm,
      weightKg,
      activityLevel,
      goal,
    });
  }

  const proteinG =
    weightKg != null && weightKg > 0 && goal != null
      ? proteinTargetGrams(weightKg, goal)
      : null;
  const proteinGk = goal != null ? proteinPerKg(goal) : null;

  const waterMl =
    weightKg != null && weightKg > 0 ? waterIntakeMlTarget(weightKg) : null;

  const diet =
    metrics.diet_type === "veg"
      ? "vegetarian"
      : metrics.diet_type === "non_veg"
        ? "non-vegetarian"
        : "unspecified";

  const delta = goalCaloriesDelta(goal);
  const calorieGuidance =
    delta > 0
      ? `Your goal applies a +${delta} kcal/day adjustment on top of estimated maintenance for controlled surplus.`
      : delta < 0
        ? `Your goal applies a ${delta} kcal/day adjustment for a moderate deficit—pair with adequate protein.`
        : "Your goal keeps calories close to estimated maintenance before fine-tuning meals.";

  const parts: string[] = [];
  if (goal) parts.push(goalLabel(goal));
  parts.push(`${diet} diet pattern`);
  if (activityLevel) parts.push(`${activityLabel(activityLevel)} day-to-day movement`);
  const summary =
    parts.length > 0
      ? `Based on your saved profile (${parts.join("; ")}), here is an on-device readout of your nutrition signals.`
      : "Here is an on-device readout using your saved profile fields.";

  const cards: RecCard[] = [];

  cards.push({
    id: "summary",
    title: "Nutrition snapshot",
    body: canFullCalc
      ? `Estimated daily calories around ${calories} kcal (Mifflin–St Jeor × activity + goal tweak, minimum floor applied). Protein ~${proteinG ?? "—"} g and fluids ~${waterMl ?? "—"} ml scale with your weight and goal.`
      : `Add consistent height, weight, and age to compute calories and BMI. You can still review protein and fluids when weight is present (${weightKg != null && weightKg > 0 ? `${weightKg} kg logged` : "weight missing"}).`,
    icon: "bot",
  });

  cards.push({
    id: "calories",
    title: "Goal-based calories",
    body: canFullCalc
      ? `${calorieGuidance} Current estimate: ${calories} kcal/day using your activity multiplier for ${activityLabel(activityLevel)}.`
      : "Calorie guidance needs height, weight, and age. Once added, we anchor maintenance then apply your goal’s calorie delta.",
    icon: "flame",
  });

  cards.push({
    id: "protein",
    title: "Protein strategy",
    body:
      proteinG != null && proteinGk != null
        ? `Targeting ~${proteinG} g/day (~${proteinGk} g per kg body weight) aligned with "${goalLabel(goal)}". Higher protein supports satiety during deficits and recovery during training-focused goals.`
        : "Log your weight and goal to estimate a protein range tied to training and fat-loss priorities.",
    icon: "flame",
  });

  cards.push({
    id: "hydration",
    title: "Hydration approach",
    body:
      waterMl != null
        ? `Aim near ${waterMl} ml/day from the 35 ml/kg heuristic (bounded for practicality). Spread intake through the day and add more during heat or intense sessions.`
        : "Weight-based hydration targets appear once body weight is saved.",
    icon: "droplets",
  });

  cards.push({
    id: "bmi",
    title: "BMI interpretation",
    body:
      bmi != null
        ? `BMI ~${round(bmi, 1)} (${bmiCategory(bmi)}). BMI is a screening metric—not diagnostic—and works best alongside waist trends, training load, and how you feel.`
        : "BMI calculates when height and weight are available.",
    icon: "scale",
  });

  cards.push({
    id: "activity",
    title: "Activity insights",
    body: (() => {
      switch (activityLevel) {
        case "sedentary":
          return "Low baseline movement: short walks, mobility snacks, and consistent meal timing often improve energy and appetite cues.";
        case "light":
          return "Light activity: great baseline—watch hydration as you add voluntary workouts.";
        case "moderate":
          return "Moderate activity: balance fueling around sessions; your calorie estimate already reflects this tier.";
        case "active":
          return "High weekly load: prioritize recovery nutrition—protein distribution and fluids matter most.";
        case "very_active":
          return "Very active: sweat losses rise—use the hydration target as a floor and adjust for climate.";
        default:
          return "Activity tier informs calorie estimates through standard multipliers; update if training volume shifts materially.";
      }
    })(),
    icon: "activity",
  });

  const conditionLines: string[] = [];

  if (metrics.allergies && metrics.allergies.length > 0) {
    conditionLines.push(
      `Allergies on file (${metrics.allergies.join(", ")}): prioritize ingredient checks and cross-contact when cooking or dining out.`,
    );
  }

  if (goal === "diabetic_diet") {
    conditionLines.push(
      "Diabetes-focused goal: favor steady meals with fiber-rich carbs and predictable timing—pair adjustments with your clinician’s guidance.",
    );
  }

  if (notes) {
    if (noteHasContent(notes.migraine)) {
      conditionLines.push(
        "Migraine notes detected: maintain regular hydration, sleep, and meal timing; identify personal dietary triggers you track in your journal.",
      );
    }
    if (noteHasContent(notes.acne)) {
      conditionLines.push(
        "Acne journaling active: consider glycemic load and dairy sensitivity experiments while keeping overall nutrient adequacy.",
      );
    }
    if (noteHasContent(notes.knee_pain)) {
      conditionLines.push(
        "Knee discomfort noted: anti-inflammatory food patterns (omega-3 rich foods, colorful plants) complement rehab work—not replace medical advice.",
      );
    }
    if (noteHasContent(notes.hair_fall)) {
      conditionLines.push(
        "Hair shedding notes present: ensure protein meets targets and review iron/B12 status with a clinician if symptoms persist.",
      );
    }
  }

  if (conditionLines.length > 0) {
    cards.push({
      id: "conditions",
      title: "Health-aware tips",
      body: conditionLines.join(" "),
      icon: "heart",
    });
  }

  return { summary, cards };
}

function matchAssistantReply(
  userMsg: string,
  summary: string,
  cards: RecCard[],
): string {
  const q = userMsg.toLowerCase();

  const pick = (id: string) => cards.find((c) => c.id === id)?.body;

  if (/calorie|kcal|energy|tdee|deficit|surplus/.test(q)) {
    return pick("calories") ?? summary;
  }
  if (/protein|muscle|recovery/.test(q)) {
    return pick("protein") ?? summary;
  }
  if (/water|hydration|fluid|drink/.test(q)) {
    return pick("hydration") ?? summary;
  }
  if (/bmi|weight status/.test(q)) {
    return pick("bmi") ?? summary;
  }
  if (/activity|steps|training|exercise|cardio/.test(q)) {
    return pick("activity") ?? summary;
  }
  if (/allergy|migraine|acne|knee|hair|condition|health/.test(q)) {
    return pick("conditions") ?? summary;
  }

  return `${summary}\n\nTip: mention calories, protein, water, BMI, activity, or health notes for a focused paragraph pulled from your saved data.`;
}

const ASSISTANT_WELCOME_READY =
  "Ask a question below—answers map to your cards using saved metrics (local rules, no external AI).";

const ASSISTANT_WELCOME_ERROR =
  "Could not load your metrics yet. Refresh the page after checking your connection.";

export function AIAssistantWidget() {
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [metrics, setMetrics] = useState<MetricsRow | null>(null);
  const [healthNotes, setHealthNotes] = useState<HealthNotesRow | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoadState("loading");
        setLoadError(null);
        const supabase = createClient();
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        if (!user) throw new Error("Not authenticated");

        const [{ data: m, error: mErr }, { data: n, error: nErr }] =
          await Promise.all([
            supabase
              .from("user_metrics")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle<MetricsRow>(),
            supabase
              .from("health_condition_notes")
              .select("user_id, acne, migraine, knee_pain, hair_fall")
              .eq("user_id", user.id)
              .maybeSingle<HealthNotesRow>(),
          ]);

        if (mErr) throw mErr;
        if (nErr) throw nErr;
        if (cancelled) return;
        setMetrics(m ?? null);
        setHealthNotes(n ?? null);
        setLoadState("ready");
        setMessages([{ role: "assistant", content: ASSISTANT_WELCOME_READY }]);
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load profile");
        setLoadState("error");
        setMetrics(null);
        setHealthNotes(null);
        setMessages([{ role: "assistant", content: ASSISTANT_WELCOME_ERROR }]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const { summary, cards } = useMemo(
    () => buildRecommendationCards(metrics, healthNotes),
    [metrics, healthNotes],
  );

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);

  const handleSend = useCallback(() => {
    if (!canSend) return;
    const userMsg = draft.trim();
    setDraft("");
    const reply = matchAssistantReply(userMsg, summary, cards);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg },
      { role: "assistant", content: reply },
    ]);
  }, [canSend, draft, summary, cards]);

  return (
    <section className="glass rounded-lg border border-white/[0.08] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
                Smart assistant
              </p>
              <h3 className="mt-2 text-lg font-black text-white">
                Profile-based guidance
              </h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/52">
            Recommendations are computed on-device from your saved metrics—no
            external AI calls.
          </p>
        </div>

        <Button
          variant="ghost"
          className="h-10 shrink-0 self-start px-3 sm:self-auto"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <Sparkles className="h-4 w-4" />
          {open ? "Collapse" : "Expand"}
        </Button>
      </div>

      {open ? (
        <div className="mt-5 space-y-5">
          {loadState === "loading" ? (
            <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-white/[0.07] bg-white/[0.03] p-4"
                >
                  <div className="h-3 w-24 rounded bg-white/[0.08]" />
                  <div className="mt-3 h-3 w-full rounded bg-white/[0.06]" />
                  <div className="mt-2 h-3 w-[80%] rounded bg-white/[0.05]" />
                </div>
              ))}
            </div>
          ) : loadState === "error" ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200/90">
              {loadError ?? "Something went wrong loading recommendations."}
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-white/70">{summary}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                {cards.map((c) => (
                  <article
                    key={c.id}
                    className="flex flex-col rounded-lg border border-white/[0.07] bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start gap-2">
                      <CardIcon kind={c.icon} />
                      <h4 className="text-sm font-black leading-snug text-white">
                        {c.title}
                      </h4>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-white/45">
                      {c.body}
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}

          <div className="max-h-52 overflow-auto rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 sm:max-h-64">
            <div className="space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={`${m.role}-${idx}`}
                  className={
                    m.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[92%] whitespace-pre-wrap rounded-lg bg-brand-neon/12 px-3 py-2 text-sm font-semibold text-white sm:max-w-[85%]"
                        : "max-w-[92%] whitespace-pre-wrap rounded-lg bg-white/[0.06] px-3 py-2 text-sm text-white/70 sm:max-w-[85%]"
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about calories, protein, hydration, BMI, activity…"
                rows={2}
                className="min-h-[44px] w-full resize-none rounded-lg border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white placeholder:text-white/30 shadow-inner shadow-black/20 focus:outline-none focus:ring-2 focus:ring-brand-neon/30"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!canSend || loadState !== "ready"}
              type="button"
              className="h-12 w-full shrink-0 sm:w-auto"
            >
              Send
            </Button>
          </div>

          <p className="text-xs text-white/32">
            Answers keyword-match your question to sections above—everything
            stays local to your session.
          </p>
        </div>
      ) : null}
    </section>
  );
}
