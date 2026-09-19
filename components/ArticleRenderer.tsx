import Image from 'next/image'
import Link from 'next/link'
import MarkdownContent from '@/components/MarkdownContent'
import ProjectCard from '@/components/ProjectCard'
import type { Project } from '@/lib/types'

const BLUR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjY3NSI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg=='

const TYPE_LABELS: Record<string, string> = {
  article:            'Article',
  company_profile:    'Company Profile',
  developer_profile:  'Developer Profile',
  area_guide:         'Area Guide',
  buyer_guide:        'Buyer Guide',
}

export interface ArticleRendererData {
  slug: string
  title: string
  body_mdx: string | null
  article_type: string
  published_at: string | null
  last_updated?: string | null
  tags: string[] | null
  hero_image_url: string | null
  seo_title: string | null
  seo_description: string | null
  related_area_slugs: string[] | null
  author_name?: string | null
}

type Props = {
  article: ArticleRendererData
  relatedProjects: Project[]
  isDraftPreview?: boolean
}

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function readingTime(body: string | null): number {
  if (!body) return 1
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 200))
}

export default function ArticleRenderer({ article, relatedProjects, isDraftPreview = false }: Props) {
  const mins = readingTime(article.body_mdx)
  const typeLabel = TYPE_LABELS[article.article_type] ?? article.article_type
  const relatedAreas = (article.related_area_slugs ?? []).filter(Boolean)

  const showLastUpdated = (() => {
    if (!article.last_updated || !article.published_at) return false
    const diff = new Date(article.last_updated).getTime() - new Date(article.published_at).getTime()
    return diff > 30 * 24 * 60 * 60 * 1000
  })()

  return (
    <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--space-9) var(--gutter)' }}>
      {isDraftPreview && (
        <div style={{
          marginBottom: 'var(--space-6)',
          background: 'var(--brass-50)',
          border: '1px solid var(--brass-200)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4) var(--space-5)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--fw-medium)',
          color: 'var(--brass-700)',
        }}>
          Draft preview — not yet published
        </div>
      )}

      <article style={{ maxWidth: 'var(--container-narrow)' }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-label)',
              fontWeight: 'var(--fw-bold)',
              letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--text-brand)',
              background: 'var(--bg-subtle-brand)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs)',
            }}>
              {typeLabel}
            </span>
            {article.published_at && (
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                {fmtDate(article.published_at)}
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
              {mins} min read
            </span>
            {showLastUpdated && article.last_updated && (
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                Updated {fmtDate(article.last_updated)}
              </span>
            )}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 4vw, var(--text-display-4))',
            fontWeight: 'var(--fw-medium)',
            color: 'var(--text-brand)',
            lineHeight: 'var(--lh-title)',
            letterSpacing: 'var(--tracking-tight)',
            margin: '0 0 var(--space-5)',
          }}>
            {article.title}
          </h1>

          {article.author_name && (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              margin: '0 0 var(--space-4)',
            }}>
              By {article.author_name}
            </p>
          )}

          {(article.tags ?? []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {(article.tags ?? []).map(tag => (
                <span key={tag} style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--fw-medium)',
                  color: 'var(--text-brand)',
                  background: 'var(--bg-subtle-brand)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Hero image */}
        {article.hero_image_url && (
          <div style={{ marginBottom: 'var(--space-8)', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '16/9', position: 'relative' }}>
            <Image
              src={article.hero_image_url}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 760px"
              priority
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
            />
          </div>
        )}

        {/* Body */}
        {article.body_mdx ? (
          <MarkdownContent content={article.body_mdx} />
        ) : (
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No content yet.</p>
        )}
      </article>

      {/* Related projects */}
      {relatedProjects.length > 0 && (
        <div style={{ marginTop: 'var(--space-10)', maxWidth: 960 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display-4)',
            fontWeight: 'var(--fw-medium)',
            color: 'var(--text-brand)',
            margin: '0 0 var(--space-7)',
          }}>
            Related projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
            {relatedProjects.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {/* Related areas */}
      {relatedAreas.length > 0 && (
        <div style={{ marginTop: 'var(--space-8)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Relevant areas
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {relatedAreas.map(areaSlug => (
              <Link
                key={areaSlug}
                href={`/areas/${areaSlug}`}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--fw-medium)',
                  color: 'var(--text-brand)',
                  background: 'var(--bg-subtle-brand)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                }}
              >
                {areaSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
