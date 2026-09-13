import { supabaseAdmin } from '@/lib/supabase/admin'
import LeadsClient from './LeadsClient'

export const metadata = { title: 'Leads — Admin' }

export default async function LeadsPage() {
  const { data } = await supabaseAdmin
    .from('leads')
    .select('id, full_name, email, phone, persona, lead_stage, budget_bracket, timeline, source, created_at, current_project_context_id')
    .order('created_at', { ascending: false })

  const leads = (data ?? []) as Record<string, unknown>[]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Leads</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {leads.length} lead{leads.length !== 1 ? 's' : ''} total
        </p>
      </div>
      <LeadsClient initialLeads={leads} />
    </div>
  )
}
