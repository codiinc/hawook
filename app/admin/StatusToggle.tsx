'use client'

import { useState, useTransition } from 'react'

type PageStatus = 'draft' | 'published' | 'archived'

const CONFIRM_COPY: Record<PageStatus, string> = {
  published: 'Publishing makes this project visible on the public site and indexable by search engines. Confirm?',
  draft: 'Unpublishing removes this project from the public site. Existing followers will not be notified. Confirm?',
  archived: 'Archiving removes this project from public view permanently. Use for sold-out or discontinued projects. Confirm?',
}

const STATUS_CLASSES: Record<PageStatus, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-500',
  archived: 'bg-red-50 text-red-400',
}

export default function StatusToggle({
  slug,
  initialStatus,
}: {
  slug: string
  initialStatus: PageStatus | null
}) {
  const [status, setStatus] = useState<PageStatus>(initialStatus ?? 'draft')
  const [confirmTarget, setConfirmTarget] = useState<PageStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleChange = (next: PageStatus) => {
    if (next === status || pending) return
    setConfirmTarget(next)
  }

  const confirm = () => {
    if (!confirmTarget) return
    const next = confirmTarget
    setConfirmTarget(null)
    setError(null)
    startTransition(async () => {
      const res = await fetch(`/api/admin/projects/${slug}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_status: next }),
      })
      if (res.ok) {
        setStatus(next)
      } else {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Update failed')
      }
    })
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <select
          value={status}
          onChange={e => handleChange(e.target.value as PageStatus)}
          disabled={pending}
          className={`text-xs font-medium px-2 py-0.5 rounded border border-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal appearance-none pr-5 ${STATUS_CLASSES[status]} disabled:opacity-50`}
          style={{ backgroundImage: 'none' }}
        >
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmTarget(null)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Confirm status change</h2>
            <p className="text-sm text-gray-600 mb-6">{CONFIRM_COPY[confirmTarget]}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmTarget(null)}
                className="text-sm px-4 py-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirm}
                className="text-sm px-4 py-2 rounded-md bg-teal text-white hover:opacity-90 transition-opacity"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
