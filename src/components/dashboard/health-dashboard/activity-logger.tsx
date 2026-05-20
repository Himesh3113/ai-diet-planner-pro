"use client";

import { useState } from "react";
import { Dumbbell, Calendar, Flame, Timer, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/toast";

type WorkoutSession = {
  id: string;
  user_id: string;
  logged_on: string;
  workout_name: string;
  duration_minutes: number;
  calories_burned: number | null;
  created_at: string;
};

type ActivityLoggerProps = {
  initialSessions: WorkoutSession[];
  userId: string;
};

export function ActivityLogger({ initialSessions, userId }: ActivityLoggerProps) {
  const [sessions, setSessions] = useState<WorkoutSession[]>(initialSessions);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];
      const parsedDuration = Number(duration) || 30;
      const parsedCalories = Number(calories) || 200;

      const { data, error } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: userId,
          logged_on: today,
          workout_name: name,
          duration_minutes: parsedDuration,
          calories_burned: parsedCalories,
        })
        .select("*")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSessions((prev) => [data as WorkoutSession, ...prev]);
        setName("");
        setDuration("");
        setCalories("");
        toast({
          title: "Session logged!",
          description: "Your workout has been recorded.",
          variant: "success",
        });
      }
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: "Log failed",
        description: err instanceof Error ? err.message : "An error occurred.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      setIsDeleting(id);
      const supabase = createClient();
      const { error } = await supabase.from("workout_sessions").delete().eq("id", id);
      if (error) throw error;

      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: "Session deleted",
        description: "Workout session removed successfully.",
        variant: "success",
      });
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "An error occurred.",
        variant: "error",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Logger Form */}
      <div className="glass rounded-xl border border-white/[0.08] p-5 h-fit space-y-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white">Log Workout Session</h3>
          <p className="text-[11px] text-white/40">Record your completed activity metrics manually</p>
        </div>

        <form onSubmit={handleAddSession} className="space-y-4">
          <Input
            id="workoutName"
            label="Workout Name"
            placeholder="e.g. Legs Hypertrophy, Cardio Run"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid gap-4 grid-cols-2">
            <Input
              id="duration"
              label="Duration (min)"
              type="number"
              min={1}
              placeholder="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <Input
              id="calories"
              label="Calories (kcal)"
              type="number"
              min={1}
              placeholder="250"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full text-xs h-9.5">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log Completion"}
          </Button>
        </form>
      </div>

      {/* History List */}
      <div className="md:col-span-2 glass rounded-xl border border-white/[0.08] p-5 space-y-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white">Activity History</h3>
          <p className="text-[11px] text-white/40">Previous logs logged inside your schedule</p>
        </div>

        <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-xs">
              <Dumbbell className="h-8 w-8 mx-auto opacity-20 mb-2" />
              No workouts logged recently. Complete one from your workout planner or log manually!
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between border border-white/[0.05] bg-white/[0.01] rounded-lg p-3 hover:border-white/[0.1] hover:bg-white/[0.02] transition"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-neon/10 text-brand-neon">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{session.workout_name}</p>
                    <div className="flex items-center gap-3 text-[10px] text-white/40 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(session.logged_on).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {session.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {session.calories_burned} kcal
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleDeleteSession(session.id)}
                  disabled={isDeleting === session.id}
                  variant="ghost"
                  className="h-8 w-8 p-0 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
                >
                  {isDeleting === session.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
