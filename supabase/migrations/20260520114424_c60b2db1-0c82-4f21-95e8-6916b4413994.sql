
CREATE TYPE public.post_status AS ENUM ('pending','approved','published','skipped');

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_x_post TEXT NOT NULL,
  linkedin_version TEXT,
  medium_version TEXT,
  facebook_version TEXT,
  linkedin_status public.post_status NOT NULL DEFAULT 'pending',
  medium_status public.post_status NOT NULL DEFAULT 'pending',
  facebook_status public.post_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users select own posts" ON public.posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX posts_user_id_created_at_idx ON public.posts (user_id, created_at DESC);
