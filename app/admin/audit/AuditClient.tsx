'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuditEntry {
  id:               string
  actor_id:         string | null
  actor_email:      string | null
  action:           string
  target_table:     string | null
  target_record_id: string | null
  target_slug:      string | null
  summary:          string | null
  metadata:         Record<string, unknown> | null
  created_at:       string
}

// ── Style maps ────────────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
  approved:    'bg-green-100 text-green-700',
  rejected:    'bg-red-100 text-red-700',
  deferred:    'bg-amber-100 text-amber-700',
  published:   'bg-teal-100 text-teal-700',
  unpublished: 'bg-gray-100 text-gray-600',
  archived:    'bg-orange-100 text-orange-700',
  direct_edit: 'bg-blue-100 text-blue-700',
  proposed:    'bg-purple-100 text-purple-700',
  failed:      'bg-red-100 text-red-700',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTs(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
}

function actorInitial(email: string | null): string {
  if (!email) return '?'
  return email[0].toUpperCase()
}

// ── Filter state ──────────────────────────────────────────────────────────────

interface Filters {
  action:      string
  actorEmail:  string
  targetTable: string
  targetSlug:  string
  dateFrom:    string
  dateTo:      string
}

const DEFAULT_FILTERS: Filters = {
  action: '', actorEmail: '', targetTable: '', targetSlug: '', dateFrom: '', dateTo: '',
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AuditClient({
  initialEntries,
  initialCount,
}: {
  initialEntries: Record<string, unknown>[]
  initialCount:   number
}) {
  const cast = (e: Record<string, unknown>) => e as unknown as AuditEntry

  const [entries, setEntries]   = useState<AuditEntry[]>(initialEntries.map(cast))
  const [count, setCount]       = useState(initialCount)
  const [page, setPage]         = useState(1)
  const [filters, setFilters]   = useState<Filters>(DEFAULT_FILTERS)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const pageSize = 50
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const refetch = useCallback(async (f: Filters, p: number) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p) })
    if (f.action)      params.set('action', f.action)
    if (f.actorEmail)  params.set('actor_email', f.actorEmail)
    if (f.targetTable) params.set('target_table', f.targetTable)
    if (f.targetSlug)  params.set('target_slug', f.targetSlug)
    if (f.dateFrom)    params.set('date_from', f.dateFrom)
    if (f.dateTo)      params.set('date_to', f.dateTo)
    const res = await fetch(`/api/admin/audit?${params}`)
    if (res.ok) {
      const json = await res.json() as { entries: Record<string, unknown>[]; count: number }
      setEntries(json.entries.map(cast))
      setCount(json.count)
    }
    setLoading(false)
  }, [])

  const applyFilters = (next: Filters) => {
    setFilters(next)
    setPage(1)
    refetch(next, 1)
  }

  const goToPage = (p: number) => {
    setPage(p)
    refetch(filters, p)
    setExpanded(null)
  }

  return (
    <>
      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Action</label>
          <select
            value={filters.action}
            onChange={e => applyFilters({ ...filters, action: e.target.value })}
            className="text-sm border border-gray-200 rounded px-2 py-1.5"
          >
            <option value="">All</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
            <option value="deferred">deferred</option>
            <option value="published">published</option>
            <option value="unpublished">unpublished</option>
            <option value="archived">archived</option>
            <option value="direct_edit">direct_edit</option>
            <option value="failed">failed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Actor email</label>
          <input type="text" placeholder="codi@chokdee.co" value={filters.actorEmail}
            onChange={e => applyFilters({ ...filters, actorEmail: e.target.value })}
            className="text-sm border border-gray-200 rounded px-2 py-1.5 w-44"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Table</label>
          <select value={filters.targetTable}
            onChange={e => applyFilters({ ...filters, targetTable: e.target.value })}
            className="text-sm border border-gray-200 rounded px-2 py-1.5"
          >
            <option value="">All</option>
            <option value="projects">projects</option>
            <option value="update_proposals">proposals</option>
            <option value="project_updates">project_updates</option>
            <option value="audit_log">audit_log</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Slug</label>
          <input type="text" placeholder="adora-rawai" value={filters.targetSlug}
            onChange={e => applyFilters({ ...filters, targetSlug: e.target.value })}
            className="text-sm border border-gray-200 rounded px-2 py-1.5 w-36"
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

      {/* Stats + loading */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">{count} entries</p>
        {loading && <span className="text-xs text-gray-400">Loading…</span>}
      </div>

      {/* Empty state */}
      {entries.length === 0 && !loading && (
        <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
          <p className="text-sm text-gray-400">No audit entries match the current filters</p>
        </div>
      )}

      {/* Entry list */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-50">
        {entries.map(entry => (
          <div key={entry.id}>
            <button
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              {/* Actor avatar */}
              <div className="shrink-0 w-7 h-7 rounded-full bg-teal/10 flex items-center justify-center text-xs font-semibold text-teal mt-0.5">
                {actorInitial(entry.actor_email)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded ${ACTION_COLORS[entry.action] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {entry.action}
                  </span>
                  <span className="text-xs text-gray-500">{entry.actor_email ?? 'system'}</span>
                  {entry.target_slug && (
                    <>
                      <span className="text-xs text-gray-300">→</span>
                      <span className="text-xs text-gray-600 font-medium">{entry.target_slug}</span>
                    </>
                  )}
                </div>
                {entry.summary && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.summary}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-gray-400 whitespace-nowrap">{formatTs(entry.created_at)}</p>
                {entry.target_slug && entry.target_table === 'projects' && (
                  <span className="text-xs text-gray-300">
                    ↑ click to expand
                  </span>
                )}
              </div>
            </button>

            {/* Expanded: metadata + link */}
            {expanded === entry.id && (
              <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 space-y-2">
                {entry.target_slug && entry.target_table === 'projects' && (
                  <Link
                    href={`/admin/projects/${entry.target_slug}/overview`}
                    className="text-xs text-teal hover:underline"
                  >
                    Open project admin →
                  </Link>
                )}
                {entry.metadata && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Metadata</p>
                    <pre className="text-xs text-gray-600 bg-white border border-gray-200 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(entry.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            Page {page} of {totalPages} · {count} total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
              className="text-sm px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
            >
              ← Prev
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || loading}
              className="text-sm px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
