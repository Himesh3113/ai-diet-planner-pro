import { NextRequest } from "next/server";
import { WELLNESS_CATALOG, WELLNESS_CATALOG_BY_KEY } from "@/lib/wellness/catalog";
import {
  deleteWellnessCondition,
  fetchWellnessHubData,
  markWellnessRecovered,
  recordRecoverySnapshot,
  seedRecommendationsForCondition,
  upsertWellnessCondition,
} from "@/lib/wellness/db";
import { profilesForKeys } from "@/lib/wellness/condition-profiles";
import { buildWellnessInsights } from "@/lib/wellness/insights";
import { computeWellnessScores } from "@/lib/wellness/scoring";
import { computeConditionRecoveryStats } from "@/lib/wellness/recovery-tracking";
import type { WellnessSeverity, WellnessStatus } from "@/lib/wellness/types";
import { createClient } from "@/utils/supabase/server";

const VALID_STATUS = new Set<WellnessStatus>([
  "monitoring",
  "improving",
  "stable",
  "critical",
  "recovered",
]);
const VALID_SEVERITY = new Set<WellnessSeverity>(["mild", "moderate", "severe"]);

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

    const data = await fetchWellnessHubData(supabase, user.id);

    const trends = {
      hydration: data.hydration.map((h) => ({
        date: h.logged_on,
        value: h.water_ml ?? 0,
      })),
      sleep: data.sleep.map((s) => ({
        date: s.logged_on,
        value: Number(s.duration_hours ?? s.quality_score ?? 0),
      })),
      recovery: data.progress.map((p) => ({
        date: p.recorded_on,
        value: p.recovery_score ?? 0,
      })),
      energy: data.progress.map((p) => ({
        date: p.recorded_on,
        value: p.energy_score ?? 0,
      })),
    };

    const scores = computeWellnessScores(
      data.conditions,
      WELLNESS_CATALOG_BY_KEY,
      trends,
    );

    const activeCount = data.conditions.filter((c) => c.status !== "recovered").length;
    const insights = buildWellnessInsights({
      scores,
      activeCount,
      trends,
      conditions: data.conditions,
    });

    const profileKeys = [...new Set(data.conditions.map((c) => c.condition_key))];
    const profiles = profilesForKeys(profileKeys);

    const recoveryStats = Object.fromEntries(
      data.conditions.map((c) => [
        c.id,
        computeConditionRecoveryStats(
          c.id,
          data.progress,
          data.logs,
          c.recovery_progress,
          c.status,
        ),
      ]),
    );

    return Response.json({
      catalog: WELLNESS_CATALOG,
      profiles,
      conditions: data.conditions,
      logs: data.logs,
      recommendations: data.recommendations,
      progress: data.progress,
      trends,
      scores,
      insights,
      recoveryStats,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load wellness hub.";
    return Response.json(
      {
        error: message.includes("wellness_conditions")
          ? "Wellness tables missing. Apply supabase/migrations/20260520180000_wellness_hub.sql."
          : message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      action?: string;
      id?: string;
      conditionKey?: string;
      severity?: string;
      status?: string;
      symptoms?: string[];
      notes?: string;
      hydrationTargetMl?: number;
      sleepTargetHours?: number;
      recoveryProgress?: number;
    };

    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) {
      return Response.json({ error: "Not authenticated." }, { status: 401 });
    }

    if (body.action === "delete" && body.id) {
      await deleteWellnessCondition(supabase, user.id, body.id);
      return Response.json({ ok: true });
    }

    if (body.action === "recovered" && body.id) {
      const row = await markWellnessRecovered(supabase, user.id, body.id);
      return Response.json({ condition: row });
    }

    const conditionKey = body.conditionKey?.trim();
    if (!conditionKey || !WELLNESS_CATALOG_BY_KEY[conditionKey]) {
      return Response.json({ error: "Invalid wellness condition." }, { status: 400 });
    }

    const severity = VALID_SEVERITY.has(body.severity as WellnessSeverity)
      ? (body.severity as WellnessSeverity)
      : "moderate";
    const status = VALID_STATUS.has(body.status as WellnessStatus)
      ? (body.status as WellnessStatus)
      : "monitoring";

    const row = await upsertWellnessCondition(supabase, {
      userId: user.id,
      id: body.id,
      conditionKey,
      severity,
      status,
      symptoms: body.symptoms,
      notes: body.notes,
      hydrationTargetMl: body.hydrationTargetMl,
      sleepTargetHours: body.sleepTargetHours,
      recoveryProgress: body.recoveryProgress,
    });

    if (!body.id) {
      await seedRecommendationsForCondition(supabase, user.id, row.id, conditionKey);
    }

    const scores = computeWellnessScores([row], WELLNESS_CATALOG_BY_KEY);
    await recordRecoverySnapshot(supabase, user.id, row.id, scores);

    return Response.json({ condition: row });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Wellness action failed.",
      },
      { status: 500 },
    );
  }
}
