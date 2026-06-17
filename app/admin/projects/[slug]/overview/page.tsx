import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: `Overview — ${slug} | Admin` }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok',
  }) + ' BKK'
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const ACTION_COLORS: Record<string, string> = {
  published: 'text-green-600 bg-green-50',
  unpublished: 'text-amber-600 bg-amber-50',
  archived: 'text-red-500 bg-red-50',
  direct_edit: 'text-blue-600 bg-blue-50',
  approved: 'text-teal bg-teal-light',
  rejected: 'text-red-500 bg-red-50',
}

export default async function OverviewPage({ params }: Props) {
  const { slug } = await params

  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('id, project_name, status, page_status, last_updated, created_at, hawook_score, hawook_badge, price_min, price_max, construction_status, total_units')
    .eq('slug', slug)
    .single()

  if (!project) notFound()
  const raw = project as Record<string, unknown>
  const projectId = raw.id as string

  // Follower count
  const { count: followerCount } = await supabaseAdmin
    .from('project_follows')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)

  // Latest 5 audit entries
  const { data: auditEntries } = await supabaseAdmin
    .from('audit_log')
    .select('id, action, actor_email, summary, created_at, metadata')
    .eq('target_slug', slug)
    .order('created_at', { ascending: false })
    .limit(5)

  const audits = (auditEntries ?? []) as Record<string, unknown>[]

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Page status', value: (raw.page_status as string) ?? '—', mono: false },
          { label: 'Content status', value: (raw.status as string) ?? '—', mono: false },
          { label: 'Followers', value: String(followerCount ?? 0), mono: false },
          { label: 'Hawook Score', value: raw.hawook_score != null ? String(raw.hawook_score) : '—', mono: true },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
            <p className={`text-xl font-semibold text-gray-900 ${stat.mono ? 'font-mono' : ''}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Project details */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Project details</h2>
        </div>
        <dl className="divide-y divide-gray-50">
          {[
            { label: 'Price range', value: raw.price_min || raw.price_max ? `${raw.price_min != null ? `฿${(raw.price_min as number).toLocaleString()}` : '—'} – ${raw.price_max != null ? `฿${(raw.price_max as number).toLocaleString()}` : '—'}` : '—' },
            { label: 'Construction', value: (raw.construction_status as string) ?? '—' },
            { label: 'Total units', value: raw.total_units != null ? String(raw.total_units) : '—' },
            { label: 'Hawook badge', value: (raw.hawook_badge as string) ?? 'None' },
            { label: 'Last updated', value: formatDate(raw.last_updated as string | null) },
            { label: 'Created', value: formatDate(raw.created_at as string | null) },
          ].map(row => (
            <div key={row.label} className="flex items-center px-4 py-2.5">
              <dt className="text-xs text-gray-500 w-36 shrink-0">{row.label}</dt>
              <dd className="text-sm text-gray-900">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Recent audit entries */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent activity</h2>
          <Link href="#" className="text-xs text-teal hover:underline">View all in audit log →</Link>
        </div>
        {audits.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No activity yet</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {audits.map(entry => {
              const action = entry.action as string
              const colorClass = ACTION_COLORS[action] ?? 'text-gray-600 bg-gray-50'
              return (
                <li key={entry.id as string} className="flex items-start gap-3 px-4 py-3">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${colorClass}`}>
                    {action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{(entry.summary as string) ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{entry.actor_email as string} · {relativeTime(entry.created_at as string)}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
