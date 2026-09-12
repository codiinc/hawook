-- Migration: add article_type and hero_image_url to blog_articles
-- Applied 2026-09-12 to production via execute_sql

ALTER TABLE blog_articles
  ADD COLUMN IF NOT EXISTS article_type TEXT
    CHECK (article_type IN ('article','company_profile','developer_profile','area_guide','buyer_guide'))
    DEFAULT 'article';

ALTER TABLE blog_articles
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Route mapping:
--   'article'            → /articles/[slug]
--   'company_profile'    → /profiles/[slug]
--   'developer_profile'  → /profiles/[slug]
--   'area_guide'         → /guides/[slug]
--   'buyer_guide'        → /guides/[slug]
