import { z } from "zod";

const activityValues = ["sedentary", "light", "moderate", "active", "very_active"] as const;
const dietValues = ["veg", "non_veg"] as const;
const genderValues = ["male", "female", "other"] as const;
const gymCategoryValues = [
  "bulking",
  "cutting",
  "muscle_building",
  "fat_loss",
  "lean_bulk",
  "strength_training",
] as const;
const nonGymCategoryValues = [
  "weight_loss",
  "weight_gain",
  "healthy_lifestyle",
  "diabetic_diet",
  "maintenance_diet",
] as const;
const trainingValues = ["gym", "non_gym"] as const;

export const onboardingSchema = z
  .object({
    activityLevel: z.enum(activityValues, {
      message: "Choose your activity level.",
    }),
    age: z
      .number({ message: "Enter your age." })
      .int()
      .min(12, "Age must be at least 12.")
      .max(90, "Enter a realistic age."),
    allergies: z.array(z.string()),
    dietType: z.enum(dietValues, {
      message: "Choose veg or non-veg.",
    }),
    foodPreferences: z.array(z.string()),
    fullName: z.string().trim().min(2, "Enter your name."),
    gender: z.enum(genderValues, {
      message: "Choose your gender.",
    }),
    gymCategory: z.string().optional(),
    height: z
      .number({ message: "Enter height in centimeters." })
      .min(90, "Height must be at least 90 cm.")
      .max(240, "Enter height in centimeters."),
    nonGymCategory: z.string().optional(),
    trainingPreference: z.enum(trainingValues, {
      message: "Choose gym or non-gym.",
    }),
    weight: z
      .number({ message: "Enter weight in kilograms." })
      .min(25, "Weight must be at least 25 kg.")
      .max(250, "Enter weight in kilograms."),
  })
  .superRefine((values, context) => {
    if (values.trainingPreference === "gym") {
      if (!gymCategoryValues.includes(values.gymCategory as (typeof gymCategoryValues)[number])) {
        context.addIssue({
          code: "custom",
          message: "Choose a gym category.",
          path: ["gymCategory"],
        });
      }
      return;
    }

    if (
      !nonGymCategoryValues.includes(
        values.nonGymCategory as (typeof nonGymCategoryValues)[number],
      )
    ) {
      context.addIssue({
        code: "custom",
        message: "Choose a non-gym category.",
        path: ["nonGymCategory"],
      });
    }
  });

export type OnboardingValues = z.infer<typeof onboardingSchema>;
