import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'
import ArticleRenderer from '@/components/ArticleRenderer'
import type { Project } from '@/lib/types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabaseAdmin
    .from('blog_articles')
    .select('title, seo_title, seo_description, seo_keywords, body_mdx')
    .eq('slug', slug)
    .eq('status', 'published')
    .in('article_type', ['company_profile', 'developer_profile'])
    .single()

  if (!data) return {}

  const title = data.seo_title ?? data.title
  const description = data.seo_description ?? (data.body_mdx ?? '').replace(/[#*\[\]]/g, '').slice(0, 155)
  const keywords = Array.isArray(data.seo_keywords) ? data.seo_keywords.join(', ') : undefined

  return {
    title: `${title} | Hawook`,
    description,
    ...(keywords ? { keywords } : {}),
  }
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params

  const { data: article } = await supabaseAdmin
    .from('blog_articles')
    .select('slug, title, body_mdx, article_type, published_at, tags, hero_image_url, seo_title, seo_description, seo_keywords, related_project_ids, related_area_slugs')
    .eq('slug', slug)
    .eq('status', 'published')
    .in('article_type', ['company_profile', 'developer_profile'])
    .single()

  if (!article) notFound()

  let relatedProjects: Project[] = []
  if ((article.related_project_ids ?? []).length > 0) {
    const { data } = await supabaseAdmin
      .from('projects_public')
      .select('*')
      .in('id', article.related_project_ids!)
    relatedProjects = (data ?? []) as Project[]
  }

  return <ArticleRenderer article={article} relatedProjects={relatedProjects} />
}
