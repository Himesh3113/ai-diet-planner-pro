"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  activityLevels,
  commonAllergies,
  commonFoodPreferences,
  dietTypes,
  genders,
  gymCategories,
  nonGymCategories,
  trainingPreferences,
} from "@/lib/onboarding-options";
import { onboardingSchema, type OnboardingValues } from "@/lib/onboarding-schema";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/lib/supabase/types";

type MetricsRow = Database["public"]["Tables"]["user_metrics"]["Row"];
type MetricsInsert = Database["public"]["Tables"]["user_metrics"]["Insert"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type OnboardingFormProps = {
  email: string;
  metrics?: MetricsRow | null;
  mode?: "onboarding" | "profile";
  profile?: Pick<ProfileRow, "full_name"> | null;
  userId: string;
};

const steps = [
  {
    description: "Tell us the basics we need to size your plan.",
    fields: ["fullName", "age", "height", "weight", "gender"] as const,
    title: "Body profile",
  },
  {
    description: "Pick the direction and training category for your nutrition profile.",
    fields: ["activityLevel", "dietType", "trainingPreference", "gymCategory", "nonGymCategory"] as const,
    title: "Fitness direction",
  },
  {
    description: "Food constraints and preferences keep future recommendations relevant.",
    fields: ["allergies", "foodPreferences"] as const,
    title: "Food preferences",
  },
] as const;

function toList(value?: null | string[]) {
  return Array.isArray(value) ? value : [];
}

function getInitialValues({
  metrics,
  profile,
}: Pick<OnboardingFormProps, "metrics" | "profile">): OnboardingValues {
  const trainingPreference =
    metrics?.training_preference ?? (metrics?.training_type === "gym" ? "gym" : "non_gym");

  return {
    activityLevel: metrics?.activity_level ?? "moderate",
    age: metrics?.age ?? 25,
    allergies: toList(metrics?.allergies),
    dietType: metrics?.diet_type ?? "veg",
    foodPreferences: toList(metrics?.food_preferences),
    fullName: profile?.full_name ?? "",
    gender: metrics?.gender ?? "male",
    gymCategory: metrics?.gym_category ?? "muscle_building",
    height: Number(metrics?.height ?? 170),
    nonGymCategory: metrics?.non_gym_category ?? "healthy_lifestyle",
    trainingPreference,
    weight: Number(metrics?.weight ?? 70),
  };
}

function ChoiceGrid({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  onChange: (value: string) => void;
  options: readonly { label: string; value: string }[];
  value?: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            className={cn(
              "flex min-h-12 items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-bold transition",
              active
                ? "border-brand-neon/55 bg-brand-neon/12 text-brand-neon"
                : "border-white/10 bg-white/[0.04] text-white/62 hover:border-white/20 hover:bg-white/[0.07] hover:text-white",
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
            {active ? <Check className="h-4 w-4" /> : null}
          </button>
        );
      })}
      <input name={name} type="hidden" value={value ?? ""} />
    </div>
  );
}

function MultiSelectPills({
  onChange,
  options,
  value,
}: {
  onChange: (value: string[]) => void;
  options: readonly string[];
  value: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option);

        return (
          <button
            className={cn(
              "rounded-full border px-3 py-2 text-xs font-bold transition",
              active
                ? "border-brand-blue/55 bg-brand-blue/12 text-brand-blue"
                : "border-white/10 bg-white/[0.04] text-white/52 hover:border-white/20 hover:text-white",
            )}
            key={option}
            onClick={() =>
              onChange(active ? value.filter((item) => item !== option) : [...value, option])
            }
            type="button"
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function OnboardingForm({
  email,
  metrics,
  mode = "onboarding",
  profile,
  userId,
}: OnboardingFormProps) {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { toast } = useToast();
  const defaultValues = useMemo(() => getInitialValues({ metrics, profile }), [metrics, profile]);
  const {
    control,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    setValue,
    trigger,
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues,
  });

  const trainingPreference = useWatch({ control, name: "trainingPreference" });
  const progress = ((step + 1) / steps.length) * 100;

  async function goNext() {
    const valid = await trigger(steps[step].fields);
    if (valid) {
      setStep((current) => Math.min(current + 1, steps.length - 1));
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    const supabase = createClient();
    const now = new Date().toISOString();
    const goal = (values.trainingPreference === "gym"
      ? values.gymCategory
      : values.nonGymCategory) as MetricsInsert["goal"];

    const profilePayload: Database["public"]["Tables"]["profiles"]["Insert"] = {
      email,
      full_name: values.fullName,
      id: userId,
      onboarding_completed: true,
      updated_at: now,
    };

    const metricsPayload: MetricsInsert = {
      user_id: userId,
      activity_level: values.activityLevel,
      age: values.age,
      allergies: values.allergies,
      diet_type: values.dietType as MetricsInsert["diet_type"],
      food_preferences: values.foodPreferences,
      gender: values.gender,
      goal,
      gym_category:
        values.trainingPreference === "gym"
          ? (values.gymCategory as MetricsInsert["gym_category"])
          : null,
      height: values.height,
      non_gym_category:
        values.trainingPreference === "non_gym"
          ? (values.nonGymCategory as MetricsInsert["non_gym_category"])
          : null,
      training_preference: values.trainingPreference,
      training_type: values.trainingPreference === "gym" ? "gym" : "home",
      updated_at: now,
      weight: values.weight,
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileError) {
      toast({
        title: "Profile save failed",
        description: profileError.message,
        variant: "error",
      });
      return;
    }

    const { error: metricsError } = await supabase
      .from("user_metrics")
      .upsert(metricsPayload, { onConflict: "user_id" });

    if (metricsError) {
      toast({
        title: "Onboarding save failed",
        description: metricsError.message,
        variant: "error",
      });
      return;
    }

    toast({
      title: mode === "profile" ? "Profile updated" : "Onboarding complete",
      description:
        mode === "profile"
          ? "Your preferences are now up to date."
          : "Your dashboard is ready for the next phase.",
      variant: "success",
    });
    router.push(mode === "profile" ? "/profile" : "/dashboard");
    router.refresh();
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-neon">
          {mode === "profile" ? "Profile system" : "Phase 2 onboarding"}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          {mode === "profile" ? "Edit your profile" : "Build your nutrition profile"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/52">
          These details power the profile system only. AI meal planning remains disabled.
        </p>
      </div>

      <div className="glass overflow-hidden rounded-lg border border-white/[0.08]">
        <div className="border-b border-white/[0.08] p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                Step {step + 1} of {steps.length}
              </p>
              <h2 className="mt-2 text-xl font-black text-white">{steps[step].title}</h2>
            </div>
            <div className="text-right text-sm font-bold text-brand-neon">
              {Math.round(progress)}%
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-brand-neon transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[430px] p-5 sm:p-6"
            initial={{ opacity: 0, y: 12 }}
            key={step}
            transition={{ duration: 0.22 }}
          >
            <p className="mb-6 text-sm leading-6 text-white/48">{steps[step].description}</p>

            {step === 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  autoComplete="name"
                  error={errors.fullName?.message}
                  id="fullName"
                  label="Name"
                  placeholder="Your full name"
                  type="text"
                  {...register("fullName")}
                />
                <Input
                  error={errors.age?.message}
                  id="age"
                  label="Age"
                  min={12}
                  type="number"
                  {...register("age", { valueAsNumber: true })}
                />
                <Input
                  error={errors.height?.message}
                  id="height"
                  label="Height (cm)"
                  min={90}
                  type="number"
                  {...register("height", { valueAsNumber: true })}
                />
                <Input
                  error={errors.weight?.message}
                  id="weight"
                  label="Weight (kg)"
                  min={25}
                  type="number"
                  {...register("weight", { valueAsNumber: true })}
                />
                <div className="space-y-3 md:col-span-2">
                  <p className="text-sm font-medium text-white/78">Gender</p>
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <ChoiceGrid
                        name={field.name}
                        onChange={field.onChange}
                        options={genders}
                        value={field.value}
                      />
                    )}
                  />
                  {errors.gender ? (
                    <p className="text-xs font-medium text-red-300">{errors.gender.message}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white/78">Activity level</p>
                  <Controller
                    control={control}
                    name="activityLevel"
                    render={({ field }) => (
                      <ChoiceGrid
                        name={field.name}
                        onChange={field.onChange}
                        options={activityLevels}
                        value={field.value}
                      />
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-white/78">Veg/non-veg preference</p>
                  <Controller
                    control={control}
                    name="dietType"
                    render={({ field }) => (
                      <ChoiceGrid
                        name={field.name}
                        onChange={field.onChange}
                        options={dietTypes}
                        value={field.value}
                      />
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-white/78">Gym or non-gym category</p>
                  <Controller
                    control={control}
                    name="trainingPreference"
                    render={({ field }) => (
                      <ChoiceGrid
                        name={field.name}
                        onChange={(value) => {
                          field.onChange(value);
                          if (value === "gym") {
                            setValue("nonGymCategory", getValues("nonGymCategory"));
                          } else {
                            setValue("gymCategory", getValues("gymCategory"));
                          }
                        }}
                        options={trainingPreferences}
                        value={field.value}
                      />
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-white/78">
                    {trainingPreference === "gym" ? "Gym category" : "Non-gym category"}
                  </p>
                  <Controller
                    control={control}
                    name={trainingPreference === "gym" ? "gymCategory" : "nonGymCategory"}
                    render={({ field }) => (
                      <ChoiceGrid
                        name={field.name}
                        onChange={field.onChange}
                        options={
                          trainingPreference === "gym" ? gymCategories : nonGymCategories
                        }
                        value={field.value}
                      />
                    )}
                  />
                  {trainingPreference === "gym" && errors.gymCategory ? (
                    <p className="text-xs font-medium text-red-300">
                      {errors.gymCategory.message}
                    </p>
                  ) : null}
                  {trainingPreference === "non_gym" && errors.nonGymCategory ? (
                    <p className="text-xs font-medium text-red-300">
                      {errors.nonGymCategory.message}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-8">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white/78">Allergies</p>
                  <Controller
                    control={control}
                    name="allergies"
                    render={({ field }) => (
                      <MultiSelectPills
                        onChange={field.onChange}
                        options={commonAllergies}
                        value={field.value}
                      />
                    )}
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white/78">Food preferences</p>
                  <Controller
                    control={control}
                    name="foodPreferences"
                    render={({ field }) => (
                      <MultiSelectPills
                        onChange={field.onChange}
                        options={commonFoodPreferences}
                        value={field.value}
                      />
                    )}
                  />
                </div>
              </div>
            ) : null}
          </motion.div>

          <div className="flex flex-col gap-3 border-t border-white/[0.08] p-5 sm:flex-row sm:justify-between sm:p-6">
            <Button
              disabled={step === 0 || isSubmitting}
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              type="button"
              variant="secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step < steps.length - 1 ? (
              <Button onClick={goNext} type="button">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {mode === "profile" ? "Save profile" : "Finish onboarding"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
