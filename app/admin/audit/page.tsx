import { supabaseAdmin } from '@/lib/supabase/admin'
import AuditClient from './AuditClient'

export const metadata = { title: 'Audit Log — Admin | Hawook' }

export default async function AuditPage() {
  const { data, count } = await supabaseAdmin
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 49)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Audit Log</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Read-only chronological record of every change to live data.
        </p>
      </div>
      <AuditClient
        initialEntries={(data ?? []) as Record<string, unknown>[]}
        initialCount={count ?? 0}
      />
    </div>
  )
}
