import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface FeedEntry {
  id: string
  entry_text: string
  entry_date: string
  source_slug: string | null
  source_url: string | null
  created_by: string
}

function relativeDate(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays <= 6) return `${diffDays} days ago`
  if (diffDays <= 13) return 'Last week'
  if (diffDays <= 20) return '2 weeks ago'
  if (diffDays <= 27) return '3 weeks ago'
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths <= 1) return 'Last month'
  if (diffMonths < 12) return `${diffMonths} months ago`
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export async function DataFeedSection() {
  let entries: FeedEntry[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('data_feed_entries')
      .select('id, entry_text, entry_date, source_slug, source_url, created_by')
      .eq('is_published', true)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10)

    entries = (data ?? []) as FeedEntry[]
  } catch {
    // Table may not exist yet in dev; hide the section gracefully
    return null
  }

  if (entries.length === 0) return null

  return (
    <section style={{ background: 'var(--bg-tint)', borderTop: '1px solid var(--rule)' }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--space-10) var(--gutter)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-8)', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display-4)',
            fontWeight: 'var(--fw-medium)',
            color: 'var(--text-brand)',
            margin: 0,
            lineHeight: 'var(--lh-title)',
          }}>
            Latest from the catalogue
          </h2>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
            Updated as we review
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                gap: 'var(--space-5)',
                padding: 'var(--space-5) 0',
                borderBottom: i < entries.length - 1 ? '1px solid var(--rule)' : 'none',
                alignItems: 'baseline',
              }}
            >
              {/* Date pill */}
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                color: 'var(--text-tertiary)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                minWidth: 80,
              }}>
                {relativeDate(entry.entry_date)}
              </span>

              {/* Entry text + optional link */}
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 'var(--lh-editorial)', flex: 1 }}>
                {entry.entry_text}
                {entry.source_url && (
                  <> <Link href={entry.source_url} style={{ color: 'var(--action-primary)', textDecoration: 'none' }}>→</Link></>
                )}
                {!entry.source_url && entry.source_slug && (
                  <> <Link href={`/projects/${entry.source_slug}`} style={{ color: 'var(--action-primary)', textDecoration: 'none', fontSize: '11px' }}>See project →</Link></>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
