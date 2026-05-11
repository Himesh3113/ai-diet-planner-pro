-- AI Diet Planner Pro - Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends Supabase Auth Users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text check (role in ('user', 'admin')) default 'user',
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Onboarding / User Metrics Table
create table public.user_metrics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  height numeric, -- in cm
  weight numeric, -- in kg
  age integer,
  gender text check (gender in ('male', 'female', 'other')),
  goal text check (goal in ('weight_loss', 'muscle_gain', 'maintenance', 'healthy_lifestyle', 'bulking', 'cutting')),
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  allergies text[], -- array of allergies
  food_preferences text[],
  diet_type text check (diet_type in ('veg', 'non_veg', 'vegan', 'keto', 'paleo')),
  training_type text check (training_type in ('gym', 'home', 'none')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_metrics enable row level security;

-- Profiles Policies
create policy "Users can view their own profile."
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Metrics Policies
create policy "Users can view their own metrics."
  on public.user_metrics for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own metrics."
  on public.user_metrics for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own metrics."
  on public.user_metrics for update
  using ( auth.uid() = user_id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Phase 2 safe onboarding/profile extension.
-- Run this section in Supabase SQL editor if your project already has the Phase 1 schema.
alter table public.user_metrics
  add column if not exists training_preference text,
  add column if not exists gym_category text,
  add column if not exists non_gym_category text;

alter table public.user_metrics
  drop constraint if exists user_metrics_goal_check;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_metrics_goal_check'
  ) then
    alter table public.user_metrics
      add constraint user_metrics_goal_check
      check (
        goal in (
          'weight_loss',
          'muscle_gain',
          'maintenance',
          'healthy_lifestyle',
          'bulking',
          'cutting',
          'muscle_building',
          'fat_loss',
          'lean_bulk',
          'strength_training',
          'weight_gain',
          'diabetic_diet',
          'maintenance_diet'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'user_metrics_training_preference_check'
  ) then
    alter table public.user_metrics
      add constraint user_metrics_training_preference_check
      check (training_preference in ('gym', 'non_gym'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'user_metrics_gym_category_check'
  ) then
    alter table public.user_metrics
      add constraint user_metrics_gym_category_check
      check (
        gym_category is null
        or gym_category in (
          'bulking',
          'cutting',
          'muscle_building',
          'fat_loss',
          'lean_bulk',
          'strength_training'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'user_metrics_non_gym_category_check'
  ) then
    alter table public.user_metrics
      add constraint user_metrics_non_gym_category_check
      check (
        non_gym_category is null
        or non_gym_category in (
          'weight_loss',
          'weight_gain',
          'healthy_lifestyle',
          'diabetic_diet',
          'maintenance_diet'
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can insert their own profile.'
  ) then
    create policy "Users can insert their own profile."
      on public.profiles for insert
      with check ( auth.uid() = id );
  end if;
end $$;
