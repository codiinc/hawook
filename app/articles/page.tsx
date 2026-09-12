import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'
import ArticleCard from '@/components/ArticleCard'

export const metadata: Metadata = {
  title: 'Articles | Hawook',
  description: 'Property insights, buying guides, and expert analysis for Phuket real estate.',
}

export default async function ArticlesPage() {
  const { data: articles } = await supabaseAdmin
    .from('blog_articles')
    .select('slug, title, body_mdx, article_type, published_at, tags, hero_image_url')
    .eq('status', 'published')
    .eq('article_type', 'article')
    .order('published_at', { ascending: false })

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-gray-900 mb-3">Articles</h1>
        <p className="text-gray-500 text-lg">Property insights and expert analysis for Phuket real estate.</p>
      </div>

      {(!articles || articles.length === 0) ? (
        <p className="text-gray-400">No articles published yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <ArticleCard key={article.slug} article={article} href={`/articles/${article.slug}`} />
          ))}
        </div>
      )}
    </main>
  )
}
