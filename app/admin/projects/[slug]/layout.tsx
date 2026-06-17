import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import TabNav from './TabNav'

type Props = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function ProjectAdminLayout({ children, params }: Props) {
  const { slug } = await params

  const { data } = await supabaseAdmin
    .from('projects')
    .select('project_name, slug, page_status')
    .eq('slug', slug)
    .single()

  if (!data) notFound()
  const raw = data as Record<string, unknown>
  const projectName = raw.project_name as string
  const pageStatus = raw.page_status as string | null

  const statusClass: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-500',
    archived: 'bg-red-50 text-red-400',
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/admin" className="hover:text-gray-700 transition-colors">Projects</Link>
        <span className="text-gray-300">›</span>
        <span className="text-gray-900 font-medium">{projectName}</span>
      </div>

      {/* Project header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{projectName}</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">/{slug}</p>
        </div>
        {pageStatus && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusClass[pageStatus] ?? 'bg-gray-100 text-gray-500'}`}>
            {pageStatus}
          </span>
        )}
      </div>

      <TabNav slug={slug} />

      {children}
    </>
  )
}
