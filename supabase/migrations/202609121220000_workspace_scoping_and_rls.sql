-- Ghost Guardian: per-creator scoping and Row Level Security for workspace tables
--
-- Purpose: every creator can only read, write and delete their own rows.
-- Idempotent: safe to run more than once. Existing rows and schema are kept.
-- How to run: Supabase Dashboard -> SQL Editor -> paste -> Run.

create extension if not exists pgcrypto;

-- 1. creators table
create table if not exists public.creators (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  display_name text,
  handle text,
  channel_name text,
  plan_tier text default 'free',
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. voice_profiles
create table if not exists public.voice_profiles (
  id text primary key,
  creator_id text references public.creators(id) on delete cascade,
  warmth numeric,
  directness numeric,
  formality numeric,
  humor numeric,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. guardian_policies
create table if not exists public.guardian_policies (
  id text primary key,
  creator_id text references public.creators(id) on delete cascade,
  mode text default 'copilot',
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. comments
create table if not exists public.comments (
  id text primary key,
  creator_id text references public.creators(id) on delete cascade,
  video_id text,
  author text,
  author_handle text,
  text text,
  classification text,
  risk text,
  recommended_action text,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. comment_states
create table if not exists public.comment_states (
  id text primary key,
  comment_id text,
  creator_id text references public.creators(id) on delete cascade,
  status text default 'pending',
  active_tone text default 'warm',
  response_text text,
  was_edited boolean default false,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 6. learning_examples
create table if not exists public.learning_examples (
  id text primary key,
  creator_id text references public.creators(id) on delete cascade,
  before_text text,
  after_text text,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- 7. knowledge_base
create table if not exists public.knowledge_base (
  id text primary key,
  creator_id text references public.creators(id) on delete cascade,
  topic text,
  content text,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 8. activity_log
create table if not exists public.activity_log (
  id text primary key,
  creator_id text references public.creators(id) on delete cascade,
  label text,
  detail text,
  timestamp timestamp with time zone default now(),
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- 9. videos
create table if not exists public.videos (
  id text primary key,
  creator_id text references public.creators(id) on delete cascade,
  title text,
  url text,
  published_at timestamp with time zone,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security on all 9 tables
alter table public.creators enable row level security;
alter table public.voice_profiles enable row level security;
alter table public.guardian_policies enable row level security;
alter table public.comments enable row level security;
alter table public.comment_states enable row level security;
alter table public.learning_examples enable row level security;
alter table public.knowledge_base enable row level security;
alter table public.activity_log enable row level security;
alter table public.videos enable row level security;

-- Create indexes for fast lookup and join performance
create index if not exists idx_creators_user_id on public.creators(user_id);
create index if not exists idx_voice_creator_id on public.voice_profiles(creator_id);
create index if not exists idx_policies_creator_id on public.guardian_policies(creator_id);
create index if not exists idx_comments_creator_id on public.comments(creator_id);
create index if not exists idx_comment_states_creator_id on public.comment_states(creator_id);
create index if not exists idx_learning_creator_id on public.learning_examples(creator_id);
create index if not exists idx_knowledge_creator_id on public.knowledge_base(creator_id);
create index if not exists idx_activity_creator_id on public.activity_log(creator_id);
create index if not exists idx_videos_creator_id on public.videos(creator_id);

-- Helper macro for dropping and recreating policies idempotently
drop policy if exists "creators_manage_own" on public.creators;
create policy "creators_manage_own" on public.creators
  for all
  using (auth.uid() is not null and (user_id = auth.uid() or id = auth.uid()::text))
  with check (auth.uid() is not null and (user_id = auth.uid() or id = auth.uid()::text));

drop policy if exists "voice_profiles_manage_own" on public.voice_profiles;
create policy "voice_profiles_manage_own" on public.voice_profiles
  for all
  using (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())))
  with check (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())));

drop policy if exists "guardian_policies_manage_own" on public.guardian_policies;
create policy "guardian_policies_manage_own" on public.guardian_policies
  for all
  using (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())))
  with check (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())));

drop policy if exists "comments_manage_own" on public.comments;
create policy "comments_manage_own" on public.comments
  for all
  using (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())))
  with check (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())));

drop policy if exists "comment_states_manage_own" on public.comment_states;
create policy "comment_states_manage_own" on public.comment_states
  for all
  using (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())))
  with check (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())));

drop policy if exists "learning_examples_manage_own" on public.learning_examples;
create policy "learning_examples_manage_own" on public.learning_examples
  for all
  using (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())))
  with check (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())));

drop policy if exists "knowledge_base_manage_own" on public.knowledge_base;
create policy "knowledge_base_manage_own" on public.knowledge_base
  for all
  using (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())))
  with check (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())));

drop policy if exists "activity_log_manage_own" on public.activity_log;
create policy "activity_log_manage_own" on public.activity_log
  for all
  using (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())))
  with check (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())));

drop policy if exists "videos_manage_own" on public.videos;
create policy "videos_manage_own" on public.videos
  for all
  using (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())))
  with check (auth.uid() is not null and (creator_id = auth.uid()::text or creator_id in (select id from public.creators where user_id = auth.uid())));
