import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import DocumentsPanel from './DocumentsPanel'
import type { ProjectDocument } from './DocumentsPanel'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: `Documents — ${slug} | Admin` }
}

export default async function DocumentsPage({ params }: Props) {
  const { slug } = await params

  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!project) notFound()
  const raw = project as Record<string, unknown>
  const projectId = raw.id as string

  const { data: docs } = await supabaseAdmin
    .from('project_documents')
    .select('id, document_type, cloudinary_url, cloudinary_public_id, filename, file_size_bytes, version, is_gated, uploaded_at')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-900">Documents</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          PDFs organised by type. Gated documents require users to be logged in to download.
        </p>
      </div>
      <DocumentsPanel
        projectId={projectId}
        slug={slug}
        initialDocs={(docs ?? []) as ProjectDocument[]}
      />
    </div>
  )
}
