-- Dashboard real persistence migration
-- Creates the tables used by food logging, hydration logging, health conditions,
-- health notes, and real-data analytics.

create extension if not exists "uuid-ossp";

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Canonical daily food logging table.
create table if not exists public.food_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snacks')),
  food_name text not null,
  quantity text not null default '1 serving',
  calories integer not null check (calories >= 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  logged_on date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists food_logs_user_logged_on_idx
  on public.food_logs (user_id, logged_on, created_at desc);

-- Carry forward older app rows if the legacy table exists.
do $$
begin
  if to_regclass('public.food_entries') is not null then
    execute '
      insert into public.food_logs (
        id, user_id, meal_type, food_name, quantity, calories, protein_g, logged_on, created_at
      )
      select
        id,
        user_id,
        meal_type,
        food_name,
        coalesce(quantity, ''1 serving''),
        calories,
        coalesce(protein_g, 0),
        logged_on,
        created_at
      from public.food_entries
      on conflict (id) do nothing
    ';
  end if;
end $$;

alter table public.food_logs enable row level security;

drop policy if exists "Users can view their own food logs." on public.food_logs;
drop policy if exists "Users can insert their own food logs." on public.food_logs;
drop policy if exists "Users can update their own food logs." on public.food_logs;
drop policy if exists "Users can delete their own food logs." on public.food_logs;

create policy "Users can view their own food logs." on public.food_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own food logs." on public.food_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own food logs." on public.food_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own food logs." on public.food_logs
  for delete using (auth.uid() = user_id);

-- Canonical hydration table. One row per user per day.
create table if not exists public.hydration_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  logged_on date not null default current_date,
  water_ml integer not null default 0 check (water_ml >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, logged_on)
);

create index if not exists hydration_logs_user_logged_on_idx
  on public.hydration_logs (user_id, logged_on desc);

drop trigger if exists hydration_logs_set_updated_at on public.hydration_logs;
create trigger hydration_logs_set_updated_at
  before update on public.hydration_logs
  for each row execute procedure public.set_updated_at();

alter table public.hydration_logs enable row level security;

drop policy if exists "Users can view their own hydration logs." on public.hydration_logs;
drop policy if exists "Users can insert their own hydration logs." on public.hydration_logs;
drop policy if exists "Users can update their own hydration logs." on public.hydration_logs;
drop policy if exists "Users can delete their own hydration logs." on public.hydration_logs;

create policy "Users can view their own hydration logs." on public.hydration_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own hydration logs." on public.hydration_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own hydration logs." on public.hydration_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own hydration logs." on public.hydration_logs
  for delete using (auth.uid() = user_id);

-- Master list of supported health conditions.
create table if not exists public.health_conditions (
  id uuid default uuid_generate_v4() primary key,
  key text not null unique,
  title text not null,
  category text not null default 'wellness',
  description text,
  icon_name text,
  display_order integer not null default 100,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

drop trigger if exists health_conditions_set_updated_at on public.health_conditions;
create trigger health_conditions_set_updated_at
  before update on public.health_conditions
  for each row execute procedure public.set_updated_at();

insert into public.health_conditions (key, title, category, description, icon_name, display_order)
values
  ('acne', 'Acne', 'skin', 'Lower-glycemic meals, zinc, omega-3 fats, and trigger tracking.', 'sparkles', 10),
  ('hair_fall', 'Hair fall', 'hair', 'Protein, iron, zinc, vitamin D, and thyroid-aware consistency.', 'activity', 20),
  ('knee_pain', 'Knee pain', 'joint', 'Anti-inflammatory foods, protein for tissue repair, and load management.', 'bone', 30),
  ('migraine', 'Migraine', 'neurology', 'Hydration, regular meals, magnesium-rich foods, and trigger consistency.', 'brain', 40),
  ('weight_loss', 'Weight loss', 'weight', 'High satiety, high protein, fiber, and controlled portions.', 'scale', 50),
  ('weight_gain', 'Weight gain', 'weight', 'Calorie-dense but nutritious meals with protein at every feed.', 'scale', 60),
  ('pcos', 'PCOS', 'hormonal', 'Insulin-aware meals, protein, fiber, and steady strength training.', 'heart-pulse', 70),
  ('diabetes', 'Diabetes', 'metabolic', 'Carb quality, portion consistency, protein pairing, and glucose monitoring.', 'activity', 80),
  ('high_bp', 'High BP', 'cardio', 'Lower sodium, more potassium-rich foods, and daily movement.', 'heart-pulse', 90),
  ('thyroid', 'Thyroid', 'hormonal', 'Adequate protein, iodine/selenium food sources, and medication timing awareness.', 'activity', 100),
  ('low_energy', 'Low energy', 'energy', 'Regular meals with carbs, protein, iron, B12, hydration, and sleep.', 'zap', 110),
  ('poor_sleep', 'Poor sleep', 'sleep', 'Earlier caffeine cutoff, light dinner, magnesium-rich foods, and routine.', 'moon', 120),
  ('stress_anxiety', 'Stress/anxiety', 'mental', 'Stable blood sugar, magnesium foods, caffeine limits, and gentle routines.', 'brain', 130),
  ('gym_muscle_gain', 'Gym muscle gain', 'fitness', 'Protein distribution, carbs around training, and progressive overload.', 'dumbbell', 140),
  ('digestion_bloating', 'Digestion/bloating', 'digestion', 'Gentle meals, fiber titration, hydration, and trigger identification.', 'salad', 150),
  ('vitamin_deficiency', 'Vitamin deficiency', 'micronutrients', 'Food-first micronutrient coverage and lab-guided supplementation.', 'pill', 160)
on conflict (key) do update set
  title = excluded.title,
  category = excluded.category,
  description = excluded.description,
  icon_name = excluded.icon_name,
  display_order = excluded.display_order,
  updated_at = timezone('utc'::text, now());

alter table public.health_conditions enable row level security;

drop policy if exists "Authenticated users can view health conditions." on public.health_conditions;
create policy "Authenticated users can view health conditions." on public.health_conditions
  for select to authenticated using (true);

-- User notes, normalized by condition. This replaces the old wide health_condition_notes table.
create table if not exists public.health_notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  condition_key text not null references public.health_conditions(key) on update cascade on delete restrict,
  note text not null check (length(trim(note)) > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, condition_key)
);

create index if not exists health_notes_user_condition_idx
  on public.health_notes (user_id, condition_key);

drop trigger if exists health_notes_set_updated_at on public.health_notes;
create trigger health_notes_set_updated_at
  before update on public.health_notes
  for each row execute procedure public.set_updated_at();

-- Migrate old wide notes if present.
do $$
declare
  condition text;
begin
  if to_regclass('public.health_condition_notes') is not null then
    foreach condition in array array[
      'acne', 'migraine', 'knee_pain', 'hair_fall', 'weight_loss', 'weight_gain',
      'pcos', 'diabetes', 'high_bp', 'thyroid', 'low_energy', 'poor_sleep',
      'stress_anxiety', 'gym_muscle_gain', 'digestion_bloating', 'vitamin_deficiency'
    ]
    loop
      execute format(
        'insert into public.health_notes (user_id, condition_key, note, created_at, updated_at)
         select user_id, %L, trim(%I), created_at, updated_at
         from public.health_condition_notes
         where %I is not null and length(trim(%I)) > 0
         on conflict (user_id, condition_key) do update set
           note = excluded.note,
           updated_at = excluded.updated_at',
        condition,
        condition,
        condition,
        condition
      );
    end loop;
  end if;
end $$;

alter table public.health_notes enable row level security;

drop policy if exists "Users can view their own health notes." on public.health_notes;
drop policy if exists "Users can insert their own health notes." on public.health_notes;
drop policy if exists "Users can update their own health notes." on public.health_notes;
drop policy if exists "Users can delete their own health notes." on public.health_notes;

create policy "Users can view their own health notes." on public.health_notes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own health notes." on public.health_notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own health notes." on public.health_notes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own health notes." on public.health_notes
  for delete using (auth.uid() = user_id);
