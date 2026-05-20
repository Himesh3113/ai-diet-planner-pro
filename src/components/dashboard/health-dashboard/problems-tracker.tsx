"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProblemSeverity = "high" | "medium" | "low";
export type ProblemStatus = "active" | "resolved" | "ignored";

export interface SystemProblem {
  id: string;
  title: string;
  category: string;
  severity: ProblemSeverity;
  status: ProblemStatus;
  description: string;
  impact: string;
  occurrences: number;
  technicalDetails?: string;
}

const SEEDED_PROBLEMS: SystemProblem[] = [
  {
    id: "hydration-upsert-conflict",
    title: "Hydration Snapshot Upsert Conflict",
    category: "Supabase Database",
    severity: "high",
    status: "resolved",
    description: "The remote database lacked a composite UNIQUE constraint on (user_id, logged_on), causing upsert today's snapshot queries to throw constraint violations and trigger local fallbacks.",
    impact: "Blocked hydration tracker from syncing and saving daily progress snapshots to the cloud.",
    occurrences: 1,
    technicalDetails: "Query: upsert(snapshot, { onConflict: 'user_id,logged_on' }). Error: 42P01 / 23505 duplicate key value. Fixed by applying composite UNIQUE constraint in migration DDL.",
  },
  {
    id: "missing-acne-column",
    title: "Missing health_notes clinical columns",
    category: "Supabase Database",
    severity: "medium",
    status: "active",
    description: "Selecting explicit condition columns (acne, migraine, knee_pain, hair_fall) failed with 400 Bad Request because the remote database table structure was outdated.",
    impact: "Threw repeated 400 errors in browser console on every dashboard load.",
    occurrences: 1,
    technicalDetails: "PostgREST Error Code 42703 (column health_notes.acne does not exist). Resolved in frontend loaders by switching from fragile explicit column queries to resilient select('*') select syntax with JS fallback objects.",
  },
  {
    id: "unsafe-single-loaders",
    title: "Unsafe .single() Loader Crashes",
    category: "Backend Stabilization",
    severity: "medium",
    status: "resolved",
    description: "Using the strict .single() PostgREST query on empty profile telemetry or sleep logs caused fatal loader exceptions for first-time or onboarding users.",
    impact: "Prevented dashboard sections from rendering, causing infinite loading spinners.",
    occurrences: 1,
    technicalDetails: "Replaced all unsafe .single() calls with defensive .maybeSingle() queries paired with custom onboarding fallback generators.",
  },
  {
    id: "ai-raw-markdown-render",
    title: "AI Response Raw Markdown Clutter",
    category: "AI Assistant",
    severity: "medium",
    status: "active",
    description: "The AI Coach widget rendered streaming content with raw unparsed markdown text, causing compact blocks, raw tables, and messy bullet points.",
    impact: "Visually dense, hard-to-read wellness advice on mobile devices.",
    occurrences: 1,
    technicalDetails: "Upgraded frontend widget by replacing raw pre-wrap blocks with a visual meal card renderer and double-newline block paragraph formatter.",
  },
  {
    id: "analytics-error-noise",
    title: "Analytics Fallback Log Spam",
    category: "Analytics",
    severity: "low",
    status: "resolved",
    description: "Recoverable hydration fallbacks triggered loud console.error events, filling the developer terminal with non-fatal logging clutter.",
    impact: "Unnecessary log noise making true fatal exceptions harder to debug.",
    occurrences: 1,
    technicalDetails: "Downgraded standard error catcher inside progress-analytics-section.tsx to use console.warn for recoverable falls, preserving console.error for actual fatal build/network bugs.",
  },
];

export function ProblemsTracker() {
  const [isOpen, setIsOpen] = useState(true);
  const [problems, setProblems] = useState<SystemProblem[]>(SEEDED_PROBLEMS);
  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const isDev = searchParams.get("dev") === "true";

  // Live Error Capture Integration
  useEffect(() => {
    if (!isDev) return;
    const handleCapture = (event: Event) => {
      const customEvent = event as CustomEvent<{
        title: string;
        category: string;
        severity: ProblemSeverity;
        description: string;
        technicalDetails?: string;
      }>;

      if (!customEvent.detail) return;

      const { title, category, severity, description, technicalDetails } = customEvent.detail;

      setProblems((prev) => {
        // Prevent duplicate repeated errors
        const existingIndex = prev.findIndex(
          (p) => p.title === title || (technicalDetails && p.technicalDetails === technicalDetails)
        );

        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            occurrences: updated[existingIndex].occurrences + 1,
            status: "active", // Reactivate if repeated
          };
          return updated;
        }

        const newProblem: SystemProblem = {
          id: `dynamic-${Date.now()}`,
          title,
          category,
          severity,
          status: "active",
          description,
          impact: "Disrupted runtime page telemetry query or loading states.",
          occurrences: 1,
          technicalDetails,
        };

        return [newProblem, ...prev];
      });
    };

    window.addEventListener("register_system_problem", handleCapture);
    return () => window.removeEventListener("register_system_problem", handleCapture);
  }, [isDev]);

  const setStatus = (id: string, status: ProblemStatus) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  // Counters
  const totalCount = problems.length;
  const activeCount = problems.filter((p) => p.status === "active").length;
  const resolvedCount = problems.filter((p) => p.status === "resolved").length;
  const ignoredCount = problems.filter((p) => p.status === "ignored").length;

  const toggleExpand = (id: string) => {
    setExpandedProblemId((prev) => (prev === id ? null : id));
  };

  const getSeverityStyle = (severity: ProblemSeverity) => {
    switch (severity) {
      case "high":
        return "border-red-500/20 bg-red-500/10 text-red-400";
      case "medium":
        return "border-orange-500/20 bg-orange-500/10 text-orange-400";
      case "low":
        return "border-cyan-500/20 bg-cyan-500/10 text-cyan-400";
    }
  };

  const getStatusStyle = (status: ProblemStatus) => {
    switch (status) {
      case "active":
        return "border-rose-500/30 text-rose-400 bg-rose-500/6";
      case "resolved":
        return "border-brand-neon/30 text-brand-neon bg-brand-neon/6";
      case "ignored":
        return "border-white/10 text-white/40 bg-white/2";
    }
  };

  if (!isDev) return null;

  return (
    <section className="glass rounded-lg border border-white/[0.08] overflow-hidden transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-white/[0.02] px-6 py-4 transition hover:bg-white/[0.04]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-neon/20 bg-brand-neon/6 text-brand-neon">
            <ShieldAlert className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black tracking-wider uppercase text-white">
              System Stabilization & Problems Tracker
            </h3>
            <p className="text-[11px] font-semibold text-white/40">
              Workspace stabilization log and runtime PostgREST query interceptor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-md border border-white/10 bg-white/3 px-2 py-0.5 text-[10px] font-bold text-white/50">
              Total: {totalCount}
            </span>
            <span className="rounded-md border border-rose-500/20 bg-rose-500/6 px-2 py-0.5 text-[10px] font-bold text-rose-400">
              Active: {activeCount}
            </span>
            <span className="rounded-md border border-brand-neon/20 bg-brand-neon/6 px-2 py-0.5 text-[10px] font-bold text-brand-neon">
              Resolved: {resolvedCount}
            </span>
            <span className="rounded-md border border-white/10 bg-white/3 px-2 py-0.5 text-[10px] font-bold text-white/30">
              Ignored: {ignoredCount}
            </span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-white/50" />
          ) : (
            <ChevronRight className="h-4 w-4 text-white/50" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-white/[0.06] p-5 space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3 text-xs text-white/60">
            <Sparkles className="h-4 w-4 text-brand-neon shrink-0 animate-pulse" />
            <span>
              This tracker monitors active database errors and handles historical migration fixes. Switch issue states to test fallback configurations.
            </span>
          </div>

          <div className="divide-y divide-white/[0.06] overflow-hidden rounded-lg border border-white/[0.08] bg-black/20">
            {problems.map((problem) => {
              const isExpanded = expandedProblemId === problem.id;
              return (
                <div
                  key={problem.id}
                  className={cn(
                    "transition-colors",
                    isExpanded ? "bg-white/[0.02]" : "hover:bg-white/[0.01]"
                  )}
                >
                  {/* Issue Header Row */}
                  <div
                    onClick={() => toggleExpand(problem.id)}
                    className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 sm:px-5"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="shrink-0 text-white/30">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[1.5fr_1fr] sm:gap-4">
                        <div>
                          <p className="truncate text-xs font-bold text-white">
                            {problem.title}
                          </p>
                          <p className="text-[10px] text-white/40 font-medium">
                            {problem.category}
                          </p>
                        </div>
                        <div className="hidden items-center gap-2 sm:flex">
                          {problem.occurrences > 1 && (
                            <span className="rounded-md border border-amber-500/20 bg-amber-500/6 px-1.5 py-0.5 text-[9px] font-black text-amber-400">
                              x{problem.occurrences} repeated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                          getSeverityStyle(problem.severity)
                        )}
                      >
                        {problem.severity}
                      </span>
                      <span
                        className={cn(
                          "rounded border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                          getStatusStyle(problem.status)
                        )}
                      >
                        {problem.status}
                      </span>
                    </div>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.04] bg-[#07070b]/40 px-4 py-4 sm:px-12 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                            Problem Description
                          </p>
                          <p className="text-xs leading-relaxed text-white/70">
                            {problem.description}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                            Impact on Workspace
                          </p>
                          <p className="text-xs leading-relaxed text-white/70">
                            {problem.impact}
                          </p>
                        </div>
                      </div>

                      {problem.technicalDetails && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                            Technical Telemetry details
                          </p>
                          <pre className="overflow-x-auto rounded border border-white/[0.06] bg-black/40 p-2.5 text-[10px] font-semibold text-brand-neon/80 font-mono leading-relaxed">
                            {problem.technicalDetails}
                          </pre>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                        <p className="text-[10px] text-white/30">
                          Toggle issue status for fallbacks validation:
                        </p>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setStatus(problem.id, "active")}
                            className={cn(
                              "rounded px-2.5 py-1 text-[10px] font-black uppercase transition",
                              problem.status === "active"
                                ? "bg-rose-500 text-white"
                                : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white"
                            )}
                          >
                            Active
                          </button>
                          <button
                            onClick={() => setStatus(problem.id, "resolved")}
                            className={cn(
                              "rounded px-2.5 py-1 text-[10px] font-black uppercase transition",
                              problem.status === "resolved"
                                ? "bg-brand-neon text-black"
                                : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white"
                            )}
                          >
                            Resolved
                          </button>
                          <button
                            onClick={() => setStatus(problem.id, "ignored")}
                            className={cn(
                              "rounded px-2.5 py-1 text-[10px] font-black uppercase transition",
                              problem.status === "ignored"
                                ? "bg-white/20 text-white"
                                : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white"
                            )}
                          >
                            Ignored
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
