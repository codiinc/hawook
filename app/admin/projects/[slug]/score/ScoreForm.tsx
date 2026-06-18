'use client'

import { useState, useTransition } from 'react'

type DimKey = 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6'
type Dim = { score: number | null; evidence: string }

const DIM_META: { key: DimKey; label: string; weight: number; description: string }[] = [
  { key: 'd1', label: 'Developer Track Record', weight: 0.25, description: 'Years operating, completed projects, on-time delivery, legal record' },
  { key: 'd2', label: 'Location Quality', weight: 0.20, description: 'Beach distance, access, surroundings, view risk, amenities' },
  { key: 'd3', label: 'Build & Design Quality', weight: 0.15, description: 'Architect, materials spec, layout efficiency, finish quality' },
  { key: 'd4', label: 'Pricing vs Market', weight: 0.15, description: 'Price/sqm vs 3 nearest comparables, payment terms, hidden costs' },
  { key: 'd5', label: 'Ownership & Legal', weight: 0.15, description: 'Chanote freehold, foreign quota, permit status, EIA, legal entity' },
  { key: 'd6', label: 'Investment Potential', weight: 0.10, description: 'Rental demand, realistic yield, exit liquidity, capital appreciation' },
]

const WEIGHTS: Record<DimKey, number> = {
  d1: 0.25, d2: 0.20, d3: 0.15, d4: 0.15, d5: 0.15, d6: 0.10,
}

function computeScore(dims: Record<DimKey, Dim>): number | null {
  let total = 0
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const d = dims[key as DimKey]
    if (d.score == null) return null
    total += d.score * weight
  }
  return Math.round(total * 10) / 10
}

function getBadge(score: number | null): string {
  if (score == null) return '—'
  if (score >= 9.0) return 'Hawook Top Pick'
  if (score >= 8.0) return 'Hawook Recommended'
  if (score >= 7.0) return 'Listed (no badge)'
  return 'Below listing threshold'
}

const INPUT = 'text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-teal transition-colors'

export default function ScoreForm({
  slug,
  initialDims,
  isEditable,
}: {
  slug: string
  initialDims: Record<DimKey, Dim>
  isEditable: boolean
}) {
  const [dims, setDims] = useState<Record<DimKey, Dim>>(initialDims)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const liveScore = computeScore(dims)
  const liveBadge = getBadge(liveScore)

  const setScore = (key: DimKey, v: string) =>
    setDims(d => ({ ...d, [key]: { ...d[key], score: v === '' ? null : Math.min(10, Math.max(1, Number(v))) } }))

  const setEvidence = (key: DimKey, v: string) =>
    setDims(d => ({ ...d, [key]: { ...d[key], evidence: v } }))

  const save = () => {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const payload: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(dims)) {
        payload[k] = { score: v.score, evidence: v.evidence || null }
      }
      const res = await fetch(`/api/admin/projects/${slug}/score`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dimensions: payload }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Save failed')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Live score display */}
      <div className="flex items-center gap-6 bg-gray-50 rounded-lg px-5 py-4 border border-gray-200">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Calculated score</p>
          <p className="text-3xl font-semibold text-gray-900 font-mono">{liveScore ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Badge tier</p>
          <p className="text-sm font-medium text-gray-700">{liveBadge}</p>
        </div>
        {!isEditable && (
          <div className="ml-auto text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
            View only — approver access required to edit
          </div>
        )}
      </div>

      {/* Dimension inputs */}
      <div className="space-y-5">
        {DIM_META.map(({ key, label, weight, description }) => {
          const dim = dims[key]
          return (
            <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">{key.toUpperCase()}</span>
                    <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
                    <span className="text-xs text-gray-400">({(weight * 100).toFixed(0)}%)</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                </div>
                <div className="shrink-0">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    step={1}
                    value={dim.score ?? ''}
                    onChange={e => setScore(key, e.target.value)}
                    disabled={!isEditable}
                    placeholder="1–10"
                    className={`${INPUT} w-20 text-center text-lg font-semibold disabled:bg-gray-50 disabled:text-gray-400`}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Evidence note</label>
                <textarea
                  value={dim.evidence}
                  onChange={e => setEvidence(key, e.target.value)}
                  disabled={!isEditable}
                  rows={2}
                  placeholder="One-line evidence note..."
                  className={`w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-teal resize-y disabled:bg-gray-50 disabled:text-gray-400`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {isEditable && (
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={save}
            disabled={pending}
            className="text-sm bg-teal text-white px-5 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save score'}
          </button>
          {saved && <span className="text-xs text-green-600 font-medium">✓ Saved — badge updated</span>}
          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
      )}
    </div>
  )
}
