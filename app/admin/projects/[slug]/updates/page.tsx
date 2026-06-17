import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: `Updates — ${slug} | Admin` }
}

const SEVERITY_COLORS: Record<string, string> = {
  major: 'bg-red-50 text-red-600',
  standard: 'bg-amber-50 text-amber-600',
  minor: 'bg-gray-100 text-gray-500',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok',
  })
}

export default async function UpdatesPage({ params }: Props) {
  const { slug } = await params

  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!project) notFound()
  const raw = project as Record<string, unknown>

  const { data: updates } = await supabaseAdmin
    .from('project_updates')
    .select('id, type, severity, summary_public, summary_internal, source, notify_followers, created_at')
    .eq('project_id', raw.id as string)
    .order('created_at', { ascending: false })

  const rows = (updates ?? []) as Record<string, unknown>[]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Project updates</h2>
          <p className="text-xs text-gray-400 mt-0.5">{rows.length} update{rows.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-400">No updates published yet</p>
          <p className="text-xs text-gray-300 mt-1">Updates are created when proposals are approved in the queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(update => (
            <div key={update.id as string} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${SEVERITY_COLORS[update.severity as string] ?? 'bg-gray-100 text-gray-500'}`}>
                    {update.severity as string}
                  </span>
                  <span className="text-xs text-gray-400">{update.type as string}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{update.summary_public as string}</p>
                  {(update.summary_internal as string | null) && (
                    <p className="text-xs text-gray-500 mt-1 italic">{update.summary_internal as string}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{formatDate(update.created_at as string)}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{update.source as string}</p>
                </div>
              </div>
              {update.notify_followers === false && (
                <p className="text-xs text-amber-600 mt-2">Notifications held — followers not notified</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
