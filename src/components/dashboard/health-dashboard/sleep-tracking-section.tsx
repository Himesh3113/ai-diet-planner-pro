"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Moon, Sparkles, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { ChartClientMount } from "./analytics/chart-client-mount";
import {
  CHART_AXIS,
  CHART_GRID,
  CHART_TOOLTIP,
  NEON,
} from "./analytics/chart-styles";

type SleepLog = {
  id: string;
  logged_on: string;
  duration_hours: number;
  quality_score: number;
};

const QUALITY_LABELS: Record<number, string> = {
  1: "Terrible (Restless)",
  2: "Very Poor",
  3: "Poor",
  4: "Below Average",
  5: "Average (Okay)",
  6: "Fair",
  7: "Good",
  8: "Very Good",
  9: "Excellent",
  10: "Perfect (Deep & Rested)",
};

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function SleepTrackingSection() {
  const { toast } = useToast();
  const [duration, setDuration] = useState("");
  const [quality, setQuality] = useState<number>(7);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const todayDateString = useMemo(() => todayKey(), []);

  const loadSleepLogs = useCallback(async () => {
    try {
      setLoadState("loading");
      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error("Sign in to load sleep tracking.");

      // Fetch last 14 days to calculate full trends
      const { data, error: logErr } = await supabase
        .from("sleep_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_on", { ascending: false })
        .limit(14);

      if (logErr) throw logErr;

      const formatted = (data ?? []).map((row) => ({
        id: row.id,
        logged_on: row.logged_on,
        duration_hours: Number(row.duration_hours),
        quality_score: Number(row.quality_score),
      }));

      setSleepLogs(formatted);

      // Check if today is already logged, pre-fill form
      const todayLog = formatted.find((l) => l.logged_on === todayDateString);
      if (todayLog) {
        setDuration(String(todayLog.duration_hours));
        setQuality(todayLog.quality_score);
      } else {
        setDuration("");
        setQuality(7);
      }

      setLoadState("ready");
    } catch (e) {
      console.error("Error loading sleep logs", e);
      const msg = e && typeof e === "object" && "message" in e && typeof e.message === "string"
        ? e.message
        : (e instanceof Error ? e.message : "Failed to load sleep metrics.");
      toast({
        title: "Sleep tracker error",
        description: msg,
        variant: "error",
      });
      setSleepLogs([]);
      setLoadState("ready");
    }
  }, [todayDateString, toast]);

  useEffect(() => {
    let active = true;
    const fetchLogs = async () => {
      await Promise.resolve();
      if (active) {
        void loadSleepLogs();
      }
    };
    void fetchLogs();
    return () => {
      active = false;
    };
  }, [loadSleepLogs]);

  const handleSaveSleep = async () => {
    try {
      const parsedHours = Number(duration);
      if (!duration || Number.isNaN(parsedHours) || parsedHours < 0 || parsedHours > 24) {
        toast({
          title: "Invalid duration",
          description: "Please enter sleep duration between 0 and 24 hours.",
          variant: "error",
        });
        return;
      }

      setIsSaving(true);
      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error("Please log in again.");

      const { error: upsertErr } = await supabase
        .from("sleep_logs")
        .upsert({
          user_id: user.id,
          logged_on: todayDateString,
          duration_hours: parsedHours,
          quality_score: quality,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,logged_on",
        });

      if (upsertErr) throw upsertErr;

      toast({
        title: "Sleep logged!",
        description: `Logged ${parsedHours} hrs with a quality score of ${quality}/10!`,
        variant: "success",
      });

      await loadSleepLogs();
    } catch (e) {
      toast({
        title: "Save error",
        description: e instanceof Error ? e.message : "Failed to save sleep log.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSleep = async () => {
    try {
      const todayLog = sleepLogs.find((l) => l.logged_on === todayDateString);
      if (!todayLog) return;

      setIsDeleting(true);
      const supabase = createClient();
      const { error: deleteErr } = await supabase
        .from("sleep_logs")
        .delete()
        .eq("id", todayLog.id);

      if (deleteErr) throw deleteErr;

      toast({
        title: "Deleted",
        description: "Today's sleep log has been removed.",
        variant: "info",
      });

      await loadSleepLogs();
    } catch (e) {
      toast({
        title: "Delete error",
        description: e instanceof Error ? e.message : "Failed to delete sleep log.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Compile last 7 days data chronologically for Recharts
  const chartData = useMemo(() => {
    const list = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const key = `${yyyy}-${mm}-${dd}`;

      const matchedLog = sleepLogs.find((l) => l.logged_on === key);

      // Short label like "Mon"
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });

      list.push({
        dateLabel: dayLabel,
        key,
        duration: matchedLog ? matchedLog.duration_hours : null,
        quality: matchedLog ? matchedLog.quality_score : null,
      });
    }
    return list;
  }, [sleepLogs]);

  const todayLogged = useMemo(() => {
    return sleepLogs.some((l) => l.logged_on === todayDateString);
  }, [sleepLogs, todayDateString]);

  const weeklyAverages = useMemo(() => {
    const validLogs = sleepLogs.filter((l) => {
      // Must be within last 7 days
      const limit = new Date();
      limit.setDate(limit.getDate() - 7);
      return new Date(l.logged_on) >= limit;
    });

    if (validLogs.length === 0) return { avgDuration: 0, avgQuality: 0 };

    const sumDur = validLogs.reduce((sum, l) => sum + l.duration_hours, 0);
    const sumQual = validLogs.reduce((sum, l) => sum + l.quality_score, 0);

    return {
      avgDuration: Number((sumDur / validLogs.length).toFixed(1)),
      avgQuality: Number((sumQual / validLogs.length).toFixed(1)),
    };
  }, [sleepLogs]);

  return (
    <section className="glass rounded-lg border border-white/[0.08] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-brand-neon">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-neon">
                Sleep Tracking
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                Sleep &amp; Recovery
              </h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/52">
            Monitor sleep quantity and subjective sleep quality to optimize cognitive and physical recovery.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="h-10 shrink-0 self-start sm:self-auto border border-white/10"
          disabled={loadState === "loading"}
          onClick={loadSleepLogs}
        >
          Refresh
        </Button>
      </div>

      {loadState === "loading" ? (
        <div className="mt-8 flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-neon" />
          <p className="mt-3 text-xs text-white/35">Loading sleep tracking...</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.8fr]">
          {/* Logger Panel */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                  Log Sleep
                </p>
                {todayLogged && (
                  <span className="rounded bg-brand-neon/10 px-2 py-0.5 text-[9px] font-black uppercase text-brand-neon">
                    Logged
                  </span>
                )}
              </div>

              {/* Sleep Duration Input */}
              <div className="space-y-2">
                <label htmlFor="sleep-duration" className="block text-xs font-bold text-white/70 uppercase">
                  Duration (hours)
                </label>
                <Input
                  id="sleep-duration"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min={0}
                  max={24}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 7.5"
                  className="bg-white/[0.04] border-white/10"
                />
              </div>

              {/* Quality Selectors */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/70 uppercase">
                  Sleep Quality: <span className="text-brand-neon font-black">{quality}/10</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQuality(val)}
                      className={cn(
                        "rounded py-2 text-xs font-bold transition border",
                        quality === val
                          ? "bg-brand-neon text-black border-brand-neon font-black"
                          : "bg-white/[0.04] text-white/50 border-white/5 hover:bg-white/[0.08] hover:text-white"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-white/40 italic">
                  Sense: {QUALITY_LABELS[quality]}
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-2 pt-4 border-t border-white/5">
              {todayLogged && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 border border-red-500/20 text-red-400 hover:bg-red-500/10"
                  onClick={handleDeleteSleep}
                  isLoading={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                className="flex-1 h-11 bg-white hover:bg-white/90 text-black font-extrabold"
                onClick={handleSaveSleep}
                isLoading={isSaving}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {todayLogged ? "Update Log" : "Log Sleep"}
              </Button>
            </div>
          </div>

          {/* Weekly Sleep Trends Chart */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                  Weekly Sleep Analytics
                </p>
                <div className="flex gap-4">
                  <div>
                    <span className="text-[9px] text-white/40 block uppercase font-bold">Avg Duration</span>
                    <span className="text-xs font-extrabold text-white">
                      {weeklyAverages.avgDuration ? `${weeklyAverages.avgDuration} hrs` : "—"}
                    </span>
                  </div>
                  <div className="border-l border-white/10 pl-4">
                    <span className="text-[9px] text-white/40 block uppercase font-bold">Avg Quality</span>
                    <span className="text-xs font-extrabold text-brand-neon">
                      {weeklyAverages.avgQuality ? `${weeklyAverages.avgQuality}/10` : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recharts Component */}
              <ChartClientMount className="h-60 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid {...CHART_GRID} />
                    <XAxis dataKey="dateLabel" {...CHART_AXIS} />
                    <YAxis
                      yAxisId="left"
                      domain={[0, 12]}
                      tickCount={7}
                      {...CHART_AXIS}
                      label={{
                        value: "Hours",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        fill: "rgba(255,255,255,0.3)",
                        fontSize: 9,
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 10]}
                      tickCount={6}
                      {...CHART_AXIS}
                      label={{
                        value: "Quality (1-10)",
                        angle: 90,
                        position: "insideRight",
                        offset: 10,
                        fill: "rgba(255,255,255,0.3)",
                        fontSize: 9,
                      }}
                    />
                    <Tooltip {...CHART_TOOLTIP} />
                    
                    {/* Sleep Duration Line (Cyan) */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="duration"
                      name="Duration (hrs)"
                      stroke="rgba(0, 240, 255, 0.7)"
                      strokeWidth={2.5}
                      dot={{ r: 4, strokeWidth: 1.5, fill: "#0c0d12" }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />

                    {/* Sleep Quality Line (Neon Green) */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="quality"
                      name="Quality Score"
                      stroke={NEON}
                      strokeWidth={2.5}
                      dot={{ r: 4, strokeWidth: 1.5, fill: "#0c0d12" }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartClientMount>
            </div>
            
            <p className="text-[10px] text-white/30 text-center mt-2">
              Values connected across days. Regular logging improves recommendation accuracy.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
