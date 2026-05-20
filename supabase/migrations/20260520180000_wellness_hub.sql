-- Wellness Hub: user conditions, logs, recommendations, recovery progress

create table if not exists public.wellness_conditions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  condition_key text not null,
  severity text not null default 'moderate' check (severity in ('mild', 'moderate', 'severe')),
  status text not null default 'monitoring' check (
    status in ('monitoring', 'improving', 'stable', 'critical', 'recovered')
  ),
  symptoms text[] not null default '{}',
  notes text,
  hydration_target_ml integer not null default 2500 check (hydration_target_ml >= 0),
  sleep_target_hours numeric not null default 8 check (sleep_target_hours >= 0),
  recovery_progress integer not null default 0 check (recovery_progress between 0 and 100),
  stress_impact integer not null default 50 check (stress_impact between 0 and 100),
  energy_impact integer not null default 50 check (energy_impact between 0 and 100),
  skin_impact integer not null default 50 check (skin_impact between 0 and 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, condition_key)
);

create index if not exists wellness_conditions_user_idx
  on public.wellness_conditions (user_id, status, updated_at desc);

create table if not exists public.wellness_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  wellness_condition_id uuid references public.wellness_conditions(id) on delete cascade,
  log_type text not null default 'note' check (log_type in ('symptom', 'note', 'milestone', 'progress')),
  message text not null,
  metadata jsonb,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists wellness_logs_user_logged_idx
  on public.wellness_logs (user_id, logged_at desc);

create table if not exists public.wellness_recommendations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  wellness_condition_id uuid references public.wellness_conditions(id) on delete cascade not null,
  category text not null default 'general',
  title text not null,
  content text not null,
  priority integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists wellness_recommendations_condition_idx
  on public.wellness_recommendations (wellness_condition_id, priority desc);

create table if not exists public.recovery_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  wellness_condition_id uuid references public.wellness_conditions(id) on delete cascade not null,
  recovery_score integer not null default 0 check (recovery_score between 0 and 100),
  energy_score integer not null default 0 check (energy_score between 0 and 100),
  sleep_score integer not null default 0 check (sleep_score between 0 and 100),
  skin_score integer not null default 0 check (skin_score between 0 and 100),
  nutrition_score integer not null default 0 check (nutrition_score between 0 and 100),
  stress_score integer not null default 0 check (stress_score between 0 and 100),
  notes text,
  recorded_on date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (wellness_condition_id, recorded_on)
);

create index if not exists recovery_progress_user_date_idx
  on public.recovery_progress (user_id, recorded_on desc);

-- Migrate legacy health_notes into wellness_conditions
do $$
begin
  if to_regclass('public.health_notes') is not null then
    insert into public.wellness_conditions (
      user_id,
      condition_key,
      severity,
      status,
      symptoms,
      notes,
      recovery_progress,
      created_at,
      updated_at
    )
    select
      user_id,
      condition_key,
      'moderate',
      'monitoring',
      '{}',
      note,
      10,
      created_at,
      updated_at
    from public.health_notes
    where length(trim(note)) > 0
    on conflict (user_id, condition_key) do update set
      notes = excluded.notes,
      updated_at = excluded.updated_at;
  end if;
end $$;

drop trigger if exists wellness_conditions_set_updated_at on public.wellness_conditions;
create trigger wellness_conditions_set_updated_at
  before update on public.wellness_conditions
  for each row execute procedure public.set_updated_at();

alter table public.wellness_conditions enable row level security;
alter table public.wellness_logs enable row level security;
alter table public.wellness_recommendations enable row level security;
alter table public.recovery_progress enable row level security;

drop policy if exists "Users can view their wellness conditions." on public.wellness_conditions;
drop policy if exists "Users can insert their wellness conditions." on public.wellness_conditions;
drop policy if exists "Users can update their wellness conditions." on public.wellness_conditions;
drop policy if exists "Users can delete their wellness conditions." on public.wellness_conditions;

create policy "Users can view their wellness conditions." on public.wellness_conditions
  for select using (auth.uid() = user_id);
create policy "Users can insert their wellness conditions." on public.wellness_conditions
  for insert with check (auth.uid() = user_id);
create policy "Users can update their wellness conditions." on public.wellness_conditions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their wellness conditions." on public.wellness_conditions
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their wellness logs." on public.wellness_logs;
drop policy if exists "Users can insert their wellness logs." on public.wellness_logs;

create policy "Users can view their wellness logs." on public.wellness_logs
  for select using (auth.uid() = user_id);
create policy "Users can insert their wellness logs." on public.wellness_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can view their wellness recommendations." on public.wellness_recommendations;
drop policy if exists "Users can insert their wellness recommendations." on public.wellness_recommendations;
drop policy if exists "Users can delete their wellness recommendations." on public.wellness_recommendations;

create policy "Users can view their wellness recommendations." on public.wellness_recommendations
  for select using (auth.uid() = user_id);
create policy "Users can insert their wellness recommendations." on public.wellness_recommendations
  for insert with check (auth.uid() = user_id);
create policy "Users can delete their wellness recommendations." on public.wellness_recommendations
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their recovery progress." on public.recovery_progress;
drop policy if exists "Users can insert their recovery progress." on public.recovery_progress;
drop policy if exists "Users can update their recovery progress." on public.recovery_progress;

create policy "Users can view their recovery progress." on public.recovery_progress
  for select using (auth.uid() = user_id);
create policy "Users can insert their recovery progress." on public.recovery_progress
  for insert with check (auth.uid() = user_id);
create policy "Users can update their recovery progress." on public.recovery_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
