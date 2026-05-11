"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastInput = {
  description?: string;
  title: string;
  variant?: ToastVariant;
};

type Toast = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  dismiss: (id: string) => void;
  toast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function makeToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = makeToastId();
      const nextToast: Toast = {
        id,
        variant: input.variant ?? "info",
        title: input.title,
        description: input.description,
      };

      setToasts((current) => [...current, nextToast].slice(-4));
      window.setTimeout(() => dismiss(id), 5200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ dismiss, toast }), [dismiss, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "glass rounded-lg border p-4 shadow-2xl shadow-black/30",
              item.variant === "success" && "border-brand-neon/30",
              item.variant === "error" && "border-red-400/35",
              item.variant === "info" && "border-brand-blue/25",
            )}
            role="status"
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                  item.variant === "success" && "bg-brand-neon/15 text-brand-neon",
                  item.variant === "error" && "bg-red-500/15 text-red-200",
                  item.variant === "info" && "bg-brand-blue/15 text-brand-blue",
                )}
              >
                {item.variant === "error" ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm leading-5 text-white/55">{item.description}</p>
                ) : null}
              </div>
              <button
                aria-label="Dismiss notification"
                className="rounded-md p-1 text-white/35 transition hover:bg-white/10 hover:text-white"
                onClick={() => dismiss(item.id)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
