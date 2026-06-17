'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'

const COUNTRY_CODES = [
  { code: '+66', label: '+66 🇹🇭' },
  { code: '+1', label: '+1 🇺🇸' },
  { code: '+44', label: '+44 🇬🇧' },
  { code: '+61', label: '+61 🇦🇺' },
  { code: '+65', label: '+65 🇸🇬' },
  { code: '+852', label: '+852 🇭🇰' },
  { code: '+64', label: '+64 🇳🇿' },
  { code: '+49', label: '+49 🇩🇪' },
  { code: '+33', label: '+33 🇫🇷' },
  { code: '+7', label: '+7 🇷🇺' },
  { code: '+971', label: '+971 🇦🇪' },
  { code: '+91', label: '+91 🇮🇳' },
  { code: '+86', label: '+86 🇨🇳' },
  { code: '+82', label: '+82 🇰🇷' },
  { code: '+81', label: '+81 🇯🇵' },
]

const BUDGET_OPTIONS = [
  'Under 5M THB',
  '5–10M THB',
  '10–20M THB',
  '20–50M THB',
  '50M+ THB',
  'Prefer not to say',
]

const TIMEFRAME_OPTIONS = [
  'Within 3 months',
  '3–6 months',
  '6–12 months',
  'Just exploring',
]

const PERSONA_OPTIONS: { label: string; value: string }[] = [
  { label: 'Buyer for myself', value: 'buyer' },
  { label: 'Investor', value: 'investor' },
  { label: 'Agent', value: 'agent' },
  { label: 'Other', value: 'other' },
]

type Props = {
  projectSlug: string
  projectName: string
}

type FormState = {
  name: string
  email: string
  countryCode: string
  whatsappNumber: string
  budget: string
  timeframe: string
  persona: string
  message: string
  subscribeNewsletter: boolean
  agreeContact: boolean
  honeypot: string
}

type FieldError = Partial<Record<keyof FormState, string>>

export default function LeadForm({ projectSlug, projectName }: Props) {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    countryCode: '+66',
    whatsappNumber: '',
    budget: '',
    timeframe: '',
    persona: '',
    message: '',
    subscribeNewsletter: true,
    agreeContact: false,
    honeypot: '',
  })
  const [errors, setErrors] = useState<FieldError>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const next: FieldError = {}
    if (!form.name.trim()) next.name = 'Full name is required'
    if (!form.email.trim()) {
      next.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address'
    }
    if (!form.budget) next.budget = 'Please select a budget range'
    if (!form.timeframe) next.timeframe = 'Please select a timeframe'
    if (!form.persona) next.persona = 'Please select one'
    if (!form.agreeContact) next.agreeContact = 'You must agree to be contacted'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setServerError(null)

    const whatsapp = form.whatsappNumber.trim()
      ? `${form.countryCode}${form.whatsappNumber.trim().replace(/^0/, '')}`
      : undefined

    try {
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          whatsapp,
          budget: form.budget,
          timeframe: form.timeframe,
          persona: form.persona,
          message: form.message.trim() || undefined,
          project_slug: projectSlug,
          subscribe_newsletter: form.subscribeNewsletter,
          agree_contact: form.agreeContact,
          honeypot: form.honeypot,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Something went wrong')
      }

      trackEvent('lead_form_submitted', { project_slug: projectSlug })
      setSuccess(true)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong — please try again')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    const firstName = form.name.trim().split(' ')[0]
    const whatsappMsg = encodeURIComponent(
      `Hi Yogi, I just submitted an enquiry about ${projectName} on Hawook. Happy to chat now.`
    )
    return (
      <div className="border border-teal/30 rounded-xl p-6 sm:p-8 bg-teal-light">
        <p className="font-serif text-lg font-medium text-gray-900 mb-3">
          Thanks {firstName} — Yogi will be in touch within the next hour during Phuket business hours. Watch for an email from yogi@hawook.com.
        </p>
        <a
          href={`https://wa.me/66805100129?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-teal hover:text-teal-dark transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Want to chat now on WhatsApp? Click here.
        </a>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-xl p-6 sm:p-8 bg-white">
      <h3 className="font-serif text-xl font-medium text-gray-900 mb-1">Get the full details</h3>
      <p className="text-sm text-gray-500 mb-6">Yogi will send you pricing, floor plans, and current availability within the hour.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Honeypot — invisible to humans */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          aria-hidden="true"
          className="absolute -left-[9999px]"
          value={form.honeypot}
          onChange={(e) => set('honeypot', e.target.value)}
          autoComplete="off"
        />

        {/* Full name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Your full name"
            className={`w-full border rounded-md px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="your@email.com"
            className={`w-full border rounded-md px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp number <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            <select
              value={form.countryCode}
              onChange={(e) => set('countryCode', e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal bg-white"
            >
              {COUNTRY_CODES.map(({ code, label }) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
            <input
              type="tel"
              value={form.whatsappNumber}
              onChange={(e) => set('whatsappNumber', e.target.value)}
              placeholder="81 234 5678"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors"
            />
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget <span className="text-red-500">*</span>
          </label>
          <select
            value={form.budget}
            onChange={(e) => set('budget', e.target.value)}
            className={`w-full border rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal bg-white transition-colors ${errors.budget ? 'border-red-400' : 'border-gray-300'}`}
          >
            <option value="">Select a range…</option>
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.budget && <p className="mt-1 text-xs text-red-500">{errors.budget}</p>}
        </div>

        {/* Timeframe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timeframe <span className="text-red-500">*</span>
          </label>
          <select
            value={form.timeframe}
            onChange={(e) => set('timeframe', e.target.value)}
            className={`w-full border rounded-md px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal bg-white transition-colors ${errors.timeframe ? 'border-red-400' : 'border-gray-300'}`}
          >
            <option value="">Select a timeframe…</option>
            {TIMEFRAME_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.timeframe && <p className="mt-1 text-xs text-red-500">{errors.timeframe}</p>}
        </div>

        {/* Persona */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">
            I am a… <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PERSONA_OPTIONS.map(({ label, value }) => (
              <label
                key={value}
                className={`flex items-center gap-2 border rounded-md px-3 py-2.5 cursor-pointer transition-colors ${form.persona === value ? 'border-teal bg-teal-light' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <input
                  type="radio"
                  name="persona"
                  value={value}
                  checked={form.persona === value}
                  onChange={() => set('persona', value)}
                  className="accent-teal"
                />
                <span className="text-sm text-gray-800">{label}</span>
              </label>
            ))}
          </div>
          {errors.persona && <p className="mt-1 text-xs text-red-500">{errors.persona}</p>}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
            placeholder="Any specific questions, unit types, or floor preferences…"
            rows={3}
            maxLength={500}
            className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors resize-none"
          />
          <p className="mt-1 text-xs text-gray-400 text-right">{form.message.length}/500</p>
        </div>

        {/* Newsletter */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.subscribeNewsletter}
            onChange={(e) => set('subscribeNewsletter', e.target.checked)}
            className="mt-0.5 accent-teal"
          />
          <span className="text-sm text-gray-600">Subscribe to the Hawook newsletter — market updates, new listings, area guides</span>
        </label>

        {/* Agree to contact */}
        <div>
          <label className={`flex items-start gap-3 cursor-pointer ${errors.agreeContact ? 'text-red-500' : ''}`}>
            <input
              type="checkbox"
              checked={form.agreeContact}
              onChange={(e) => set('agreeContact', e.target.checked)}
              className={`mt-0.5 ${errors.agreeContact ? 'accent-red-500' : 'accent-teal'}`}
            />
            <span className={`text-sm ${errors.agreeContact ? 'text-red-600' : 'text-gray-600'}`}>
              I agree to be contacted by Hawook <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.agreeContact && <p className="mt-1 text-xs text-red-500">{errors.agreeContact}</p>}
        </div>

        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal text-white font-medium px-6 py-3 rounded-md hover:bg-teal-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending…' : 'Send enquiry'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Your details are shared with Hawook only. No spam, no third-party sharing.
        </p>
      </form>
    </div>
  )
}
