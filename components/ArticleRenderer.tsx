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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {isDraftPreview && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 font-medium">
          Draft preview — not yet published
        </div>
      )}

      <article className="max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {typeLabel}
            </span>
            {article.published_at && (
              <span className="text-sm text-gray-400">{fmtDate(article.published_at)}</span>
            )}
            <span className="text-sm text-gray-400">{mins} min read</span>
            {showLastUpdated && article.last_updated && (
              <span className="text-sm text-gray-400">
                Last updated: {fmtDate(article.last_updated)}
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-gray-900 leading-tight mb-4">
            {article.title}
          </h1>
          {article.author_name && (
            <p className="text-sm text-gray-500">By {article.author_name}</p>
          )}
          {(article.tags ?? []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(article.tags ?? []).map(tag => (
                <span key={tag} className="text-xs text-teal bg-teal-light px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Hero image */}
        {article.hero_image_url && (
          <div className="mb-8 rounded-xl overflow-hidden aspect-[16/9] relative">
            <Image
              src={article.hero_image_url}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
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
          <p className="text-gray-400 italic">No content yet.</p>
        )}
      </article>

      {/* Footer: related projects */}
      {relatedProjects.length > 0 && (
        <div className="mt-16 max-w-4xl">
          <h2 className="font-serif text-2xl font-medium text-gray-900 mb-6">Related projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProjects.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {/* Footer: related areas */}
      {relatedAreas.length > 0 && (
        <div className="mt-10">
          <p className="text-sm font-medium text-gray-500 mb-3">Relevant areas</p>
          <div className="flex flex-wrap gap-2">
            {relatedAreas.map(areaSlug => (
              <Link
                key={areaSlug}
                href={`/areas/${areaSlug}`}
                className="text-sm text-teal bg-teal-light px-3 py-1.5 rounded-md hover:bg-teal/20 transition-colors"
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
