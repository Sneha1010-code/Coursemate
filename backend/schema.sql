-- CourseMate database schema
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  university text,
  course text,
  tutorial_group text,
  interests text default '',
  bio text default '',
  looking_for text[] default '{}',
  created_at timestamptz not null default now()
);

create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references profiles (id) on delete cascade,
  recipient_id uuid not null references profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  constraint different_users check (requester_id <> recipient_id),
  constraint unique_pair unique (requester_id, recipient_id)
);

create index if not exists idx_profiles_tutorial on profiles (university, course, tutorial_group);
create index if not exists idx_connections_requester on connections (requester_id);
create index if not exists idx_connections_recipient on connections (recipient_id);

-- Row Level Security: enabled, with no policies for anon/authenticated roles.
-- All reads/writes happen through the Python backend using the Supabase
-- service role key (server-side only), which bypasses RLS. The frontend
-- never talks to these tables directly, so no client-facing policy is needed.
alter table profiles enable row level security;
alter table connections enable row level security;
