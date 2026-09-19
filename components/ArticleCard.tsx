import Link from 'next/link'
import Image from 'next/image'

const BLUR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+'

const TYPE_LABELS: Record<string, string> = {
  article:            'Article',
  company_profile:    'Company Profile',
  developer_profile:  'Developer Profile',
  area_guide:         'Area Guide',
  buyer_guide:        'Buyer Guide',
}

export interface ArticleCardData {
  slug: string
  title: string
  body_mdx: string | null
  article_type: string
  published_at: string | null
  tags: string[] | null
  hero_image_url: string | null
}

type Props = {
  article: ArticleCardData
  href: string
  showTypeBadge?: boolean
}

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function preview(body: string | null): string {
  if (!body) return ''
  const text = body.replace(/#{1,6}\s/g, '').replace(/\*+/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\n+/g, ' ').trim()
  return text.length > 140 ? text.slice(0, 140) + '…' : text
}

export default function ArticleCard({ article, href, showTypeBadge = false }: Props) {
  return (
    <Link href={href} className="group" style={{
      display: 'block',
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      border: '1px solid var(--rule)',
      textDecoration: 'none',
      boxShadow: 'var(--shadow-lift)',
    }}>
      {article.hero_image_url && (
        <div style={{ aspectRatio: '16/7', background: 'var(--bg-tint)', position: 'relative', overflow: 'hidden' }}>
          <Image
            src={article.hero_image_url}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />
        </div>
      )}
      <div style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          {showTypeBadge && (
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-label)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--text-brand)',
              background: 'var(--bg-subtle-brand)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
            }}>
              {TYPE_LABELS[article.article_type] ?? article.article_type}
            </span>
          )}
          {article.published_at && (
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              {fmtDate(article.published_at)}
            </span>
          )}
        </div>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lead)',
          fontWeight: 'var(--fw-medium)',
          color: 'var(--text-brand)',
          lineHeight: 'var(--lh-title)',
          margin: '0 0 var(--space-3)',
        }}>
          {article.title}
        </h3>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          lineHeight: 'var(--lh-editorial)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
          margin: 0,
        }}>
          {preview(article.body_mdx)}
        </p>
        {(article.tags ?? []).length > 0 && (
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {(article.tags ?? []).slice(0, 4).map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--fw-medium)',
                color: 'var(--text-brand)',
                background: 'var(--bg-subtle-brand)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
