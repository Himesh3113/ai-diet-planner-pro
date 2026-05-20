-- Persist daily routine checklist state in Supabase.

create table if not exists public.routine_checklist_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  logged_on date not null default current_date,
  state jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, logged_on)
);

create index if not exists routine_checklist_logs_user_logged_on_idx
  on public.routine_checklist_logs (user_id, logged_on desc);

drop trigger if exists routine_checklist_logs_set_updated_at on public.routine_checklist_logs;
create trigger routine_checklist_logs_set_updated_at
  before update on public.routine_checklist_logs
  for each row execute procedure public.set_updated_at();

alter table public.routine_checklist_logs enable row level security;

drop policy if exists "Users can view their own routine checklist logs." on public.routine_checklist_logs;
drop policy if exists "Users can insert their own routine checklist logs." on public.routine_checklist_logs;
drop policy if exists "Users can update their own routine checklist logs." on public.routine_checklist_logs;
drop policy if exists "Users can delete their own routine checklist logs." on public.routine_checklist_logs;

create policy "Users can view their own routine checklist logs." on public.routine_checklist_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own routine checklist logs." on public.routine_checklist_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own routine checklist logs." on public.routine_checklist_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own routine checklist logs." on public.routine_checklist_logs
  for delete using (auth.uid() = user_id);
