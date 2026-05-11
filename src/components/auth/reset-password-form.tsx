"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/utils/supabase/client";

const resetPasswordSchema = z
  .object({
    confirmPassword: z.string().min(8, "Confirm your password."),
    password: z.string().min(8, "Use at least 8 characters."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [hasSession, setHasSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
  });

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setHasSession(Boolean(data.session));
      setIsCheckingSession(false);

      if (!data.session) {
        toast({
          title: "Recovery link required",
          description: "Open the password recovery link from your email before setting a new password.",
          variant: "error",
        });
      }
    });

    return () => {
      mounted = false;
    };
  }, [toast]);

  const onSubmit = handleSubmit(async (values) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "error",
      });
      return;
    }

    await supabase.auth.signOut();
    toast({
      title: "Password updated",
      description: "Sign in again with your new password.",
      variant: "success",
    });
    router.push("/login?message=Password updated. Sign in with your new password.");
    router.refresh();
  });

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-brand-neon/25 bg-brand-neon/10 text-brand-neon">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Set new password</h1>
        <p className="mt-2 text-sm leading-6 text-white/52">
          Choose a strong password to secure your AI Diet Planner Pro account.
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <Input
          autoComplete="new-password"
          error={errors.password?.message}
          id="password"
          label="New password"
          placeholder="At least 8 characters"
          type="password"
          {...register("password")}
        />
        <Input
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          id="confirmPassword"
          label="Confirm new password"
          placeholder="Repeat your new password"
          type="password"
          {...register("confirmPassword")}
        />

        <Button
          className="w-full"
          disabled={!hasSession || isCheckingSession}
          isLoading={isSubmitting || isCheckingSession}
          type="submit"
        >
          Update password
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
