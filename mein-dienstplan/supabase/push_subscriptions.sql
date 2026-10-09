-- Web Push für Mein Dienstplan
-- Die App verwendet app_users als Benutzerverwaltung (kein Supabase Auth Login).
-- Dieses Script ist für eine bestehende push_subscriptions-Tabelle ebenfalls geeignet.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Alte FK aus einer früheren Version entfernen und auf app_users umstellen.
alter table public.push_subscriptions
  drop constraint if exists push_subscriptions_user_id_fkey;

alter table public.push_subscriptions
  add constraint push_subscriptions_user_id_fkey
  foreign key (user_id)
  references public.app_users(id)
  on delete cascade;

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

-- Die Tabelle wird ausschließlich über die Edge Functions beschrieben/gelesen.
-- Service-Role-Zugriffe der Edge Functions umgehen RLS.
drop policy if exists "push subscriptions select own" on public.push_subscriptions;
drop policy if exists "push subscriptions insert own" on public.push_subscriptions;
drop policy if exists "push subscriptions update own" on public.push_subscriptions;
drop policy if exists "push subscriptions delete own" on public.push_subscriptions;
