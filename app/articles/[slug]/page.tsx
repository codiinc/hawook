import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'
import ArticleRenderer from '@/components/ArticleRenderer'
import { ogImageUrl } from '@/lib/og'
import type { Project } from '@/lib/types'

const SITE_URL = 'https://app.hawook.com'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabaseAdmin
    .from('blog_articles')
    .select('title, seo_title, seo_description, seo_keywords, body_mdx, hero_image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('article_type', 'article')
    .single()

  if (!data) return {}

  const title = data.seo_title ?? data.title
  const description = data.seo_description ?? (data.body_mdx ?? '').replace(/[#*\[\]]/g, '').slice(0, 155)
  const keywords = Array.isArray(data.seo_keywords) ? data.seo_keywords.join(', ') : undefined
  const image = ogImageUrl(data.hero_image_url)
  const url = `${SITE_URL}/articles/${slug}`

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Hawook',
      type: 'article',
      images: [{ url: image, width: 1200, height: 630 }],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params

  const { data: raw } = await supabaseAdmin
    .from('blog_articles')
    .select('slug, title, body_mdx, article_type, published_at, last_updated, tags, hero_image_url, seo_title, seo_description, seo_keywords, related_project_ids, related_area_slugs, byline_slug, authors:byline_slug(display_name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('article_type', 'article')
    .single()

  if (!raw) notFound()

  const authorRow = raw.authors as unknown as { display_name: string } | null
  const article = {
    ...raw,
    author_name: authorRow?.display_name ?? null,
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    url: `${SITE_URL}/articles/${slug}`,
    ...(article.published_at ? { datePublished: article.published_at } : {}),
    ...(article.last_updated ? { dateModified: article.last_updated } : {}),
    ...(article.hero_image_url ? { image: article.hero_image_url } : {}),
    publisher: { '@type': 'Organization', name: 'Hawook', url: SITE_URL },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE_URL}/articles` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/articles/${slug}` },
    ],
  }

  let relatedProjects: Project[] = []
  if ((article.related_project_ids ?? []).length > 0) {
    const { data } = await supabaseAdmin
      .from('projects_public')
      .select('*')
      .in('id', article.related_project_ids!)
    relatedProjects = (data ?? []) as Project[]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ArticleRenderer article={article} relatedProjects={relatedProjects} />
    </>
  )
}
