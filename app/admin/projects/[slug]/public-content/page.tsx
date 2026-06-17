import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import PublicContentForm from './PublicContentForm'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: `Public Content — ${slug} | Admin` }
}

export default async function PublicContentPage({ params }: Props) {
  const { slug } = await params

  const { data } = await supabaseAdmin
    .from('projects')
    .select('project_name, area, developer_name, hawook_intro, hawook_take, description_public, hawook_badge, location_description, seo_title, seo_description')
    .eq('slug', slug)
    .single()

  if (!data) notFound()
  const raw = data as Record<string, unknown>
  const str = (k: string): string => (raw[k] as string | null) ?? ''

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-900">Public content</h2>
        <p className="text-xs text-gray-400 mt-0.5">Edits save directly and are logged to the audit log.</p>
      </div>
      <PublicContentForm
        slug={slug}
        initial={{
          project_name: str('project_name'),
          area: str('area'),
          developer_name: str('developer_name'),
          hawook_intro: str('hawook_intro'),
          hawook_take: str('hawook_take'),
          description_public: str('description_public'),
          hawook_badge: str('hawook_badge'),
          location_description: str('location_description'),
          seo_title: str('seo_title'),
          seo_description: str('seo_description'),
        }}
      />
    </div>
  )
}
