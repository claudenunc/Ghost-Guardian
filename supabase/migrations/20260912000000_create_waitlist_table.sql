-- Ghost Guardian — Public Beta Waitlist Table Migration
CREATE TABLE IF NOT EXISTS public.waitlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  name        TEXT,
  channel_url TEXT,
  referral    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved    BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT their own row (public signup)
CREATE POLICY "waitlist: public insert" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- Only authenticated service role can read/update (admin only)
