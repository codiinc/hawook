import Link from 'next/link'
import Image from 'next/image'

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
    <Link href={href} className="group block bg-cream rounded-lg overflow-hidden border border-gray-100 hover:border-teal/30 transition-colors">
      {article.hero_image_url && (
        <div className="aspect-[16/7] bg-gray-100 relative overflow-hidden">
          <Image
            src={article.hero_image_url}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {showTypeBadge && (
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {TYPE_LABELS[article.article_type] ?? article.article_type}
            </span>
          )}
          {article.published_at && (
            <span className="text-xs text-gray-400">{fmtDate(article.published_at)}</span>
          )}
        </div>
        <h3 className="font-serif text-lg font-medium text-gray-900 leading-snug group-hover:text-teal transition-colors mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{preview(article.body_mdx)}</p>
        {(article.tags ?? []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {(article.tags ?? []).slice(0, 4).map(tag => (
              <span key={tag} className="text-xs text-teal bg-teal-light px-2 py-0.5 rounded">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
