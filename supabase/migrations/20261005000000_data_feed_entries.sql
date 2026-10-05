-- ─────────────────────────────────────────────────────────────
-- Sprint 02 C1 (TC-04): data_feed_entries table
-- Live-data trust-signal feed for homepage and future surfaces
-- Back-out plan: DROP TABLE public.data_feed_entries CASCADE;
-- ─────────────────────────────────────────────────────────────

CREATE TABLE public.data_feed_entries (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_text   TEXT        NOT NULL,
  entry_date   DATE        NOT NULL DEFAULT CURRENT_DATE,
  source_slug  TEXT        REFERENCES public.projects(slug) ON DELETE SET NULL,
  source_url   TEXT,
  created_by   TEXT        NOT NULL DEFAULT 'carly',
  is_published BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER data_feed_entries_updated_at
  BEFORE UPDATE ON public.data_feed_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.data_feed_entries ENABLE ROW LEVEL SECURITY;

-- Anon: read published entries only (for homepage display)
CREATE POLICY "feed_anon_select" ON public.data_feed_entries
  FOR SELECT TO anon
  USING (is_published = true);

-- Authenticated: read all, write all
CREATE POLICY "feed_authed_select" ON public.data_feed_entries
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "feed_authed_insert" ON public.data_feed_entries
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "feed_authed_update" ON public.data_feed_entries
  FOR UPDATE TO authenticated
  USING (true);

-- Index for homepage query (newest published first)
CREATE INDEX idx_data_feed_entries_published_date
  ON public.data_feed_entries (is_published, entry_date DESC, created_at DESC)
  WHERE is_published = true;

-- Note: Carly uses the service_role key (bypasses RLS) for writes via MCP.
-- The authenticated policies above cover Codi + Max direct writes.
