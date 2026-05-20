-- Diet Planner: user preferences + generated meal plans (separate tables)

create table if not exists public.user_diet_preferences (
  user_id uuid references auth.users(id) on delete cascade not null primary key,
  goal text not null check (
    goal in ('bulking', 'fat_loss', 'lean_bulk', 'weight_gain', 'maintenance')
  ),
  preferred_foods text[] not null default '{}',
  diet_filter text not null default 'veg' check (diet_filter in ('veg', 'non_veg')),
  indian_food_priority boolean not null default true,
  affordability text not null default 'moderate' check (
    affordability in ('budget', 'moderate', 'flexible')
  ),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.generated_diet_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  meal_plan jsonb not null,
  source text not null default 'fallback' check (source in ('ai', 'fallback')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists generated_diet_plans_user_created_idx
  on public.generated_diet_plans (user_id, created_at desc);

drop trigger if exists user_diet_preferences_set_updated_at on public.user_diet_preferences;
create trigger user_diet_preferences_set_updated_at
  before update on public.user_diet_preferences
  for each row execute procedure public.set_updated_at();

drop trigger if exists generated_diet_plans_set_updated_at on public.generated_diet_plans;
create trigger generated_diet_plans_set_updated_at
  before update on public.generated_diet_plans
  for each row execute procedure public.set_updated_at();

-- Migrate legacy single-table data if present
do $$
begin
  if to_regclass('public.diet_planner_preferences') is not null then
    insert into public.user_diet_preferences (
      user_id,
      goal,
      preferred_foods,
      diet_filter,
      indian_food_priority,
      affordability,
      created_at,
      updated_at
    )
    select
      user_id,
      goal,
      preferred_foods,
      diet_filter,
      indian_food_priority,
      affordability,
      created_at,
      updated_at
    from public.diet_planner_preferences
    on conflict (user_id) do update set
      goal = excluded.goal,
      preferred_foods = excluded.preferred_foods,
      diet_filter = excluded.diet_filter,
      indian_food_priority = excluded.indian_food_priority,
      affordability = excluded.affordability,
      updated_at = excluded.updated_at;

    insert into public.generated_diet_plans (user_id, meal_plan, source, created_at, updated_at)
    select
      user_id,
      generated_plan,
      'fallback',
      updated_at,
      updated_at
    from public.diet_planner_preferences
    where generated_plan is not null;
  end if;
end $$;

alter table public.user_diet_preferences enable row level security;
alter table public.generated_diet_plans enable row level security;

-- user_diet_preferences policies
drop policy if exists "Users can view their own diet preferences." on public.user_diet_preferences;
drop policy if exists "Users can insert their own diet preferences." on public.user_diet_preferences;
drop policy if exists "Users can update their own diet preferences." on public.user_diet_preferences;

create policy "Users can view their own diet preferences." on public.user_diet_preferences
  for select using (auth.uid() = user_id);

create policy "Users can insert their own diet preferences." on public.user_diet_preferences
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own diet preferences." on public.user_diet_preferences
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- generated_diet_plans policies
drop policy if exists "Users can view their own generated diet plans." on public.generated_diet_plans;
drop policy if exists "Users can insert their own generated diet plans." on public.generated_diet_plans;
drop policy if exists "Users can update their own generated diet plans." on public.generated_diet_plans;

create policy "Users can view their own generated diet plans." on public.generated_diet_plans
  for select using (auth.uid() = user_id);

create policy "Users can insert their own generated diet plans." on public.generated_diet_plans
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own generated diet plans." on public.generated_diet_plans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
