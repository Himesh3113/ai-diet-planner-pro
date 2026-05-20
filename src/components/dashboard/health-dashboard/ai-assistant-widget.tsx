"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bot, Loader2, RefreshCcw, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase/types";
import { createClient } from "@/utils/supabase/client";

type StoredMessage = Database["public"]["Tables"]["ai_assistant_messages"]["Row"];
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  pending?: boolean;
};

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Ask me for a concise meal fix, protein gap, hydration plan, or condition-aware food swap. I will use your saved profile, food logs, and health notes when available.",
};

function toChatMessage(row: StoredMessage): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}

function errorMessageFor(status: number, fallback: string) {
  if (status === 401) return "Please sign in again to use the AI assistant.";
  if (status === 429) return fallback || "Rate limit reached. Please try again later.";
  if (status >= 500) return "The AI provider is temporarily unavailable. Try again in a moment.";
  return fallback || "The assistant could not respond. Please try again.";
}

function optionalMessagesUnavailable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === "42P01" ||
    maybeError.code === "PGRST205" ||
    (typeof maybeError.message === "string" &&
      maybeError.message.toLowerCase().includes("ai_assistant_messages"))
  );
}

export function AIAssistantWidget() {
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        setLoadState("loading");
        setError(null);
        const supabase = createClient();
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        if (!user) throw new Error("Please sign in again to load chat history.");

        const { data, error: msgErr } = await supabase
          .from("ai_assistant_messages")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(40);

        if (msgErr) {
          if (optionalMessagesUnavailable(msgErr)) {
            setMessages([WELCOME_MESSAGE]);
            setLoadState("ready");
            return;
          }
          throw msgErr;
        }
        const saved = (data ?? []).map(toChatMessage);
        setMessages(saved.length > 0 ? saved : [WELCOME_MESSAGE]);
        setLoadState("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load chat history.");
        setMessages([WELCOME_MESSAGE]);
        setLoadState("error");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isStreaming]);

  useEffect(
    () => () => {
      streamAbortRef.current?.abort();
    },
    [],
  );

  const canSend = useMemo(
    () => draft.trim().length > 0 && !isStreaming && loadState !== "loading",
    [draft, isStreaming, loadState],
  );

  const sendPrompt = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setDraft("");
      setLastPrompt(trimmed);
      setLoadState("ready");

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        pending: true,
      };
      const assistantId = `assistant-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        pending: true,
      };

      const historyForRequest = messages
        .filter((message) => message.id !== "welcome" && message.content.trim())
        .slice(-10)
        .map(({ role, content }) => ({ role, content }));

      setMessages((current) => [...current, userMessage, assistantMessage]);
      setIsStreaming(true);

      const abortController = new AbortController();
      streamAbortRef.current = abortController;

      try {
        const response = await fetch("/api/ai-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history: historyForRequest }),
          signal: abortController.signal,
        });

        if (!response.ok || !response.body) {
          let bodyError = "";
          try {
            const parsed = (await response.json()) as { error?: string };
            bodyError = parsed.error ?? "";
          } catch {
            bodyError = "";
          }
          throw new Error(errorMessageFor(response.status, bodyError));
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamed = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          streamed += decoder.decode(value, { stream: true });
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? { ...message, content: streamed, pending: true }
                : message,
            ),
          );
        }

        setMessages((current) =>
          current.map((message) => {
            if (message.id === userMessage.id) return { ...message, pending: false };
            if (message.id === assistantId) {
              return {
                ...message,
                content:
                  streamed ||
                  "I could not produce a response. Please try again with a shorter question.",
                pending: false,
              };
            }
            return message;
          }),
        );
      } catch (e) {
        if (abortController.signal.aborted) return;
        const nextError =
          e instanceof Error ? e.message : "The assistant could not respond.";
        setError(nextError);
        setMessages((current) =>
          current.filter((message) => message.id !== assistantId).map((message) =>
            message.id === userMessage.id ? { ...message, pending: false } : message,
          ),
        );
      } finally {
        setIsStreaming(false);
        streamAbortRef.current = null;
      }
    },
    [isStreaming, messages],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSend) void sendPrompt(draft);
  }

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
                AI nutrition assistant
              </p>
              <h3 className="mt-2 text-lg font-black text-white">
                Context-aware coaching
              </h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/52">
            Streams AI answers using your metrics, food logs, hydration, targets, and
            health notes.
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
        <div className="mt-5 space-y-4">
          {loadState === "loading" ? (
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/55">
                <Loader2 className="h-4 w-4 animate-spin text-brand-neon" />
                Loading chat history
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-red-300/15 bg-red-400/[0.06] p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-200" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-red-100">{error}</p>
                  {lastPrompt ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-3 h-9 gap-2 px-3 text-xs"
                      disabled={isStreaming}
                      onClick={() => void sendPrompt(lastPrompt)}
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Retry
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="max-h-[420px] overflow-auto rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[92%] whitespace-pre-wrap rounded-lg bg-brand-neon/12 px-3 py-2 text-sm font-semibold text-white sm:max-w-[85%]"
                        : "max-w-[92%] whitespace-pre-wrap rounded-lg bg-white/[0.06] px-3 py-2 text-sm leading-relaxed text-white/72 sm:max-w-[85%]"
                    }
                  >
                    {message.content ||
                      (message.pending ? (
                        <span className="inline-flex items-center gap-2 text-white/45">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-neon" />
                          Thinking
                        </span>
                      ) : null)}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about today's meals, calories, protein, hydration, or safe wellness habits..."
                rows={3}
                maxLength={1200}
                className="min-h-[72px] w-full resize-none rounded-lg border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white placeholder:text-white/30 shadow-inner shadow-black/20 focus:outline-none focus:ring-2 focus:ring-brand-neon/30"
              />
              <p className="mt-1 text-[11px] text-white/30">
                Wellness guidance only. For medical concerns, work with a qualified
                clinician.
              </p>
            </div>
            <Button
              disabled={!canSend}
              type="submit"
              className="h-12 w-full shrink-0 sm:w-auto"
              isLoading={isStreaming}
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
