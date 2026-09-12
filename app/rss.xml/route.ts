import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const revalidate = 3600

const SITE_URL = 'https://app.hawook.com'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const TYPE_ROUTES: Record<string, string> = {
  article:            '/articles',
  company_profile:    '/profiles',
  developer_profile:  '/profiles',
  area_guide:         '/guides',
  buyer_guide:        '/guides',
}

export async function GET() {
  const { data: articles } = await supabaseAdmin
    .from('blog_articles')
    .select('slug, title, body_mdx, article_type, published_at, seo_description, tags')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50)

  const items = (articles ?? []).map(a => {
    const route = TYPE_ROUTES[a.article_type] ?? '/articles'
    const url = `${SITE_URL}${route}/${a.slug}`
    const description = a.seo_description
      ?? (a.body_mdx ?? '').replace(/[#*\[\]]/g, '').replace(/\n+/g, ' ').trim().slice(0, 255)

    return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(description)}</description>
      ${a.published_at ? `<pubDate>${new Date(a.published_at).toUTCString()}</pubDate>` : ''}
      ${(a.tags ?? []).map((t: string) => `<category>${escapeXml(t)}</category>`).join('\n      ')}
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hawook — Phuket Property Insights</title>
    <link>${SITE_URL}</link>
    <description>Property insights, profiles, and guides for Phuket real estate.</description>
    <language>en-gb</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
