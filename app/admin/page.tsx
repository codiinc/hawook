import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, project_name, slug, area, status, data_confidence, cover_image_url, hawook_intro, seo_title, flagged_fields, page_status, extracted_at')
    .order('extracted_at', { ascending: false, nullsFirst: false })

  const rows = (projects ?? []) as Record<string, unknown>[]

  const total = rows.length
  const active = rows.filter(p => p.status === 'Active').length
  const missingCover = rows.filter(p => !p.cover_image_url).length
  const missingContent = rows.filter(p => !p.hawook_intro).length
  const published = rows.filter(p => p.page_status === 'published').length

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Projects</h1>
        <p className="text-sm text-gray-500">All projects in the database</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Total projects', value: total, color: 'text-gray-900' },
          { label: 'Active', value: active, color: 'text-teal' },
          { label: 'Missing cover', value: missingCover, color: missingCover > 0 ? 'text-amber-600' : 'text-gray-400' },
          { label: 'Missing content', value: missingContent, color: missingContent > 0 ? 'text-amber-600' : 'text-gray-400' },
          { label: 'Published', value: published, color: 'text-teal' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
            <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Projects table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Project', 'Area', 'Status', 'Confidence', 'Cover', 'Content', 'SEO', 'Flagged', 'Page status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((p) => {
                const slug = p.slug as string | null
                const flaggedRaw = p.flagged_fields as string | null
                const flaggedCount = flaggedRaw
                  ? flaggedRaw.split(',').filter(Boolean).length
                  : 0

                return (
                  <tr key={p.id as string} className="hover:bg-gray-50 transition-colors">
                    {/* Project name */}
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {slug ? (
                        <Link href={`/admin/projects/${slug}/media`} className="hover:text-teal transition-colors">
                          {p.project_name as string}
                        </Link>
                      ) : (
                        <span className="text-gray-400">{p.project_name as string} <span className="text-xs">(no slug)</span></span>
                      )}
                    </td>

                    {/* Area */}
                    <td className="px-4 py-3">
                      {p.area ? (
                        <span className="text-xs bg-teal-light text-teal px-2 py-0.5 rounded font-medium">
                          {p.area as string}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge value={p.status as string | null} />
                    </td>

                    {/* Data confidence */}
                    <td className="px-4 py-3">
                      <ConfidenceBadge value={p.data_confidence as string | null} />
                    </td>

                    {/* Cover image */}
                    <td className="px-4 py-3 text-center">
                      {p.cover_image_url ? (
                        <span className="text-green-500 font-bold">✓</span>
                      ) : (
                        <span className="text-red-400 font-bold">✗</span>
                      )}
                    </td>

                    {/* Written content */}
                    <td className="px-4 py-3 text-center">
                      {p.hawook_intro ? (
                        <span className="text-green-500 font-bold">✓</span>
                      ) : (
                        <span className="text-red-400 font-bold">✗</span>
                      )}
                    </td>

                    {/* SEO */}
                    <td className="px-4 py-3 text-center">
                      {p.seo_title ? (
                        <span className="text-green-500 font-bold">✓</span>
                      ) : (
                        <span className="text-red-400 font-bold">✗</span>
                      )}
                    </td>

                    {/* Flagged fields */}
                    <td className="px-4 py-3 text-center">
                      {flaggedCount > 0 ? (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          {flaggedCount} flagged
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Page status */}
                    <td className="px-4 py-3">
                      <PageStatusBadge value={p.page_status as string | null} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {slug ? (
                          <>
                            <Link
                              href={`/admin/projects/${slug}/media`}
                              className="text-xs text-teal hover:text-teal-dark font-medium whitespace-nowrap"
                            >
                              Edit media
                            </Link>
                            <span className="text-gray-200">|</span>
                            <Link
                              href={`/projects/${slug}`}
                              target="_blank"
                              className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap"
                            >
                              View ↗
                            </Link>
                          </>
                        ) : (
                          <span className="text-xs text-gray-300">No slug</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No projects found.</p>
          </div>
        )}
      </div>
    </>
  )
}

function StatusBadge({ value }: { value: string | null }) {
  const map: Record<string, string> = {
    'Active': 'bg-green-100 text-green-700',
    'Coming soon': 'bg-blue-50 text-blue-600',
    'Sold out': 'bg-gray-100 text-gray-500',
    'On hold': 'bg-amber-50 text-amber-600',
  }
  if (!value) return <span className="text-gray-300 text-xs">—</span>
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${map[value] ?? 'bg-gray-100 text-gray-500'}`}>
      {value}
    </span>
  )
}

function ConfidenceBadge({ value }: { value: string | null }) {
  const map: Record<string, string> = {
    'Complete': 'bg-green-100 text-green-700',
    'Incomplete': 'bg-red-50 text-red-500',
    'Flagged': 'bg-amber-50 text-amber-600',
  }
  if (!value) return <span className="text-gray-300 text-xs">—</span>
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${map[value] ?? 'bg-gray-100 text-gray-500'}`}>
      {value}
    </span>
  )
}

function PageStatusBadge({ value }: { value: string | null }) {
  const map: Record<string, string> = {
    'published': 'bg-green-100 text-green-700',
    'draft': 'bg-gray-100 text-gray-500',
    'archived': 'bg-red-50 text-red-400',
  }
  if (!value) return <span className="text-gray-300 text-xs">—</span>
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${map[value] ?? 'bg-gray-100 text-gray-500'}`}>
      {value}
    </span>
  )
}
