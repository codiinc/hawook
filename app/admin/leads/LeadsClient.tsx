'use client'

import { useState } from 'react'
import Link from 'next/link'

const VALID_STAGES = [
  'Inquiry', 'Qualified', 'Engaged', 'Meeting-ready',
  'Project-selected', 'Reserved', 'Contracted', 'Closed', 'Dropped',
] as const

type Stage = typeof VALID_STAGES[number]

const STAGE_BADGE: Record<Stage, string> = {
  'Inquiry':          'bg-gray-100 text-gray-600',
  'Qualified':        'bg-blue-100 text-blue-700',
  'Engaged':          'bg-purple-100 text-purple-700',
  'Meeting-ready':    'bg-amber-100 text-amber-800',
  'Project-selected': 'bg-orange-100 text-orange-700',
  'Reserved':         'bg-teal/10 text-teal',
  'Contracted':       'bg-green-100 text-green-700',
  'Closed':           'bg-green-700 text-white',
  'Dropped':          'bg-red-100 text-red-600',
}

interface Lead {
  id: string
  full_name: string
  email: string
  phone: string | null
  persona: string | null
  lead_stage: string
  budget_bracket: string | null
  timeline: string | null
  source: string | null
  created_at: string
  current_project_context_id: string | null
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function LeadsClient({ initialLeads }: { initialLeads: Record<string, unknown>[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads as unknown as Lead[])
  const [updating, setUpdating] = useState<string | null>(null)

  const handleStageChange = async (id: string, newStage: string) => {
    setUpdating(id)
    const res = await fetch(`/api/admin/leads/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    })
    if (res.ok) {
      setLeads(ls => ls.map(l => l.id === id ? { ...l, lead_stage: newStage } : l))
    } else {
      const json = await res.json() as { error?: string }
      alert(`Stage update failed: ${json.error ?? 'Unknown error'}`)
    }
    setUpdating(null)
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
        <p className="text-sm text-gray-400">No leads yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-left px-4 py-3 font-medium">Contact</th>
            <th className="text-left px-4 py-3 font-medium">Stage</th>
            <th className="text-left px-4 py-3 font-medium">Budget</th>
            <th className="text-left px-4 py-3 font-medium">Persona</th>
            <th className="text-left px-4 py-3 font-medium">Received</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {leads.map(lead => {
            const stage = lead.lead_stage as Stage
            return (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{lead.full_name}</p>
                  {lead.source && (
                    <p className="text-xs text-gray-400">{lead.source}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-700">{lead.email}</p>
                  {lead.phone && (
                    <p className="text-xs text-gray-400">{lead.phone}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded shrink-0 ${STAGE_BADGE[stage] ?? 'bg-gray-100 text-gray-600'}`}>
                      {lead.lead_stage}
                    </span>
                    <select
                      value={lead.lead_stage}
                      disabled={updating === lead.id}
                      onChange={e => handleStageChange(lead.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-1.5 py-0.5 text-gray-600 disabled:opacity-50"
                    >
                      {VALID_STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {updating === lead.id && (
                      <span className="text-xs text-gray-400">saving…</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {lead.budget_bracket ?? '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 capitalize">
                  {lead.persona ?? '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {relativeTime(lead.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="text-xs text-teal hover:underline"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
