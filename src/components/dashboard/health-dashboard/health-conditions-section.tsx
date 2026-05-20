"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronDown,
  Droplets,
  HeartPulse,
  Loader2,
  Salad,
  Save,
  Sparkles,
  Trash2,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  HEALTH_CONDITIONS,
  emptyConditionNotes,
  type HealthCondition,
  type HealthConditionKey,
} from "@/lib/health-conditions";
import type { Database } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

type HealthNote = Database["public"]["Tables"]["health_notes"]["Row"];
type Notes = Record<HealthConditionKey, string>;

type ConditionIntelligence = {
  nutrition: string;
  hydration: string;
  triggers: string[];
  meals: string[];
};

const CONDITION_INTELLIGENCE: Partial<Record<HealthConditionKey, ConditionIntelligence>> = {
  acne: {
    nutrition:
      "Keep meals lower glycemic: dal/chana, eggs/tofu, oats, vegetables, and nuts beat sugary snacks because they reduce insulin spikes that can worsen oil signaling.",
    hydration:
      "Aim for steady water across the day. Hydration will not cure acne, but it supports skin barrier function and helps prevent high-sugar drink replacement.",
    triggers: ["Sugary drinks", "Frequent sweets", "Deep-fried snacks", "Personal dairy flare-ups"],
    meals: ["Oats + walnuts + unsweetened curd", "Dal, roti, cucumber salad", "Egg/tofu bhurji with vegetables"],
  },
  hair_fall: {
    nutrition:
      "Protein is the anchor. Pair eggs/tofu/paneer with dal, spinach, pumpkin seeds, and curd to cover amino acids, iron, zinc, and B vitamins.",
    hydration:
      "Use hydration as a consistency cue: water with each protein meal helps appetite and training recovery, but persistent shedding needs labs.",
    triggers: ["Crash dieting", "Very low-protein days", "Skipping meals", "Unverified high-dose supplements"],
    meals: ["Eggs or tofu with roti and spinach", "Dal rice with curd", "Paneer/tofu bowl with pumpkin seeds"],
  },
  knee_pain: {
    nutrition:
      "Prioritize protein plus anti-inflammatory fats: dal/chicken/tofu, curd, leafy greens, citrus, turmeric, and fish/flaxseed support muscle and connective tissue.",
    hydration:
      "Hydration supports joint and training tolerance. Use water before walks or rehab sessions, especially in heat.",
    triggers: ["Training through sharp pain", "Rapid weight gain", "Frequent fried foods", "Excess alcohol"],
    meals: ["Dal, rice, greens, turmeric sabzi", "Curd bowl with flaxseed", "Fish/tofu with roti and citrus salad"],
  },
  migraine: {
    nutrition:
      "Regular meal timing matters. Use gentle carbs plus protein, such as curd rice, banana with nuts, oats, or eggs, to avoid fasting-triggered dips.",
    hydration:
      "Hydration is a migraine threshold lever. Spread fluids and electrolytes; avoid big caffeine swings.",
    triggers: ["Long fasting windows", "Dehydration", "Alcohol", "Excess caffeine swings", "Known aged-cheese triggers"],
    meals: ["Curd rice with cucumber", "Oats with banana and seeds", "Eggs/tofu with roti before long gaps"],
  },
};

function notesFromRows(rows: HealthNote[]): Notes {
  const next = emptyConditionNotes();
  for (const row of rows) {
    if (row.condition_key in next) {
      next[row.condition_key as HealthConditionKey] = row.note;
    }
  }
  return next;
}

function readiness(note: string, condition: HealthCondition) {
  let score = 55;
  if (note.trim()) score += 20;
  if (condition.bestFoods.length >= 5) score += 15;
  if (condition.avoid.length >= 4) score += 10;
  return Math.min(100, score);
}

function ConditionCard({
  condition,
  isActive,
  note,
  onSelect,
}: {
  condition: HealthCondition;
  isActive: boolean;
  note: string;
  onSelect: () => void;
}) {
  const score = readiness(note, condition);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "min-h-36 rounded-lg border p-4 text-left transition",
        isActive
          ? "border-brand-neon/45 bg-brand-neon/[0.08]"
          : "border-white/[0.07] bg-white/[0.03] hover:border-white/[0.16] hover:bg-white/[0.05]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-white">{condition.title}</p>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/48">
            {condition.summary}
          </p>
        </div>
        {note.trim() ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-neon" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-white/30" />
        )}
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-brand-neon transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] font-semibold text-white/34">
        {condition.bestFoods.length} foods · {score}% guidance ready
      </p>
    </button>
  );
}

function FoodReasonList({ condition }: { condition: HealthCondition }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {condition.bestFoods.slice(0, 6).map((food) => (
        <div
          key={food.name}
          className="rounded-lg border border-white/[0.07] bg-black/10 p-3"
        >
          <p className="text-sm font-black text-white/88">{food.name}</p>
          <p className="mt-1 text-xs leading-5 text-white/45">{food.why}</p>
        </div>
      ))}
    </div>
  );
}

function IntelligenceCards({
  condition,
}: {
  condition: HealthCondition;
}) {
  const intelligence = CONDITION_INTELLIGENCE[condition.key];
  if (!intelligence) return null;

  const cards = [
    { title: "Nutrition focus", body: intelligence.nutrition, icon: Salad, score: 92 },
    { title: "Hydration guidance", body: intelligence.hydration, icon: Droplets, score: 84 },
    {
      title: "Trigger warnings",
      body: intelligence.triggers.join(" · "),
      icon: AlertTriangle,
      score: 88,
    },
    { title: "Meal suggestions", body: intelligence.meals.join(" · "), icon: Utensils, score: 90 },
  ];

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <details
            key={card.title}
            className="group rounded-lg border border-white/[0.07] bg-black/10 p-4 open:bg-white/[0.035]"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-neon/10 text-brand-neon">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-white">{card.title}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-brand-neon"
                      style={{ width: `${card.score}%` }}
                    />
                  </div>
                </div>
              </div>
              <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-white/35 transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-xs leading-5 text-white/50">{card.body}</p>
          </details>
        );
      })}
    </div>
  );
}

export function HealthConditionsSection() {
  const { toast } = useToast();
  const [selectedKey, setSelectedKey] = useState<HealthConditionKey>(HEALTH_CONDITIONS[0].key);
  const [notes, setNotes] = useState<Notes>(() => emptyConditionNotes());
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [savingKey, setSavingKey] = useState<HealthConditionKey | null>(null);
  const [deletingKey, setDeletingKey] = useState<HealthConditionKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCondition = useMemo(
    () => HEALTH_CONDITIONS.find((condition) => condition.key === selectedKey) ?? HEALTH_CONDITIONS[0],
    [selectedKey],
  );

  const loadNotes = useCallback(async () => {
    try {
      setLoadState("loading");
      setError(null);
      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error("Sign in again to load health notes.");

      const { data, error: notesErr } = await supabase
        .from("health_notes")
        .select("*")
        .eq("user_id", user.id);

      if (notesErr) throw notesErr;
      setNotes(notesFromRows(data ?? []));
      setLoadState("ready");
    } catch (e) {
      console.error("Health notes load database error", e);
      const message = e instanceof Error ? e.message : "Health notes could not load.";
      setError(message);
      setLoadState("error");
      toast({
        title: "Health notes unavailable",
        description: "Notes could not load. Check health_notes migration and RLS policies.",
        variant: "error",
      });
    }
  }, [toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotes();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadNotes]);

  async function saveNote(conditionKey: HealthConditionKey) {
    try {
      setSavingKey(conditionKey);
      setError(null);
      const note = notes[conditionKey].trim();
      if (!note) {
        await deleteNote(conditionKey);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error("Sign in again to save health notes.");

      const { error: saveErr } = await supabase
        .from("health_notes")
        .upsert(
          {
            user_id: user.id,
            condition_key: conditionKey,
            note,
          },
          { onConflict: "user_id,condition_key" },
        );

      if (saveErr) throw saveErr;
      toast({
        title: "Health note saved",
        description: `${selectedCondition.title} context is now persisted.`,
        variant: "success",
      });
      setLoadState("ready");
    } catch (e) {
      console.error("Health note save database error", e);
      const message = e instanceof Error ? e.message : "Health note could not be saved.";
      setError(message);
      toast({
        title: "Could not save note",
        description: "The note was not saved. Check health_notes upsert permissions.",
        variant: "error",
      });
    } finally {
      setSavingKey(null);
    }
  }

  async function deleteNote(conditionKey: HealthConditionKey) {
    try {
      setDeletingKey(conditionKey);
      setError(null);
      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error("Sign in again to delete health notes.");

      const { error: deleteErr } = await supabase
        .from("health_notes")
        .delete()
        .eq("user_id", user.id)
        .eq("condition_key", conditionKey);

      if (deleteErr) throw deleteErr;
      setNotes((current) => ({ ...current, [conditionKey]: "" }));
      toast({
        title: "Health note deleted",
        description: `${selectedCondition.title} note was removed.`,
        variant: "success",
      });
    } catch (e) {
      console.error("Health note delete database error", e);
      const message = e instanceof Error ? e.message : "Health note could not be deleted.";
      setError(message);
      toast({
        title: "Could not delete note",
        description: "The note was not deleted. Check health_notes delete permissions.",
        variant: "error",
      });
    } finally {
      setDeletingKey(null);
      setSavingKey(null);
    }
  }

  return (
    <section className="glass rounded-lg border border-white/[0.08] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
                Health guidance
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                Condition-aware nutrition
              </h3>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/52">
            Persisted health notes plus focused foods, trigger warnings, hydration
            guidance, and meal suggestions for real daily decisions.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-10 shrink-0 self-start"
          disabled={loadState === "loading"}
          onClick={loadNotes}
        >
          {loadState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-300/15 bg-red-400/[0.06] px-4 py-3 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {HEALTH_CONDITIONS.map((condition) => (
            <ConditionCard
              key={condition.key}
              condition={condition}
              isActive={condition.key === selectedKey}
              note={notes[condition.key]}
              onSelect={() => setSelectedKey(condition.key)}
            />
          ))}
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
                Selected condition
              </p>
              <h4 className="mt-2 text-2xl font-black text-white">
                {selectedCondition.title}
              </h4>
              <p className="mt-2 text-sm leading-6 text-white/52">
                {selectedCondition.summary}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-neon/10 text-brand-neon">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <IntelligenceCards condition={selectedCondition} />

          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-neon" />
              <p className="text-sm font-black text-white">Best daily foods</p>
            </div>
            <FoodReasonList condition={selectedCondition} />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/[0.07] bg-black/10 p-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-200" />
                <p className="text-sm font-black text-white">Avoid or limit</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCondition.avoid.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/52"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.07] bg-black/10 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-brand-neon" />
                <p className="text-sm font-black text-white">Quick lifestyle tips</p>
              </div>
              <ul className="space-y-2">
                {selectedCondition.lifestyle.map((item) => (
                  <li key={item} className="text-xs leading-5 text-white/48">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-brand-neon/15 bg-brand-neon/[0.045] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-neon">
              Why this helps
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {selectedCondition.reasoning}
            </p>
          </div>

          <div className="mt-5">
            <label htmlFor="condition-note" className="text-sm font-black text-white">
              Personal note for AI guidance
            </label>
            <textarea
              id="condition-note"
              value={notes[selectedCondition.key]}
              onChange={(event) =>
                setNotes((current) => ({
                  ...current,
                  [selectedCondition.key]: event.target.value,
                }))
              }
              placeholder={`Example: ${selectedCondition.title} flares after late nights or sugary snacks.`}
              className="mt-2 min-h-24 w-full resize-y rounded-lg border border-white/10 bg-white/[0.055] px-4 py-3 text-sm leading-6 text-white shadow-inner shadow-black/20 outline-none transition placeholder:text-white/24 focus-ring"
            />
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className="h-10"
                disabled={!notes[selectedCondition.key].trim() || deletingKey === selectedCondition.key}
                isLoading={deletingKey === selectedCondition.key}
                onClick={() => deleteNote(selectedCondition.key)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button
                type="button"
                className="h-10"
                isLoading={savingKey === selectedCondition.key}
                onClick={() => saveNote(selectedCondition.key)}
              >
                <Save className="h-4 w-4" />
                Save note
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
