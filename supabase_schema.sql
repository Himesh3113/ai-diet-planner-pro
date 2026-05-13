-- AI Diet Planner Pro - Comprehensive Supabase Schema
-- This script ensures all tables, columns, and constraints are correctly set up for Phase 2.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends Supabase Auth Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text check (role in ('user', 'admin')) default 'user',
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. User Metrics Table
create table if not exists public.user_metrics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  height numeric, -- in cm
  weight numeric, -- in kg
  age integer,
  gender text check (gender in ('male', 'female', 'other')),
  goal text,
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  allergies text[], -- array of allergies
  food_preferences text[],
  diet_type text check (diet_type in ('veg', 'non_veg', 'vegan', 'keto', 'paleo')),
  training_type text check (training_type in ('gym', 'home', 'none')),
  training_preference text check (training_preference in ('gym', 'non_gym')),
  gym_category text check (gym_category in ('bulking', 'cutting', 'muscle_building', 'fat_loss', 'lean_bulk', 'strength_training')),
  non_gym_category text check (non_gym_category in ('weight_loss', 'weight_gain', 'healthy_lifestyle', 'diabetic_diet', 'maintenance_diet')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Robustly add missing columns for existing tables
do $$
begin
  -- Activity Level
  if not exists (select 1 from information_schema.columns where table_name='user_metrics' and column_name='activity_level') then
    alter table public.user_metrics add column activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active'));
  end if;
  
  -- Training Preference
  if not exists (select 1 from information_schema.columns where table_name='user_metrics' and column_name='training_preference') then
    alter table public.user_metrics add column training_preference text check (training_preference in ('gym', 'non_gym'));
  end if;

  -- Gym Category
  if not exists (select 1 from information_schema.columns where table_name='user_metrics' and column_name='gym_category') then
    alter table public.user_metrics add column gym_category text check (gym_category in ('bulking', 'cutting', 'muscle_building', 'fat_loss', 'lean_bulk', 'strength_training'));
  end if;

  -- Non Gym Category
  if not exists (select 1 from information_schema.columns where table_name='user_metrics' and column_name='non_gym_category') then
    alter table public.user_metrics add column non_gym_category text check (non_gym_category in ('weight_loss', 'weight_gain', 'healthy_lifestyle', 'diabetic_diet', 'maintenance_diet'));
  end if;
end $$;

-- 4. Update goal constraint to be more inclusive for Phase 2
alter table public.user_metrics drop constraint if exists user_metrics_goal_check;
alter table public.user_metrics add constraint user_metrics_goal_check check (
  goal in (
    'weight_loss', 'muscle_gain', 'maintenance', 'healthy_lifestyle', 'bulking', 'cutting',
    'muscle_building', 'fat_loss', 'lean_bulk', 'strength_training', 'weight_gain',
    'diabetic_diet', 'maintenance_diet'
  )
);

-- 5. Ensure UNIQUE constraint on user_id (Required for upsert)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_metrics_user_id_key'
  ) then
    alter table public.user_metrics add constraint user_metrics_user_id_key unique (user_id);
  end if;
end $$;

-- 6. Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.user_metrics enable row level security;

-- Drop existing policies to ensure clean state
drop policy if exists "Users can view their own profile." on public.profiles;
drop policy if exists "Users can update their own profile." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can view their own metrics." on public.user_metrics;
drop policy if exists "Users can insert their own metrics." on public.user_metrics;
drop policy if exists "Users can update their own metrics." on public.user_metrics;

-- Profiles Policies
create policy "Users can view their own profile." on public.profiles for select using ( auth.uid() = id );
create policy "Users can update their own profile." on public.profiles for update using ( auth.uid() = id );
create policy "Users can insert their own profile." on public.profiles for insert with check ( auth.uid() = id );

-- Metrics Policies
create policy "Users can view their own metrics." on public.user_metrics for select using ( auth.uid() = user_id );
create policy "Users can insert their own metrics." on public.user_metrics for insert with check ( auth.uid() = user_id );
create policy "Users can update their own metrics." on public.user_metrics for update using ( auth.uid() = user_id );

-- 7. Trigger to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', ''), 
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Re-create trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. Health Condition Notes (V1)
-- One row per user with notes for each condition.
create table if not exists public.health_condition_notes (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,

  acne text,
  migraine text,
  knee_pain text,
  hair_fall text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'health_condition_notes_set_updated_at'
  ) then
    create trigger health_condition_notes_set_updated_at
      before update on public.health_condition_notes
      for each row execute procedure public.set_updated_at();
  end if;
end $$;

-- Enable RLS
alter table public.health_condition_notes enable row level security;

-- Policies
drop policy if exists "Users can view their own health condition notes." on public.health_condition_notes;
drop policy if exists "Users can insert their own health condition notes." on public.health_condition_notes;
drop policy if exists "Users can update their own health condition notes." on public.health_condition_notes;

create policy "Users can view their own health condition notes." on public.health_condition_notes
  for select using (auth.uid() = user_id);

create policy "Users can insert their own health condition notes." on public.health_condition_notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own health condition notes." on public.health_condition_notes
  for update using (auth.uid() = user_id);

-- 9. Food Entries (Daily food logging)
create table if not exists public.food_entries (
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

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'food_entries'
      and column_name = 'quantity'
  ) then
    alter table public.food_entries add column quantity text not null default '1 serving';
  end if;
end $$;

create index if not exists food_entries_user_logged_on_idx
  on public.food_entries (user_id, logged_on, created_at desc);

alter table public.food_entries enable row level security;

drop policy if exists "Users can view their own food entries." on public.food_entries;
drop policy if exists "Users can insert their own food entries." on public.food_entries;
drop policy if exists "Users can delete their own food entries." on public.food_entries;

create policy "Users can view their own food entries." on public.food_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert their own food entries." on public.food_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own food entries." on public.food_entries
  for delete using (auth.uid() = user_id);
