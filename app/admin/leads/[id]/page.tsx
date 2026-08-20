import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Params = { params: Promise<{ id: string }> }

interface StageHistoryRow {
  id: string
  from_stage: string | null
  to_stage: string
  transitioned_at: string
  transitioned_by: string | null
  notes: string | null
}

export async function generateMetadata({ params }: Params) {
  const { id } = await params
  return { title: `Lead ${id.slice(0, 8)}… — Admin | Hawook` }
}

export default async function LeadDetailPage({ params }: Params) {
  const { id } = await params

  const [leadResult, historyResult] = await Promise.all([
    supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', id)
      .single(),
    supabaseAdmin
      .from('lead_stage_history')
      .select('id, from_stage, to_stage, transitioned_at, transitioned_by, notes')
      .eq('lead_id', id)
      .order('transitioned_at', { ascending: false })
      .limit(5),
  ])

  if (leadResult.error || !leadResult.data) notFound()

  const lead = leadResult.data as Record<string, unknown>
  const history = (historyResult.data ?? []) as StageHistoryRow[]

  function fmt(iso: string) {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const fields: [string, unknown][] = [
    ['Full name',   lead.full_name],
    ['Email',       lead.email],
    ['Phone',       lead.phone],
    ['Persona',     lead.persona],
    ['Budget',      lead.budget_bracket],
    ['Timeline',    lead.timeline],
    ['Source',      lead.source],
    ['Stage',       lead.lead_stage],
    ['Message',     lead.message],
    ['Subscribe NL',lead.subscribe_newsletter ? 'Yes' : 'No'],
    ['Created',     lead.created_at ? fmt(lead.created_at as string) : '—'],
  ]

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <a href="/admin/leads" className="text-xs text-gray-400 hover:text-gray-600">← All leads</a>
        <h1 className="text-lg font-semibold text-gray-900 mt-2">{String(lead.full_name)}</h1>
        <p className="text-xs text-gray-400 font-mono">{id}</p>
      </div>

      {/* Lead details */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</h2>
        </div>
        <dl className="divide-y divide-gray-50">
          {fields.map(([label, value]) => (
            <div key={label} className="grid grid-cols-3 gap-4 px-4 py-2.5">
              <dt className="text-xs text-gray-400">{label}</dt>
              <dd className="text-sm text-gray-900 col-span-2">
                {value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-gray-300">—</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Stage history */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage history (last 5)</h2>
        </div>
        {history.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400">No stage history yet — run the migration to backfill.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {history.map(h => (
              <li key={h.id} className="px-4 py-3 flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 text-sm">
                  {h.from_stage ? (
                    <>
                      <span className="text-gray-500">{h.from_stage}</span>
                      <span className="text-gray-300">→</span>
                      <span className="font-medium text-gray-900">{h.to_stage}</span>
                    </>
                  ) : (
                    <span className="font-medium text-gray-900">Created as {h.to_stage}</span>
                  )}
                  {h.notes && (
                    <span className="text-xs text-gray-400 italic">— {h.notes}</span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{fmt(h.transitioned_at)}</p>
                  {h.transitioned_by && (
                    <p className="text-xs text-gray-300">{h.transitioned_by}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
