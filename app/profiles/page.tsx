import { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import ArticleCard from '@/components/ArticleCard'

export const metadata: Metadata = {
  title: 'Developer & Company Profiles | Hawook',
  description: 'Profiles of Phuket property developers and construction companies.',
}

const FILTER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Companies', value: 'company_profile' },
  { label: 'Developers', value: 'developer_profile' },
]

type Props = { searchParams: Promise<{ type?: string }> }

export default async function ProfilesPage({ searchParams }: Props) {
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
    query.in('article_type', ['company_profile', 'developer_profile'])
  }

  const { data: profiles } = await query

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-gray-900 mb-3">Profiles</h1>
        <p className="text-gray-500 text-lg">Phuket property developers and construction companies.</p>
      </div>

      <div className="flex gap-2 mb-8">
        {FILTER_OPTIONS.map(filter => (
          <Link
            key={filter.value}
            href={filter.value ? `/profiles?type=${filter.value}` : '/profiles'}
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

      {(!profiles || profiles.length === 0) ? (
        <p className="text-gray-400">No profiles published yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map(profile => (
            <ArticleCard
              key={profile.slug}
              article={profile}
              href={`/profiles/${profile.slug}`}
              showTypeBadge={!activeType}
            />
          ))}
        </div>
      )}
    </main>
  )
}
