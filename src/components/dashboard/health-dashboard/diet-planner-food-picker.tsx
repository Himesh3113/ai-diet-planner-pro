"use client";

import { useMemo, useState } from "react";
import { Check, Flame, IndianRupee, Search, Sparkles, Zap } from "lucide-react";
import {
  BUDGET_MEAL_HIGHLIGHTS,
  HIGH_PROTEIN_MEAL_HIGHLIGHTS,
} from "@/lib/diet-planner/meal-combinations";
import type { Affordability, DietFilter, PreferredFoodKey } from "@/lib/diet-planner/constants";
import {
  CUISINE_FILTERS,
  INDIAN_FOOD_CATALOG,
  MEAL_CATEGORY_LABELS,
  matchesAffordability,
  type IndianFoodItem,
  type IndianMealCategory,
} from "@/lib/foods/indian-foods";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | IndianMealCategory;

const QUICK_PRESETS: {
  id: string;
  label: string;
  icon: typeof Zap;
  keys: PreferredFoodKey[];
}[] = [
  {
    id: "budget",
    label: "Budget staples",
    icon: IndianRupee,
    keys: [
      "rice",
      "dal",
      "chapati",
      "idli",
      "poha",
      "eggs",
      "bananas",
      "sprouts",
      "milk",
    ],
  },
  {
    id: "high_protein",
    label: "High protein",
    icon: Flame,
    keys: [
      "eggs",
      "chicken",
      "fish",
      "paneer",
      "soy_chunks",
      "dal",
      "moong_dal",
      "protein_shake",
      "peanut_butter",
    ],
  },
  {
    id: "south_breakfast",
    label: "South Indian breakfast",
    icon: Sparkles,
    keys: ["idli", "dosa", "sambar", "upma", "pongal", "yogurt"],
  },
];

function FoodMacroCard({
  food,
  selected,
  disabled,
  onToggle,
}: {
  food: IndianFoodItem;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "flex flex-col rounded-lg border p-3 text-left transition",
        selected
          ? "border-brand-neon/50 bg-brand-neon/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/20",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-white">{food.name}</p>
          <p className="mt-0.5 text-[10px] text-white/40">{food.serving}</p>
        </div>
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
            selected ? "border-brand-neon bg-brand-neon text-black" : "border-white/25",
          )}
        >
          {selected && <Check className="h-3 w-3" />}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-bold text-brand-neon">
          {food.calories} kcal
        </span>
        <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-white/55">
          P {food.proteinG}g
        </span>
        <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-white/45">
          C {food.carbsG}g
        </span>
        <span className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-white/45">
          F {food.fatsG}g
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="text-[9px] text-white/35">{food.cuisineTag}</span>
        <span className="text-[9px] text-white/25">·</span>
        <span className="text-[9px] capitalize text-white/35">{food.affordability}</span>
        <span className="text-[9px] text-white/25">·</span>
        <span className="text-[9px] text-white/35">
          {food.dietType === "veg" ? "Veg" : "Non-veg"}
        </span>
      </div>
    </button>
  );
}

export function DietPlannerFoodPicker({
  preferredFoods,
  dietFilter,
  affordability,
  disabled,
  onTogglePreferred,
  onApplyPreset,
}: {
  preferredFoods: PreferredFoodKey[];
  dietFilter: DietFilter;
  affordability: Affordability;
  disabled?: boolean;
  onTogglePreferred: (key: PreferredFoodKey) => void;
  onApplyPreset: (keys: PreferredFoodKey[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [cuisine, setCuisine] = useState<string>("All");

  const filteredFoods = useMemo(() => {
    const q = search.trim().toLowerCase();
    return INDIAN_FOOD_CATALOG.filter((food) => {
      if (dietFilter === "veg" && food.dietType !== "veg") return false;
      if (!matchesAffordability(food, affordability)) return false;
      if (category !== "all" && !food.mealCategories.includes(category)) return false;
      if (cuisine !== "All" && food.cuisineTag !== cuisine) return false;
      if (q && !food.name.toLowerCase().includes(q) && !food.cuisineTag.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [search, category, cuisine, dietFilter, affordability]);

  const isPreferredSelected = (food: IndianFoodItem) =>
    preferredFoods.includes(food.preferredKey as PreferredFoodKey);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search foods or cuisine…"
          disabled={disabled}
          className="h-10 w-full rounded-lg border border-white/10 bg-black/30 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:border-brand-neon/40 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setCategory("all")}
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] font-bold transition",
            category === "all"
              ? "border-brand-neon/50 bg-brand-neon/15 text-brand-neon"
              : "border-white/10 text-white/45",
          )}
        >
          All
        </button>
        {(Object.keys(MEAL_CATEGORY_LABELS) as IndianMealCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            disabled={disabled}
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10px] font-bold transition",
              category === cat
                ? "border-brand-neon/50 bg-brand-neon/15 text-brand-neon"
                : "border-white/10 text-white/45",
            )}
          >
            {MEAL_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CUISINE_FILTERS.map((c) => (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onClick={() => setCuisine(c)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10px] font-bold transition",
              cuisine === c
                ? "border-white/25 bg-white/10 text-white"
                : "border-white/10 text-white/40",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onApplyPreset(preset.keys)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-white/70 hover:border-brand-neon/30 hover:text-white"
          >
            <preset.icon className="h-3 w-3 text-brand-neon" />
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid max-h-[320px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {filteredFoods.length === 0 ? (
          <p className="col-span-full py-6 text-center text-xs text-white/40">
            No foods match your filters. Try another category or search.
          </p>
        ) : (
          filteredFoods.map((food) => (
            <FoodMacroCard
              key={food.key}
              food={food}
              selected={isPreferredSelected(food)}
              disabled={disabled}
              onToggle={() => onTogglePreferred(food.preferredKey as PreferredFoodKey)}
            />
          ))
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/5 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300">
            <IndianRupee className="h-3 w-3" />
            Budget-friendly meals
          </p>
          <ul className="mt-2 space-y-1.5">
            {BUDGET_MEAL_HIGHLIGHTS.map((m) => (
              <li key={m.id} className="text-[10px] leading-snug text-white/55">
                <span className="font-semibold text-white/75">{m.title}</span>
                <span className="text-white/35"> — {m.description}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-brand-neon/20 bg-brand-neon/5 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-neon">
            <Flame className="h-3 w-3" />
            High protein Indian meals
          </p>
          <ul className="mt-2 space-y-1.5">
            {HIGH_PROTEIN_MEAL_HIGHLIGHTS.map((m) => (
              <li key={m.id} className="text-[10px] leading-snug text-white/55">
                <span className="font-semibold text-white/75">{m.title}</span>
                <span className="text-white/35"> — {m.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
