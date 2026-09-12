import { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import ArticleCard from '@/components/ArticleCard'

export const metadata: Metadata = {
  title: 'Guides | Hawook',
  description: 'Area guides and buyer guides for Phuket property.',
}

const FILTER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Area Guides', value: 'area_guide' },
  { label: 'Buyer Guides', value: 'buyer_guide' },
]

type Props = { searchParams: Promise<{ type?: string }> }

export default async function GuidesPage({ searchParams }: Props) {
  const { type } = await searchParams
  const activeType = FILTER_OPTIONS.find(f => f.value === (type ?? '')) ? (type ?? '') : ''

  const query = supabaseAdmin
    .from('blog_articles')
    .select('slug, title, body_mdx, article_type, published_at, tags, hero_image_url')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (activeType) {
    query.eq('article_type', activeType)
  } else {
    query.in('article_type', ['area_guide', 'buyer_guide'])
  }

  const { data: guides } = await query

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-gray-900 mb-3">Guides</h1>
        <p className="text-gray-500 text-lg">Area guides and buyer guides for Phuket property.</p>
      </div>

      <div className="flex gap-2 mb-8">
        {FILTER_OPTIONS.map(filter => (
          <Link
            key={filter.value}
            href={filter.value ? `/guides?type=${filter.value}` : '/guides'}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeType === filter.value
                ? 'bg-teal text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {(!guides || guides.length === 0) ? (
        <p className="text-gray-400">No guides published yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map(guide => (
            <ArticleCard
              key={guide.slug}
              article={guide}
              href={`/guides/${guide.slug}`}
              showTypeBadge={!activeType}
            />
          ))}
        </div>
      )}
    </main>
  )
}
