'use client'

import { useState, useTransition } from 'react'

type Fields = {
  status: string
  price_min: string
  price_max: string
  unit_types: string
  total_units: string
  floors: string
  foreign_quota_available: string
  foreign_quota_units_remaining: string
  construction_status: string
  handover_date: string
  ownership_type: string
  cam_fee_thb_sqm: string
  sinking_fund_thb_sqm: string
  rental_program_available: string
  rental_yield_claim: string
  payment_plan: string
}

const INPUT = 'w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-teal transition-colors'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function StructuredDataForm({
  slug,
  initial,
}: {
  slug: string
  initial: Fields
}) {
  const [fields, setFields] = useState<Fields>(initial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields(f => ({ ...f, [key]: e.target.value }))

  const save = () => {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      // Convert numeric string fields back to numbers (null if empty)
      const payload: Record<string, unknown> = {
        ...fields,
        price_min: fields.price_min ? Number(fields.price_min) : null,
        price_max: fields.price_max ? Number(fields.price_max) : null,
        total_units: fields.total_units ? Number(fields.total_units) : null,
        floors: fields.floors ? Number(fields.floors) : null,
        foreign_quota_units_remaining: fields.foreign_quota_units_remaining
          ? Number(fields.foreign_quota_units_remaining)
          : null,
        cam_fee_thb_sqm: fields.cam_fee_thb_sqm ? Number(fields.cam_fee_thb_sqm) : null,
        sinking_fund_thb_sqm: fields.sinking_fund_thb_sqm ? Number(fields.sinking_fund_thb_sqm) : null,
        foreign_quota_available: fields.foreign_quota_available === 'true',
        rental_program_available: fields.rental_program_available === 'true',
      }

      const res = await fetch(`/api/admin/projects/${slug}/structured-data`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Content status">
          <select className={INPUT} value={fields.status} onChange={set('status')}>
            <option value="">—</option>
            <option value="Active">Active</option>
            <option value="Coming Soon">Coming Soon</option>
            <option value="Sold Out">Sold Out</option>
          </select>
        </Field>
        <Field label="Construction status">
          <input className={INPUT} value={fields.construction_status} onChange={set('construction_status')} placeholder="e.g. Under Construction" />
        </Field>
        <Field label="Handover date">
          <input className={INPUT} type="text" value={fields.handover_date} onChange={set('handover_date')} placeholder="e.g. Q4 2026" />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="Price min (THB)">
          <input className={INPUT} type="number" value={fields.price_min} onChange={set('price_min')} placeholder="5000000" />
        </Field>
        <Field label="Price max (THB)">
          <input className={INPUT} type="number" value={fields.price_max} onChange={set('price_max')} placeholder="12000000" />
        </Field>
        <Field label="Total units">
          <input className={INPUT} type="number" value={fields.total_units} onChange={set('total_units')} />
        </Field>
        <Field label="Floors">
          <input className={INPUT} type="number" value={fields.floors} onChange={set('floors')} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Unit types">
          <input className={INPUT} value={fields.unit_types} onChange={set('unit_types')} placeholder="Studio, 1BR, 2BR" />
        </Field>
        <Field label="Ownership type">
          <input className={INPUT} value={fields.ownership_type} onChange={set('ownership_type')} placeholder="Freehold" />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="Foreign quota">
          <select className={INPUT} value={fields.foreign_quota_available} onChange={set('foreign_quota_available')}>
            <option value="true">Available</option>
            <option value="false">Not available</option>
          </select>
        </Field>
        <Field label="Quota units remaining">
          <input className={INPUT} type="number" value={fields.foreign_quota_units_remaining} onChange={set('foreign_quota_units_remaining')} />
        </Field>
        <Field label="Rental program">
          <select className={INPUT} value={fields.rental_program_available} onChange={set('rental_program_available')}>
            <option value="true">Available</option>
            <option value="false">Not available</option>
          </select>
        </Field>
        <Field label="Rental yield claim">
          <input className={INPUT} value={fields.rental_yield_claim} onChange={set('rental_yield_claim')} placeholder="e.g. 6-8%" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="CAM fee (THB/sqm/month)">
          <input className={INPUT} type="number" value={fields.cam_fee_thb_sqm} onChange={set('cam_fee_thb_sqm')} />
        </Field>
        <Field label="Sinking fund (THB/sqm)">
          <input className={INPUT} type="number" value={fields.sinking_fund_thb_sqm} onChange={set('sinking_fund_thb_sqm')} />
        </Field>
      </div>

      <Field label="Payment plan notes">
        <textarea
          className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-teal resize-y"
          rows={3}
          value={fields.payment_plan}
          onChange={set('payment_plan')}
          placeholder="e.g. 30% on booking, 30% during construction, 40% on transfer"
        />
      </Field>

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={save}
          disabled={pending}
          className="text-sm bg-teal text-white px-5 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span className="text-xs text-green-600 font-medium">✓ Saved</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </div>
  )
}
