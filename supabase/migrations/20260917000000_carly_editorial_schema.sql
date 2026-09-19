-- ─────────────────────────────────────────────
-- Carly editorial workflow schema
-- 2026-09-17
-- ─────────────────────────────────────────────
-- 1. Shared trigger function (public schema)
-- 2. authors
-- 3. blog_articles: byline_slug, carly_notes, extended status
-- 4. content_pipeline_feedback
-- 5. RLS policies
-- ─────────────────────────────────────────────


-- ── 0. Shared trigger function ───────────────
-- update_updated_at_column() lives in storage schema, not public.
-- Define our own in public to keep triggers self-contained.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ── 1. authors ───────────────────────────────

CREATE TABLE public.authors (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        UNIQUE NOT NULL,
  display_name    TEXT        NOT NULL,
  beat            TEXT,
  voice_signature TEXT,
  bio             TEXT,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER authors_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Anyone can read authors (public bylines)
CREATE POLICY "authors_public_select" ON public.authors
  FOR SELECT USING (true);

-- Only authenticated users (or service role) may write
CREATE POLICY "authors_authenticated_insert" ON public.authors
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authors_authenticated_update" ON public.authors
  FOR UPDATE TO authenticated USING (true);

-- No delete policy → authenticated users cannot delete rows
-- Service role bypasses RLS and may delete if needed

INSERT INTO public.authors (slug, display_name, beat, voice_signature, is_active) VALUES
  ('alina-voronina',   'Alina Voronina',    'Legal, regulatory, structural',                              'Measured, evidence-first, unafraid of specifics',                true),
  ('marcus-chen',      'Marcus Chen',       'Capital markets, investment, yield analysis',                 'Cool, structural, comfortable with numbers',                     true),
  ('nam-suphachanya',  'Nam Suphachanya',   'Off-plan mechanics, construction, developer operations',      'Technical, patient, ground-level',                               true),
  ('tomas-rivera',     'Tomás Rivera',      'Design, architecture, spatial experience',                    'Thoughtful, sensory, informed',                                  true),
  ('codi-mansbridge',  'Codi Mansbridge',   'Founder-voice thesis pieces only',                           'First-person, considered, deliberate',                           true),
  ('hawook-editorial', 'Hawook Editorial',  'Institutional voice for pieces where no named byline fits',   'Institutional, considered, professional',                        true);


-- ── 2. blog_articles additions ───────────────

-- byline_slug: public attribution; separate from author_id (internal user FK)
ALTER TABLE public.blog_articles
  ADD COLUMN byline_slug TEXT REFERENCES public.authors(slug);

-- Backfill: Thai company crackdown piece → Alina Voronina
UPDATE public.blog_articles
  SET byline_slug = 'alina-voronina'
  WHERE slug = 'thai-company-crackdown-2026-market-impact';

-- carly_notes: revision notes Carly persists with a piece
ALTER TABLE public.blog_articles
  ADD COLUMN carly_notes TEXT;

-- Extend status: drop old constraint, add new one with Carly workflow states
ALTER TABLE public.blog_articles
  DROP CONSTRAINT blog_articles_status_check;

ALTER TABLE public.blog_articles
  ADD CONSTRAINT blog_articles_status_check
    CHECK (status = ANY (ARRAY[
      'draft'::text,
      'pending_carly'::text,
      'carly_reviewing'::text,
      'approved_for_publish'::text,
      'published'::text,
      'archived'::text,
      'needs_pipeline_revision'::text
    ]));


-- ── 3. content_pipeline_feedback ─────────────

CREATE TABLE public.content_pipeline_feedback (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  observation  TEXT        NOT NULL,
  pattern_type TEXT,
  severity     TEXT        CHECK (severity IN ('minor', 'significant', 'critical')),
  proposed_fix TEXT,
  status       TEXT        CHECK (status IN ('open', 'acknowledged', 'addressed', 'wont_fix')) DEFAULT 'open',
  created_by   TEXT        DEFAULT 'carly',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER cpf_updated_at
  BEFORE UPDATE ON public.content_pipeline_feedback
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.content_pipeline_feedback ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all feedback
CREATE POLICY "cpf_authenticated_select" ON public.content_pipeline_feedback
  FOR SELECT TO authenticated USING (true);

-- Authenticated users (and Carly via service role) can insert
CREATE POLICY "cpf_authenticated_insert" ON public.content_pipeline_feedback
  FOR INSERT TO authenticated WITH CHECK (true);

-- Authenticated users can update status / proposed_fix
CREATE POLICY "cpf_authenticated_update" ON public.content_pipeline_feedback
  FOR UPDATE TO authenticated USING (true);

-- No delete policy for authenticated → only service role can clean up rows


-- ── 4. Grant notes ───────────────────────────
-- Carly's MCP connection uses SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- The policies above govern client-side (anon/authenticated) access.
-- Summary of Carly's effective permissions via service role:
--   blog_articles  : SELECT, UPDATE (status, byline_slug, carly_notes, body_mdx) — no DELETE
--   authors        : SELECT — no DELETE
--   content_pipeline_feedback : SELECT, INSERT, UPDATE — no DELETE
--   audit_log      : SELECT (assuming table exists; no writes needed)
-- DELETE prevention for Carly requires a dedicated DB role; deferred until
-- Carly gets her own Postgres role outside the service role.
