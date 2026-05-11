import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export function Input({ className, error, id, label, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-white/78">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-12 w-full rounded-lg border border-white/10 bg-white/[0.055] px-4 text-sm text-white placeholder:text-white/30 shadow-inner shadow-black/20 transition focus-ring",
          error && "border-red-400/60 focus:border-red-400",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs font-medium text-red-300">{error}</p> : null}
    </div>
  );
}
