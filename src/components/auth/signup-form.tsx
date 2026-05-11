"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/utils/supabase/client";

const signupSchema = z
  .object({
    confirmPassword: z.string().min(8, "Confirm your password."),
    email: z.string().trim().email("Enter a valid email address."),
    fullName: z.string().trim().min(2, "Enter your full name."),
    password: z.string().min(8, "Use at least 8 characters."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      confirmPassword: "",
      email: "",
      fullName: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "error",
      });
      return;
    }

    if (data.session) {
      toast({
        title: "Account created",
        description: "Your dashboard is ready.",
        variant: "success",
      });
      router.push("/dashboard");
      router.refresh();
      return;
    }

    toast({
      title: "Check your inbox",
      description: "Confirm your email address to activate your account.",
      variant: "success",
    });
    router.push("/login?message=Check your inbox to confirm your account.");
  });

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-brand-blue/25 bg-brand-blue/10 text-brand-blue">
          <User className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Create account</h1>
        <p className="mt-2 text-sm leading-6 text-white/52">
          Start with secure access now. Nutrition planning comes in later phases.
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <Input
          autoComplete="name"
          error={errors.fullName?.message}
          id="fullName"
          label="Full name"
          placeholder="Alex Morgan"
          type="text"
          {...register("fullName")}
        />
        <Input
          autoComplete="email"
          error={errors.email?.message}
          id="email"
          label="Email address"
          placeholder="you@example.com"
          type="email"
          {...register("email")}
        />
        <Input
          autoComplete="new-password"
          error={errors.password?.message}
          id="password"
          label="Password"
          placeholder="At least 8 characters"
          type="password"
          {...register("password")}
        />
        <Input
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          id="confirmPassword"
          label="Confirm password"
          placeholder="Repeat your password"
          type="password"
          {...register("confirmPassword")}
        />

        <Button className="w-full" isLoading={isSubmitting} type="submit">
          Create account
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-white/48">
        Already registered?{" "}
        <Link className="font-semibold text-brand-neon hover:text-brand-neon/80" href="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
