"use client";

import { HeartPulse, Plus, Loader2 } from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/toast";


type Condition = {
  key: "acne" | "migraine" | "knee_pain" | "hair_fall";
  title: string;
  description: string;
  accent: "brand-neon" | "brand-blue" | "brand-purple" | "brand-pink";
};


const conditions: Condition[] = [
  {
    key: "acne",
    title: "Acne",
    description: "Identify triggers and build a balanced routine.",
    accent: "brand-neon",
  },
  {
    key: "migraine",
    title: "Migraine",
    description: "Support stability with hydration and consistent meals.",
    accent: "brand-blue",
  },
  {
    key: "knee_pain",
    title: "Knee pain",
    description: "Focus on inflammation-aware nutrition and recovery.",
    accent: "brand-purple",
  },
  {
    key: "hair_fall",
    title: "Hair fall",
    description: "Strengthen intake with protein and micronutrients.",
    accent: "brand-pink",
  },
];

function AccentDot({ accent }: { accent: Condition["accent"] }) {
  const className =
    accent === "brand-neon"
      ? "bg-brand-neon"
      : accent === "brand-blue"
        ? "bg-brand-blue"
        : accent === "brand-purple"
          ? "bg-brand-purple"
          : "bg-brand-pink";

  return <span className={`h-2 w-2 rounded-full ${className}`} />;
}

type ConditionKey = Condition["key"];

type NotesRow = {
  user_id: string;
  acne: string | null;
  migraine: string | null;
  knee_pain: string | null;
  hair_fall: string | null;
};

function emptyNotes(): Record<ConditionKey, string> {
  return {
    acne: "",
    migraine: "",
    knee_pain: "",
    hair_fall: "",
  };
}

export function HealthConditionsSection() {
  const { toast } = useToast();

  const [openKey, setOpenKey] = useState<ConditionKey | null>(null);
  const [notes, setNotes] = useState<Record<ConditionKey, string>>(
    emptyNotes(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingKey, setIsSavingKey] = useState<ConditionKey | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<Record<ConditionKey, string | null>>(
    {
      acne: null,
      migraine: null,
      knee_pain: null,
      hair_fall: null,
    },
  );

  const saveTimeoutRef = useRef<Record<ConditionKey, number | null>>({
    acne: null,
    migraine: null,
    knee_pain: null,
    hair_fall: null,
  });
  const hasLoadedRef = useRef(false);

  const openTitle = useMemo(
    () => conditions.find((c) => c.key === openKey)?.title,
    [openKey],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setLoadError(null);
        setSaveError({
          acne: null,
          migraine: null,
          knee_pain: null,
          hair_fall: null,
        });

        const supabase = createClient();
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr) throw userErr;
        if (!user) {
          throw new Error("Not authenticated");
        }

        const { data, error } = await supabase
          .from("health_condition_notes")
          .select("user_id, acne, migraine, knee_pain, hair_fall")
          .eq("user_id", user.id)
          .maybeSingle<NotesRow>();

        if (error) throw error;

        const row = data ?? null;
        if (cancelled) return;

        setNotes({
          acne: row?.acne ?? "",
          migraine: row?.migraine ?? "",
          knee_pain: row?.knee_pain ?? "",
          hair_fall: row?.hair_fall ?? "",
        });
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load notes");
        setNotes(emptyNotes());
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          hasLoadedRef.current = true;
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(key: ConditionKey) {
    try {
      setIsSavingKey(key);
      setLoadError(null);
      setSaveError((prev) => ({ ...prev, [key]: null }));


      const supabase = createClient();
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr) throw userErr;
      if (!user) throw new Error("Not authenticated");

      const payload: Partial<NotesRow> = {
        user_id: user.id,
        acne: key === "acne" ? notes.acne : undefined,
        migraine: key === "migraine" ? notes.migraine : undefined,
        knee_pain: key === "knee_pain" ? notes.knee_pain : undefined,
        hair_fall: key === "hair_fall" ? notes.hair_fall : undefined,
      };

      // Since we might be saving only one key, we fetch the existing row then merge.
      // This keeps “CRUD support” correct even if the other columns are nullable.
      const { data: existing, error: existingErr } = await supabase
        .from("health_condition_notes")
        .select("user_id, acne, migraine, knee_pain, hair_fall")
        .eq("user_id", user.id)
        .maybeSingle<NotesRow>();

      if (existingErr) throw existingErr;

      const nextRow: NotesRow = {
        user_id: user.id,
        acne: payload.acne ?? existing?.acne ?? "",
        migraine: payload.migraine ?? existing?.migraine ?? "",
        knee_pain: payload.knee_pain ?? existing?.knee_pain ?? "",
        hair_fall: payload.hair_fall ?? existing?.hair_fall ?? "",
      };

      // Supabase row types may be out of sync with schema in this repo.
      // Use a safe runtime payload while keeping TS from failing.
      const { error } = await (supabase
        .from("health_condition_notes") as unknown as {
        upsert: (values: NotesRow, options: { onConflict: string }) => Promise<
          { error: unknown | null }
        >;
      }).upsert(nextRow, { onConflict: "user_id" });

      if (error) throw error;

      toast({
        title: "Health notes saved",
        description: `Saved changes for ${conditions.find((c) => c.key === key)?.title ?? "your account"}.`,
        variant: "success",
      });

      setOpenKey(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save notes";
      setSaveError((prev) => ({ ...prev, [key]: message }));
      setLoadError(message);
      toast({
        title: "Save failed",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSavingKey(null);
    }
  }

  useEffect(() => {
    if (!hasLoadedRef.current) return;

    if (!openKey) return;
    const key = openKey;

    if (isLoading) return;
    if (isSavingKey) return;

    // Clear previous debounce timer for this key.
    const existingTimeout = saveTimeoutRef.current[key];
    if (existingTimeout) window.clearTimeout(existingTimeout);

    const timeoutId = window.setTimeout(() => {
      handleSave(key);
    }, 800);

    saveTimeoutRef.current[key] = timeoutId;

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, openKey, isLoading, isSavingKey]);

  return (
    <section className="space-y-5">
      <SectionHeader
        kicker="Health conditions"
        title="Track what matters"
        description="Add notes per condition to personalize future recommendations. (V1: Supabase persistent notes)"

        right={
          <div className="hidden md:flex items-center gap-2 text-xs text-white/32">
            <HeartPulse className="h-4 w-4 text-brand-neon" />
            Quick-entry cards
          </div>
        }
      />


      <div className="grid gap-4 md:grid-cols-2">
        {conditions.map((c) => {
          const isOpen = openKey === c.key;
          const existing = notes[c.key] ?? "";

          return (
            <div
              key={c.key}
              className="glass rounded-lg border border-white/[0.08] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <AccentDot accent={c.accent} />
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/35">
                      Condition
                    </p>
                  </div>
                  <h3 className="mt-2 text-lg font-black text-white">{c.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    className="h-10 w-10 px-0"
                    variant="ghost"
                    onClick={() => setOpenKey((k) => (k === c.key ? null : c.key))}
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-white/52">{c.description}</p>

              {isOpen ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={existing}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        [c.key]: e.target.value,
                      }))
                    }
                    placeholder={isLoading ? "Loading notes..." : `Add notes for ${c.title}...`}
                    disabled={isLoading || isSavingKey === c.key}
                    className="min-h-28 w-full resize-none rounded-lg border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white placeholder:text-white/30 shadow-inner shadow-black/20 focus:outline-none focus:ring-2 focus:ring-brand-neon/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  />

                  {saveError[c.key] ? (
                    <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                      {saveError[c.key]}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-white/35">
                      {isLoading
                        ? "Loading..."
                        : isSavingKey === c.key
                          ? "Saving..."
                          : "Saved to your account"}
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => handleSave(c.key)}
                      type="button"
                      disabled={isLoading || isSavingKey === c.key}
                    >
                      {isSavingKey === c.key ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving
                        </span>
                      ) : (
                        "Save note"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-white/45">
                  {isLoading ? (
                    <span className="font-semibold text-white/60">Loading...</span>
                  ) : existing ? (
                    <span className="font-semibold text-white/60">
                      Notes added
                    </span>
                  ) : (
                    <span className="font-semibold text-white/60">
                      No notes yet
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {loadError ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      ) : null}

      {openTitle ? (
        <div className="text-xs text-white/32">
          Editing: <span className="font-bold text-white/45">{openTitle}</span>
        </div>
      ) : null}
    </section>
  );
}

