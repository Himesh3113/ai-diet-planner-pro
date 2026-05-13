export type Json = boolean | null | number | string | Json[] | { [key: string]: Json | undefined };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          onboarding_completed: boolean | null;
          role: "admin" | "user" | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          onboarding_completed?: boolean | null;
          role?: "admin" | "user" | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          onboarding_completed?: boolean | null;
          role?: "admin" | "user" | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      food_entries: {
        Row: {
          calories: number;
          created_at: string;
          food_name: string;
          id: string;
          logged_on: string;
          meal_type: "breakfast" | "lunch" | "dinner" | "snacks";
          protein_g: number;
          user_id: string;
        };
        Insert: {
          calories: number;
          created_at?: string;
          food_name: string;
          id?: string;
          logged_on?: string;
          meal_type: "breakfast" | "lunch" | "dinner" | "snacks";
          protein_g?: number;
          user_id: string;
        };
        Update: {
          calories?: number;
          created_at?: string;
          food_name?: string;
          id?: string;
          logged_on?: string;
          meal_type?: "breakfast" | "lunch" | "dinner" | "snacks";
          protein_g?: number;
          user_id?: string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "food_entries_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
        ];
      };
      user_metrics: {
        Row: {
          activity_level:
            | "active"
            | "light"
            | "moderate"
            | "sedentary"
            | "very_active"
            | null;
          age: number | null;
          allergies: string[] | null;
          created_at: string;
          diet_type: "non_veg" | "veg" | null;
          food_preferences: string[] | null;
          gender: "female" | "male" | "other" | null;
          goal:
            | "bulking"
            | "cutting"
            | "diabetic_diet"
            | "fat_loss"
            | "healthy_lifestyle"
            | "lean_bulk"
            | "maintenance"
            | "maintenance_diet"
            | "muscle_building"
            | "strength_training"
            | "weight_gain"
            | "weight_loss"
            | null;
          gym_category:
            | "bulking"
            | "cutting"
            | "fat_loss"
            | "lean_bulk"
            | "muscle_building"
            | "strength_training"
            | null;
          height: number | null;
          id: string;
          non_gym_category:
            | "diabetic_diet"
            | "healthy_lifestyle"
            | "maintenance_diet"
            | "weight_gain"
            | "weight_loss"
            | null;
          training_preference: "gym" | "non_gym" | null;
          training_type: "gym" | "home" | "none" | null;
          updated_at: string;
          user_id: string;
          weight: number | null;
        };
        Insert: {
          activity_level?:
            | "active"
            | "light"
            | "moderate"
            | "sedentary"
            | "very_active"
            | null;
          age?: number | null;
          allergies?: string[] | null;
          created_at?: string;
          diet_type?: "non_veg" | "veg" | null;
          food_preferences?: string[] | null;
          gender?: "female" | "male" | "other" | null;
          goal?:
            | "bulking"
            | "cutting"
            | "diabetic_diet"
            | "fat_loss"
            | "healthy_lifestyle"
            | "lean_bulk"
            | "maintenance"
            | "maintenance_diet"
            | "muscle_building"
            | "strength_training"
            | "weight_gain"
            | "weight_loss"
            | null;
          gym_category?:
            | "bulking"
            | "cutting"
            | "fat_loss"
            | "lean_bulk"
            | "muscle_building"
            | "strength_training"
            | null;
          height?: number | null;
          id?: string;
          non_gym_category?:
            | "diabetic_diet"
            | "healthy_lifestyle"
            | "maintenance_diet"
            | "weight_gain"
            | "weight_loss"
            | null;
          training_preference?: "gym" | "non_gym" | null;
          training_type?: "gym" | "home" | "none" | null;
          updated_at?: string;
          user_id: string;
          weight?: number | null;
        };
        Update: {
          activity_level?:
            | "active"
            | "light"
            | "moderate"
            | "sedentary"
            | "very_active"
            | null;
          age?: number | null;
          allergies?: string[] | null;
          created_at?: string;
          diet_type?: "non_veg" | "veg" | null;
          food_preferences?: string[] | null;
          gender?: "female" | "male" | "other" | null;
          goal?:
            | "bulking"
            | "cutting"
            | "diabetic_diet"
            | "fat_loss"
            | "healthy_lifestyle"
            | "lean_bulk"
            | "maintenance"
            | "maintenance_diet"
            | "muscle_building"
            | "strength_training"
            | "weight_gain"
            | "weight_loss"
            | null;
          gym_category?:
            | "bulking"
            | "cutting"
            | "fat_loss"
            | "lean_bulk"
            | "muscle_building"
            | "strength_training"
            | null;
          height?: number | null;
          id?: string;
          non_gym_category?:
            | "diabetic_diet"
            | "healthy_lifestyle"
            | "maintenance_diet"
            | "weight_gain"
            | "weight_loss"
            | null;
          training_preference?: "gym" | "non_gym" | null;
          training_type?: "gym" | "home" | "none" | null;
          updated_at?: string;
          user_id?: string;
          weight?: number | null;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "user_metrics_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
