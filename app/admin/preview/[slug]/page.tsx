import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/admin'
import ArticleRenderer from '@/components/ArticleRenderer'
import type { Project } from '@/lib/types'

type Props = { params: Promise<{ slug: string }> }

const ROUTE_MAP: Record<string, string> = {
  article:            '/articles',
  company_profile:    '/profiles',
  developer_profile:  '/profiles',
  area_guide:         '/guides',
  buyer_guide:        '/guides',
}

export default async function AdminPreviewPage({ params }: Props) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email ?? '')) redirect('/')

  const { data: article } = await supabaseAdmin
    .from('blog_articles')
    .select('slug, title, body_mdx, article_type, published_at, tags, hero_image_url, seo_title, seo_description, seo_keywords, related_project_ids, related_area_slugs, status')
    .eq('slug', slug)
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

  const liveHref = article.status === 'published'
    ? `${ROUTE_MAP[article.article_type] ?? ''}/${article.slug}`
    : null

  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Admin preview
          {liveHref && (
            <> · <a href={liveHref} className="text-teal hover:underline">View live →</a></>
          )}
        </span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {article.status}
        </span>
      </div>
      <ArticleRenderer
        article={article}
        relatedProjects={relatedProjects}
        isDraftPreview={article.status !== 'published'}
      />
    </div>
  )
}
