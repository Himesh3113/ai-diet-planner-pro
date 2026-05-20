-- Diet Planner preferences & generated plans (one row per user)
create table if not exists public.diet_planner_preferences (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  goal text not null check (
    goal in ('bulking', 'fat_loss', 'lean_bulk', 'weight_gain', 'maintenance')
  ),
  preferred_foods text[] not null default '{}',
  diet_filter text not null default 'veg' check (diet_filter in ('veg', 'non_veg')),
  indian_food_priority boolean not null default true,
  affordability text not null default 'moderate' check (
    affordability in ('budget', 'moderate', 'flexible')
  ),
  generated_plan jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.diet_planner_preferences enable row level security;

drop policy if exists "Users can view their own diet planner preferences." on public.diet_planner_preferences;
drop policy if exists "Users can insert their own diet planner preferences." on public.diet_planner_preferences;
drop policy if exists "Users can update their own diet planner preferences." on public.diet_planner_preferences;

create policy "Users can view their own diet planner preferences." on public.diet_planner_preferences
  for select using (auth.uid() = user_id);

create policy "Users can insert their own diet planner preferences." on public.diet_planner_preferences
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own diet planner preferences." on public.diet_planner_preferences
  for update using (auth.uid() = user_id);
