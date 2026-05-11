"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/utils/supabase/client";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "error",
      });
      return;
    }

    toast({
      title: "Welcome back",
      description: "Your dashboard is loading now.",
      variant: "success",
    });
    router.push("/dashboard");
    router.refresh();
  });

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-brand-neon/25 bg-brand-neon/10 text-brand-neon">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-white/52">
          Sign in to continue building your fitness nutrition system.
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
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="block text-sm font-medium text-white/78">
              Password
            </label>
            <Link
              className="text-sm font-semibold text-brand-neon transition hover:text-brand-neon/80"
              href="/forgot-password"
            >
              Forgot password
            </Link>
          </div>
          <Input
            autoComplete="current-password"
            error={errors.password?.message}
            id="password"
            placeholder="Enter your password"
            type="password"
            {...register("password")}
          />
        </div>

        <Button className="w-full" isLoading={isSubmitting} type="submit">
          Sign in
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-white/48">
        Need an account?{" "}
        <Link className="font-semibold text-brand-neon hover:text-brand-neon/80" href="/signup">
          Create one
        </Link>
      </p>
    </div>
  );
}
