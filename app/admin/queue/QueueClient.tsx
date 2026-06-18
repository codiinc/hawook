'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

type Severity   = 'minor' | 'standard' | 'major'
type ProposalStatus = 'pending_approval' | 'approved' | 'rejected' | 'applied' | 'failed'
type Confidence = 'high' | 'medium' | 'low'

interface FieldChange {
  field:          string
  current_value:  unknown
  proposed_value: unknown
  evidence?:      string | null
  ai_confidence?: Confidence
}

interface RelatedUpdateEntry {
  type:             string
  severity:         string
  summary_public:   string
  summary_internal?: string | null
  notify_followers: boolean
}

interface Proposal {
  id:                   string
  proposed_at:          string
  proposed_by:          string
  target_table:         string
  target_slug:          string | null
  update_type:          string
  severity:             Severity
  fields_changed:       FieldChange[] | null
  related_update_entry: RelatedUpdateEntry | null
  source_type:          string | null
  source_raw:           string | null
  ai_session_context:   string | null
  discrepancy_flag:     boolean
  discrepancy_note:     string | null
  status:               ProposalStatus
  review_notes:         string | null
}

// ── Style maps ────────────────────────────────────────────────────────────────

const SEV_BADGE: Record<Severity, string> = {
  major:    'bg-red-100 text-red-700 border border-red-200',
  standard: 'bg-amber-100 text-amber-700 border border-amber-200',
  minor:    'bg-gray-100 text-gray-600 border border-gray-200',
}

const CONFIDENCE_BADGE: Record<Confidence, string> = {
  high:   'text-green-600',
  medium: 'text-amber-600',
  low:    'text-red-600',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function displayValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'object') return JSON.stringify(v, null, 2)
  return String(v)
}

// ── Filter state ──────────────────────────────────────────────────────────────

interface Filters {
  severity:    string
  status:      string
  targetSlug:  string
  proposedBy:  string
  dateFrom:    string
  dateTo:      string
}

const DEFAULT_FILTERS: Filters = {
  severity: '', status: 'pending_approval', targetSlug: '', proposedBy: '', dateFrom: '', dateTo: '',
}

// ── Main component ────────────────────────────────────────────────────────────

export default function QueueClient({
  initialProposals,
  canApprove,
}: {
  initialProposals: Record<string, unknown>[]
  canApprove: boolean
}) {
  const cast = (p: Record<string, unknown>) => p as unknown as Proposal

  const [proposals, setProposals]         = useState<Proposal[]>(initialProposals.map(cast))
  const [filters, setFilters]             = useState<Filters>(DEFAULT_FILTERS)
  const [expanded, setExpanded]           = useState<string | null>(null)
  const [sourceExpanded, setSourceExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading]             = useState<string | null>(null)
  const [reviewNotes, setReviewNotes]     = useState<Record<string, string>>({})
  const [deferTags, setDeferTags]         = useState<Record<string, string>>({})
  const [editMode, setEditMode]           = useState<Set<string>>(new Set())
  const [editedFields, setEditedFields]   = useState<Record<string, FieldChange[]>>({})
  const [editedEntries, setEditedEntries] = useState<Record<string, RelatedUpdateEntry>>({})
  const [bulkModal, setBulkModal]         = useState(false)
  const [bulkLoading, setBulkLoading]     = useState(false)
  const [notifHold, setNotifHold]         = useState<Set<string>>(new Set())

  const refetch = useCallback(async (f: Filters) => {
    const params = new URLSearchParams()
    if (f.status)     params.set('status', f.status)
    if (f.severity)   params.set('severity', f.severity)
    if (f.targetSlug) params.set('target_slug', f.targetSlug)
    if (f.proposedBy) params.set('proposed_by', f.proposedBy)
    if (f.dateFrom)   params.set('date_from', f.dateFrom)
    if (f.dateTo)     params.set('date_to', f.dateTo)
    const res = await fetch(`/api/admin/proposals?${params}`)
    if (res.ok) {
      const json = await res.json() as { proposals: Record<string, unknown>[] }
      setProposals(json.proposals.map(cast))
    }
  }, [])

  const applyFilters = (next: Filters) => {
    setFilters(next)
    refetch(next)
  }

  const removeFromList = (id: string) =>
    setProposals(ps => ps.filter(p => p.id !== id))

  const handleApprove = async (id: string, hold = false) => {
    setLoading(id)
    const isEditing = editMode.has(id)
    const body: Record<string, unknown> = {
      review_notes:      reviewNotes[id] ?? null,
      notification_hold: hold || notifHold.has(id),
    }
    if (isEditing && editedFields[id]) body.edited_fields = editedFields[id]
    if (isEditing && editedEntries[id]) body.edited_update_entry = editedEntries[id]

    const res = await fetch(`/api/admin/proposals/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json() as { ok?: boolean; error?: string }
    if (res.ok) {
      removeFromList(id)
      setExpanded(null)
    } else {
      alert(`Approval failed: ${json.error ?? 'Unknown error'}`)
    }
    setLoading(null)
  }

  const handleReject = async (id: string) => {
    setLoading(id)
    const res = await fetch(`/api/admin/proposals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_notes: reviewNotes[id] ?? null }),
    })
    const json = await res.json() as { ok?: boolean; error?: string }
    if (res.ok) {
      removeFromList(id)
      setExpanded(null)
    } else {
      alert(`Reject failed: ${json.error ?? 'Unknown error'}`)
    }
    setLoading(null)
  }

  const handleDefer = async (id: string) => {
    setLoading(id)
    const res = await fetch(`/api/admin/proposals/${id}/defer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defer_tag: deferTags[id] ?? null, review_notes: reviewNotes[id] ?? null }),
    })
    const json = await res.json() as { ok?: boolean; error?: string }
    if (res.ok) {
      removeFromList(id)
      setExpanded(null)
    } else {
      alert(`Defer failed: ${json.error ?? 'Unknown error'}`)
    }
    setLoading(null)
  }

  const handleBulkApproveMinor = async () => {
    setBulkLoading(true)
    const minors = proposals.filter(p => p.severity === 'minor')
    for (const p of minors) {
      const res = await fetch(`/api/admin/proposals/${p.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_notes: 'Bulk approved' }),
      })
      if (res.ok) removeFromList(p.id)
    }
    setBulkModal(false)
    setBulkLoading(false)
  }

  const toggleEditMode = (id: string, p: Proposal) => {
    const next = new Set(editMode)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
      if (!editedFields[id] && p.fields_changed) {
        setEditedFields(ef => ({ ...ef, [id]: JSON.parse(JSON.stringify(p.fields_changed)) }))
      }
      if (!editedEntries[id] && p.related_update_entry) {
        setEditedEntries(ee => ({ ...ee, [id]: JSON.parse(JSON.stringify(p.related_update_entry)) }))
      }
    }
    setEditMode(next)
  }

  const updateEditedFieldValue = (id: string, fieldIdx: number, value: string) => {
    setEditedFields(ef => {
      const fields = ef[id] ? [...ef[id]] : []
      fields[fieldIdx] = { ...fields[fieldIdx], proposed_value: value }
      return { ...ef, [id]: fields }
    })
  }

  const minorCount = proposals.filter(p => p.severity === 'minor').length

  return (
    <>
      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Severity</label>
          <select
            value={filters.severity}
            onChange={e => applyFilters({ ...filters, severity: e.target.value })}
            className="text-sm border border-gray-200 rounded px-2 py-1.5"
          >
            <option value="">All</option>
            <option value="major">Major</option>
            <option value="standard">Standard</option>
            <option value="minor">Minor</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={e => applyFilters({ ...filters, status: e.target.value })}
            className="text-sm border border-gray-200 rounded px-2 py-1.5"
          >
            <option value="pending_approval">Pending</option>
            <option value="applied">Applied</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
            <option value="">All</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Project slug</label>
          <input
            type="text"
            placeholder="e.g. adora-rawai"
            value={filters.targetSlug}
            onChange={e => applyFilters({ ...filters, targetSlug: e.target.value })}
            className="text-sm border border-gray-200 rounded px-2 py-1.5 w-40"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Proposed by</label>
          <input
            type="text"
            placeholder="e.g. yogi"
            value={filters.proposedBy}
            onChange={e => applyFilters({ ...filters, proposedBy: e.target.value })}
            className="text-sm border border-gray-200 rounded px-2 py-1.5 w-28"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={filters.dateFrom}
            onChange={e => applyFilters({ ...filters, dateFrom: e.target.value })}
            className="text-sm border border-gray-200 rounded px-2 py-1.5"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={filters.dateTo}
            onChange={e => applyFilters({ ...filters, dateTo: e.target.value })}
            className="text-sm border border-gray-200 rounded px-2 py-1.5"
          />
        </div>
        <button
          onClick={() => applyFilters(DEFAULT_FILTERS)}
          className="text-xs text-gray-400 hover:text-gray-600 self-end pb-1.5"
        >
          Reset
        </button>
      </div>

      {/* Bulk actions */}
      {canApprove && minorCount > 0 && filters.status === 'pending_approval' && (
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={() => setBulkModal(true)}
            className="text-sm text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50"
          >
            Approve all minor ({minorCount})
          </button>
        </div>
      )}

      {/* Empty state */}
      {proposals.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
          <p className="text-sm text-gray-400">No proposals match the current filters</p>
        </div>
      )}

      {/* Proposal list */}
      <div className="space-y-2">
        {proposals.map(p => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Row summary */}
            <button
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${SEV_BADGE[p.severity]}`}>
                {p.severity}
              </span>
              {p.discrepancy_flag && (
                <span className="text-red-500 text-xs shrink-0" title={p.discrepancy_note ?? 'Discrepancy flagged'}>
                  ⚠ discrepancy
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {p.target_slug ?? p.target_table} — {p.update_type}
                </p>
                <p className="text-xs text-gray-400">
                  {p.fields_changed ? `${p.fields_changed.length} field${p.fields_changed.length !== 1 ? 's' : ''}` : 'No field changes'}
                  {p.related_update_entry ? ' + 1 update entry' : ''}
                </p>
              </div>
              <div className="text-right shrink-0 mr-2">
                <p className="text-xs text-gray-500 font-medium">{p.proposed_by}</p>
                <p className="text-xs text-gray-400">{relativeTime(p.proposed_at)}</p>
              </div>
              <span className="text-gray-300 shrink-0">{expanded === p.id ? '▲' : '▼'}</span>
            </button>

            {/* Expanded detail */}
            {expanded === p.id && (
              <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                {/* Source material */}
                {p.source_raw && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">
                      Source — {p.source_type ?? 'unknown'}
                    </p>
                    <div className="bg-gray-50 rounded border border-gray-100 p-3 text-xs text-gray-600 whitespace-pre-wrap font-mono">
                      {sourceExpanded.has(p.id)
                        ? p.source_raw
                        : p.source_raw.slice(0, 500) + (p.source_raw.length > 500 ? '…' : '')}
                    </div>
                    {p.source_raw.length > 500 && (
                      <button
                        className="text-xs text-teal hover:underline mt-1"
                        onClick={() => {
                          const next = new Set(sourceExpanded)
                          if (next.has(p.id)) next.delete(p.id); else next.add(p.id)
                          setSourceExpanded(next)
                        }}
                      >
                        {sourceExpanded.has(p.id) ? 'Collapse' : 'Show full source'}
                      </button>
                    )}
                  </div>
                )}

                {/* Discrepancy note */}
                {p.discrepancy_flag && p.discrepancy_note && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700">
                    <span className="font-semibold">Discrepancy: </span>{p.discrepancy_note}
                  </div>
                )}

                {/* AI session context */}
                {p.ai_session_context && (
                  <p className="text-xs text-gray-400 italic">Context: {p.ai_session_context}</p>
                )}

                {/* Field diffs */}
                {p.fields_changed && p.fields_changed.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500">Field changes</p>
                    {(editMode.has(p.id) ? editedFields[p.id] : p.fields_changed)?.map((fc, idx) => (
                      <div key={fc.field} className="border border-gray-100 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-mono font-semibold text-gray-700">{fc.field}</p>
                          {fc.ai_confidence && (
                            <span className={`text-xs font-medium ${CONFIDENCE_BADGE[fc.ai_confidence]}`}>
                              {fc.ai_confidence} confidence
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Current</p>
                            <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs font-mono text-gray-600 break-all">
                              {displayValue(fc.current_value)}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Proposed</p>
                            {editMode.has(p.id) ? (
                              <input
                                type="text"
                                value={displayValue(fc.proposed_value)}
                                onChange={e => updateEditedFieldValue(p.id, idx, e.target.value)}
                                className="w-full bg-amber-50 border border-amber-300 rounded px-2 py-1.5 text-xs font-mono"
                              />
                            ) : (
                              <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1.5 text-xs font-mono text-amber-800 break-all">
                                {displayValue(fc.proposed_value)}
                              </div>
                            )}
                          </div>
                        </div>
                        {fc.evidence && (
                          <p className="text-xs text-gray-500 italic">{fc.evidence}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Related update entry */}
                {p.related_update_entry && (
                  <div className="border border-blue-100 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-500">Project update entry (draft)</p>
                    {editMode.has(p.id) && editedEntries[p.id] ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-400">Type</label>
                            <input type="text" value={editedEntries[p.id].type}
                              onChange={e => setEditedEntries(ee => ({ ...ee, [p.id]: { ...ee[p.id], type: e.target.value } }))}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs mt-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Severity</label>
                            <select value={editedEntries[p.id].severity}
                              onChange={e => setEditedEntries(ee => ({ ...ee, [p.id]: { ...ee[p.id], severity: e.target.value } }))}
                              className="w-full border border-gray-200 rounded px-2 py-1 text-xs mt-0.5"
                            >
                              <option value="minor">minor</option>
                              <option value="standard">standard</option>
                              <option value="major">major</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Public summary</label>
                          <textarea rows={3} value={editedEntries[p.id].summary_public}
                            onChange={e => setEditedEntries(ee => ({ ...ee, [p.id]: { ...ee[p.id], summary_public: e.target.value } }))}
                            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs mt-0.5 resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Internal note</label>
                          <textarea rows={2} value={editedEntries[p.id].summary_internal ?? ''}
                            onChange={e => setEditedEntries(ee => ({ ...ee, [p.id]: { ...ee[p.id], summary_internal: e.target.value } }))}
                            className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs mt-0.5 resize-none"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-xs text-gray-600">
                          <input type="checkbox" checked={editedEntries[p.id].notify_followers}
                            onChange={e => setEditedEntries(ee => ({ ...ee, [p.id]: { ...ee[p.id], notify_followers: e.target.checked } }))}
                          />
                          Notify followers
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-1 text-xs">
                        <p><span className="text-gray-400">Type:</span> {p.related_update_entry.type} · <span className="text-gray-400">Severity:</span> {p.related_update_entry.severity}</p>
                        <p className="text-gray-700">{p.related_update_entry.summary_public}</p>
                        {p.related_update_entry.summary_internal && (
                          <p className="text-gray-400 italic">{p.related_update_entry.summary_internal}</p>
                        )}
                        <p className="text-gray-400">Notify followers: {p.related_update_entry.notify_followers ? 'yes' : 'no'}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Review notes */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Review notes (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Add a note for the audit log…"
                    value={reviewNotes[p.id] ?? ''}
                    onChange={e => setReviewNotes(rn => ({ ...rn, [p.id]: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm resize-none"
                  />
                </div>

                {/* Defer tag (shown when defer intent) */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Defer tag (optional, e.g. &quot;verify with developer&quot;)</label>
                  <input
                    type="text"
                    placeholder="Defer reason…"
                    value={deferTags[p.id] ?? ''}
                    onChange={e => setDeferTags(dt => ({ ...dt, [p.id]: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                  />
                </div>

                {/* Action buttons */}
                {canApprove ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(p.id, false)}
                      disabled={loading === p.id}
                      className="text-sm px-4 py-2 bg-teal text-white rounded-md hover:opacity-90 disabled:opacity-50"
                    >
                      {loading === p.id ? 'Applying…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => toggleEditMode(p.id, p)}
                      disabled={loading === p.id}
                      className={`text-sm px-4 py-2 rounded-md border transition-colors ${
                        editMode.has(p.id)
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {editMode.has(p.id) ? 'Cancel edit' : 'Approve & edit'}
                    </button>
                    {editMode.has(p.id) && (
                      <button
                        onClick={() => handleApprove(p.id, false)}
                        disabled={loading === p.id}
                        className="text-sm px-4 py-2 bg-amber-500 text-white rounded-md hover:opacity-90 disabled:opacity-50"
                      >
                        Apply edits
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const next = new Set(notifHold)
                        if (next.has(p.id)) next.delete(p.id); else next.add(p.id)
                        setNotifHold(next)
                        handleApprove(p.id, true)
                      }}
                      disabled={loading === p.id}
                      className="text-sm px-4 py-2 text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Approve, hold notifications
                    </button>
                    <button
                      onClick={() => handleReject(p.id)}
                      disabled={loading === p.id}
                      className="text-sm px-4 py-2 text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleDefer(p.id)}
                      disabled={loading === p.id}
                      className="text-sm px-4 py-2 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Defer
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                    View only — approver access required to take actions on proposals.
                  </p>
                )}

                {/* Link to project admin */}
                {p.target_slug && (
                  <div className="pt-1">
                    <Link
                      href={`/admin/projects/${p.target_slug}/overview`}
                      className="text-xs text-teal hover:underline"
                    >
                      Open project admin →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bulk approve minor modal */}
      {bulkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setBulkModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Approve all minor proposals?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              This will approve {minorCount} minor proposal{minorCount !== 1 ? 's' : ''} matching
              the current filters. Field changes will be applied immediately.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setBulkModal(false)}
                className="text-sm px-4 py-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkApproveMinor}
                disabled={bulkLoading}
                className="text-sm px-4 py-2 rounded-md bg-teal text-white hover:opacity-90 disabled:opacity-50"
              >
                {bulkLoading ? 'Approving…' : `Approve ${minorCount}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
