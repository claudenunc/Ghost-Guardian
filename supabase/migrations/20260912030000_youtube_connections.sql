-- Ghost Guardian: YouTube OAuth token storage.
--
-- Tokens are written and read ONLY by serverless functions using the Supabase
-- service role key. RLS is enabled with NO policies on purpose, so the anon and
-- authenticated (browser) clients can never read tokens; the service role
-- bypasses RLS. How to run: Supabase Dashboard -> SQL Editor -> paste -> Run.

create table if not exists public.youtube_connections (
  creator_id     text primary key,
  channel_id     text,
  channel_title  text,
  access_token   text not null,
  refresh_token  text,
  token_expiry   timestamptz,
  scopes         text,
  connected_at   timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table public.youtube_connections enable row level security;
-- Intentionally no policies: server-only (service role) access.
