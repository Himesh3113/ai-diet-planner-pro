"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/utils/supabase/client";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter the email address for your account."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const {
    formState: { errors, isSubmitSuccessful, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo,
    });

    if (error) {
      toast({
        title: "Reset email failed",
        description: error.message,
        variant: "error",
      });
      return;
    }

    toast({
      title: "Recovery email sent",
      description: "Open the secure link in your inbox to set a new password.",
      variant: "success",
    });
  });

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-brand-purple/25 bg-brand-purple/10 text-brand-purple">
          <Mail className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-white/52">
          Enter your account email and Supabase will send a secure recovery link.
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <Input
          autoComplete="email"
          error={errors.email?.message}
          id="email"
          label="Email address"
          placeholder="you@example.com"
          type="email"
          {...register("email")}
        />

        <Button className="w-full" isLoading={isSubmitting} type="submit">
          {isSubmitSuccessful ? "Send another link" : "Send recovery link"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-white/48">
        Remembered it?{" "}
        <Link className="font-semibold text-brand-neon hover:text-brand-neon/80" href="/login">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
