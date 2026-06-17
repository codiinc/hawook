'use client'

import { useState, useTransition } from 'react'

type Fields = {
  project_name: string
  area: string
  developer_name: string
  hawook_intro: string
  hawook_take: string
  description_public: string
  hawook_badge: string
  location_description: string
  seo_title: string
  seo_description: string
}

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

const INPUT = 'w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-teal transition-colors'
const TEXTAREA = `${INPUT} resize-y`

export default function PublicContentForm({
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
      const res = await fetch(`/api/admin/projects/${slug}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Project name">
          <input className={INPUT} value={fields.project_name} onChange={set('project_name')} />
        </Field>
        <Field label="Area">
          <input className={INPUT} value={fields.area} onChange={set('area')} />
        </Field>
        <Field label="Developer name">
          <input className={INPUT} value={fields.developer_name} onChange={set('developer_name')} />
        </Field>
        <Field label="Hawook badge">
          <select className={INPUT} value={fields.hawook_badge} onChange={set('hawook_badge')}>
            <option value="">None</option>
            <option value="recommended">Hawook Recommended</option>
            <option value="top_pick">Hawook Top Pick</option>
          </select>
        </Field>
      </div>

      <Field label="Hawook intro" hint="Short opening paragraph shown at the top of the project page">
        <textarea className={TEXTAREA} rows={4} value={fields.hawook_intro} onChange={set('hawook_intro')} />
      </Field>

      <Field label="Hawook's Take" hint="100–150 word qualitative paragraph. Stored in hawook_take.">
        <textarea className={TEXTAREA} rows={6} value={fields.hawook_take} onChange={set('hawook_take')} />
      </Field>

      <Field label="Public description" hint="Longer markdown-rendered description. Stored in description_public.">
        <textarea className={TEXTAREA} rows={8} value={fields.description_public} onChange={set('description_public')} />
      </Field>

      <Field label="Location description">
        <textarea className={TEXTAREA} rows={3} value={fields.location_description} onChange={set('location_description')} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="SEO title">
          <input className={INPUT} value={fields.seo_title} onChange={set('seo_title')} />
        </Field>
        <Field label="SEO description">
          <input className={INPUT} value={fields.seo_description} onChange={set('seo_description')} />
        </Field>
      </div>

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
