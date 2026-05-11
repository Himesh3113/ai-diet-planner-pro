import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-brand-neon text-black shadow-[0_0_28px_rgba(57,255,20,0.28)] hover:bg-brand-neon/90",
  secondary:
    "border-white/10 bg-white/[0.06] text-white hover:border-white/20 hover:bg-white/[0.1]",
  ghost:
    "border-transparent bg-transparent text-white/65 hover:bg-white/[0.06] hover:text-white",
  danger:
    "border-red-400/20 bg-red-500/10 text-red-100 hover:bg-red-500/15",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className,
  disabled,
  isLoading = false,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-bold transition duration-200 focus-ring disabled:pointer-events-none disabled:opacity-55",
        variantClasses[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function buttonClassName(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex h-12 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-bold transition duration-200 focus-ring",
    variantClasses[variant],
    className,
  );
}
