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
          quantity: string;
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
          quantity?: string;
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
          quantity?: string;
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
      food_logs: {
        Row: {
          calories: number;
          created_at: string;
          food_name: string;
          id: string;
          logged_on: string;
          meal_type: "breakfast" | "lunch" | "dinner" | "snacks";
          protein_g: number;
          quantity: string;
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
          quantity?: string;
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
          quantity?: string;
          user_id?: string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "food_logs_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
        ];
      };
      health_condition_notes: {
        Row: {
          acne: string | null;
          created_at: string;
          diabetes: string | null;
          digestion_bloating: string | null;
          gym_muscle_gain: string | null;
          hair_fall: string | null;
          high_bp: string | null;
          knee_pain: string | null;
          low_energy: string | null;
          migraine: string | null;
          pcos: string | null;
          poor_sleep: string | null;
          stress_anxiety: string | null;
          thyroid: string | null;
          updated_at: string;
          user_id: string;
          vitamin_deficiency: string | null;
          weight_gain: string | null;
          weight_loss: string | null;
        };
        Insert: {
          acne?: string | null;
          created_at?: string;
          diabetes?: string | null;
          digestion_bloating?: string | null;
          gym_muscle_gain?: string | null;
          hair_fall?: string | null;
          high_bp?: string | null;
          knee_pain?: string | null;
          low_energy?: string | null;
          migraine?: string | null;
          pcos?: string | null;
          poor_sleep?: string | null;
          stress_anxiety?: string | null;
          thyroid?: string | null;
          updated_at?: string;
          user_id: string;
          vitamin_deficiency?: string | null;
          weight_gain?: string | null;
          weight_loss?: string | null;
        };
        Update: {
          acne?: string | null;
          created_at?: string;
          diabetes?: string | null;
          digestion_bloating?: string | null;
          gym_muscle_gain?: string | null;
          hair_fall?: string | null;
          high_bp?: string | null;
          knee_pain?: string | null;
          low_energy?: string | null;
          migraine?: string | null;
          pcos?: string | null;
          poor_sleep?: string | null;
          stress_anxiety?: string | null;
          thyroid?: string | null;
          updated_at?: string;
          user_id?: string;
          vitamin_deficiency?: string | null;
          weight_gain?: string | null;
          weight_loss?: string | null;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "health_condition_notes_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
        ];
      };
      health_conditions: {
        Row: {
          category: string;
          created_at: string;
          description: string | null;
          display_order: number;
          icon_name: string | null;
          id: string;
          key: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          icon_name?: string | null;
          id?: string;
          key: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          icon_name?: string | null;
          id?: string;
          key?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      health_notes: {
        Row: {
          condition_key: string;
          created_at: string;
          id: string;
          note: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          condition_key: string;
          created_at?: string;
          id?: string;
          note: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          condition_key?: string;
          created_at?: string;
          id?: string;
          note?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "health_notes_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
        ];
      };
      hydration_logs: {
        Row: {
          bmi: number | null;
          created_at: string;
          id: string;
          logged_on: string;
          updated_at: string;
          user_id: string;
          water_ml: number;
          weight_kg: number | null;
        };
        Insert: {
          bmi?: number | null;
          created_at?: string;
          id?: string;
          logged_on?: string;
          updated_at?: string;
          user_id: string;
          water_ml?: number;
          weight_kg?: number | null;
        };
        Update: {
          bmi?: number | null;
          created_at?: string;
          id?: string;
          logged_on?: string;
          updated_at?: string;
          user_id?: string;
          water_ml?: number;
          weight_kg?: number | null;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "hydration_logs_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
        ];
      };
      daily_progress_logs: {
        Row: {
          bmi: number | null;
          created_at: string;
          id: string;
          logged_on: string;
          updated_at: string;
          user_id: string;
          water_ml: number;
          weight_kg: number | null;
        };
        Insert: {
          bmi?: number | null;
          created_at?: string;
          id?: string;
          logged_on?: string;
          updated_at?: string;
          user_id: string;
          water_ml?: number;
          weight_kg?: number | null;
        };
        Update: {
          bmi?: number | null;
          created_at?: string;
          id?: string;
          logged_on?: string;
          updated_at?: string;
          user_id?: string;
          water_ml?: number;
          weight_kg?: number | null;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "daily_progress_logs_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
        ];
      };
      ai_assistant_messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          model: string | null;
          role: "user" | "assistant";
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          model?: string | null;
          role: "user" | "assistant";
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          model?: string | null;
          role?: "user" | "assistant";
          user_id?: string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "ai_assistant_messages_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
        ];
      };
      ai_assistant_rate_limits: {
        Row: {
          message_count: number;
          updated_at: string;
          user_id: string;
          window_start: string;
        };
        Insert: {
          message_count?: number;
          updated_at?: string;
          user_id: string;
          window_start: string;
        };
        Update: {
          message_count?: number;
          updated_at?: string;
          user_id?: string;
          window_start?: string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "ai_assistant_rate_limits_user_id_fkey";
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

      workout_plans: {
        Row: {
          user_id: string;
          difficulty: "beginner" | "intermediate" | "advanced";
          mode: "home" | "gym";
          weekly_schedule: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          difficulty: "beginner" | "intermediate" | "advanced";
          mode: "home" | "gym";
          weekly_schedule: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          difficulty?: "beginner" | "intermediate" | "advanced";
          mode?: "home" | "gym";
          weekly_schedule?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "workout_plans_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
        ];
      };

      sleep_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_on: string;
          duration_hours: number;
          quality_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_on?: string;
          duration_hours: number;
          quality_score: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          logged_on?: string;
          duration_hours?: number;
          quality_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "sleep_logs_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
        ];
      };

      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          logged_on: string;
          workout_name: string;
          duration_minutes: number;
          calories_burned: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_on?: string;
          workout_name: string;
          duration_minutes: number;
          calories_burned?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          logged_on?: string;
          workout_name?: string;
          duration_minutes?: number;
          calories_burned?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "workout_sessions_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
        ];
      };

      ai_chat_history: {
        Row: {
          id: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          model: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: "user" | "assistant";
          content: string;
          model?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: "user" | "assistant";
          content?: string;
          model?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "ai_chat_history_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
        ];
      };

      diet_planner_preferences: {
        Row: {
          user_id: string;
          goal: "bulking" | "fat_loss" | "lean_bulk" | "weight_gain" | "maintenance";
          preferred_foods: string[];
          diet_filter: "veg" | "non_veg";
          indian_food_priority: boolean;
          affordability: "budget" | "moderate" | "flexible";
          generated_plan: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          goal: "bulking" | "fat_loss" | "lean_bulk" | "weight_gain" | "maintenance";
          preferred_foods?: string[];
          diet_filter?: "veg" | "non_veg";
          indian_food_priority?: boolean;
          affordability?: "budget" | "moderate" | "flexible";
          generated_plan?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          goal?: "bulking" | "fat_loss" | "lean_bulk" | "weight_gain" | "maintenance";
          preferred_foods?: string[];
          diet_filter?: "veg" | "non_veg";
          indian_food_priority?: boolean;
          affordability?: "budget" | "moderate" | "flexible";
          generated_plan?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "diet_planner_preferences_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
        ];
      };

      food_images: {
        Row: {
          id: string;
          user_id: string;
          food_log_id: string | null;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_log_id?: string | null;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          food_log_id?: string | null;
          image_url?: string;
          created_at?: string;
        };
        Relationships: [
          {
            columns: ["user_id"];
            foreignKeyName: "food_images_user_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "profiles";
          },
          {
            columns: ["food_log_id"];
            foreignKeyName: "food_images_food_log_id_fkey";
            referencedColumns: ["id"];
            referencedRelation: "food_logs";
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
