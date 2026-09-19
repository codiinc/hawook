import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'
import ArticleCard from '@/components/ArticleCard'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Property insights, buying guides, and expert analysis for Phuket real estate.',
  alternates: { canonical: 'https://app.hawook.com/articles' },
  openGraph: {
    title: 'Articles',
    description: 'Property insights, buying guides, and expert analysis for Phuket real estate.',
    url: 'https://app.hawook.com/articles',
    siteName: 'Hawook',
    type: 'website',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image', title: 'Articles' },
}

export default async function ArticlesPage() {
  const { data: articles } = await supabaseAdmin
    .from('blog_articles')
    .select('slug, title, body_mdx, article_type, published_at, tags, hero_image_url')
    .eq('status', 'published')
    .eq('article_type', 'article')
    .order('published_at', { ascending: false })

  return (
    <main style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--space-9) var(--gutter)' }}>
      <div style={{ marginBottom: 'var(--space-9)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 4vw, var(--text-display-3))',
          fontWeight: 'var(--fw-medium)',
          color: 'var(--text-brand)',
          lineHeight: 'var(--lh-title)',
          letterSpacing: 'var(--tracking-display)',
          margin: '0 0 var(--space-4)',
        }}>
          Articles
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-body-lg)',
          color: 'var(--text-secondary)',
          lineHeight: 'var(--lh-editorial)',
          margin: 0,
        }}>
          Property insights and expert analysis for Phuket real estate.
        </p>
      </div>

      {(!articles || articles.length === 0) ? (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', color: 'var(--text-tertiary)' }}>
          No articles published yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
          {articles.map(article => (
            <ArticleCard key={article.slug} article={article} href={`/articles/${article.slug}`} />
          ))}
        </div>
      )}
    </main>
  )
}
