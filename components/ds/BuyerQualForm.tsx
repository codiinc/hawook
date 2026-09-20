'use client'

import { useState, useId } from 'react'

interface BuyerQualFormProps {
  projectSlug: string
  projectName: string
  initialEmail: string | undefined
}

const UNLOCK_ITEMS = [
  {
    title: 'Price list by unit type',
    subtitle: 'Full pricing for all available units',
  },
  {
    title: 'Floor plans',
    subtitle: 'PDF layouts for every unit configuration',
  },
  {
    title: 'Payment schedule',
    subtitle: 'Developer payment plan structure',
  },
  {
    title: 'Direct developer contact',
    subtitle: 'Introduction to the sales team when ready',
  },
]

const BUDGET_STEPS = [
  'Under THB 3M',
  'THB 3M – 5M',
  'THB 5M – 8M',
  'THB 8M – 12M',
  'THB 12M – 20M',
  'Over THB 20M',
]

const TIMELINE_STEPS = [
  'Just researching',
  '12+ months',
  '6–12 months',
  '3–6 months',
  '1–3 months',
  'Ready now',
]

export function BuyerQualForm({ projectSlug, projectName }: BuyerQualFormProps) {
  const id = useId()
  const budgetId = `${id}-budget`
  const timelineId = `${id}-timeline`

  const [budgetIdx, setBudgetIdx] = useState(2)
  const [timelineIdx, setTimelineIdx] = useState(3)
  const [buyerType, setBuyerType] = useState<string>('')
  const [experience, setExperience] = useState<string>('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectSlug}/buyer-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: projectName,
          budget: BUDGET_STEPS[budgetIdx],
          timeline: TIMELINE_STEPS[timelineIdx],
          buyer_type: buyerType,
          experience,
          phone,
          notes,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.09em',
            textTransform: 'uppercase' as const,
            color: 'var(--ink-400)',
            marginBottom: '8px',
          }}
        >
          Buyer enquiry
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-title)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 12px',
          }}
        >
          Request price list &amp; floor plans
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-body)',
            color: 'var(--text-secondary)',
            maxWidth: 'var(--measure-prose)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Tell us a little about your search and we will send you the full price list, floor plans, and payment schedule for {projectName}.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '48px',
          alignItems: 'start',
        }}
      >
        {/* Form */}
        <div>
          {submitted ? (
            <div
              style={{
                background: 'var(--navy-50)',
                border: '1px solid var(--navy-200)',
                borderRadius: '2px',
                padding: '32px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--text-primary)',
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                Request received.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--text-secondary)',
                  margin: '8px 0 0',
                }}
              >
                We will email you within one business day.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '28px' }}>
              {/* Budget */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <label
                    htmlFor={budgetId}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.09em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--ink-400)',
                    }}
                  >
                    Budget range
                  </label>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--ink-900)',
                    }}
                  >
                    {BUDGET_STEPS[budgetIdx]}
                  </span>
                </div>
                <input
                  id={budgetId}
                  type="range"
                  min={0}
                  max={BUDGET_STEPS.length - 1}
                  step={1}
                  value={budgetIdx}
                  onChange={(e) => setBudgetIdx(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--navy-900)' }}
                />
              </div>

              {/* Timeline */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <label
                    htmlFor={timelineId}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.09em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--ink-400)',
                    }}
                  >
                    Purchase timeline
                  </label>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--ink-900)',
                    }}
                  >
                    {TIMELINE_STEPS[timelineIdx]}
                  </span>
                </div>
                <input
                  id={timelineId}
                  type="range"
                  min={0}
                  max={TIMELINE_STEPS.length - 1}
                  step={1}
                  value={timelineIdx}
                  onChange={(e) => setTimelineIdx(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--navy-900)' }}
                />
              </div>

              {/* Buyer type */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--ink-400)',
                    marginBottom: '12px',
                  }}
                >
                  I am buying as
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Investment', 'Personal use', 'Both'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setBuyerType(opt)}
                      style={{
                        background: buyerType === opt ? 'var(--navy-900)' : 'var(--sand-200)',
                        color: buyerType === opt ? '#fff' : 'var(--ink-700)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        fontWeight: 500,
                        padding: '8px 16px',
                        borderRadius: '2px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--ink-400)',
                    marginBottom: '12px',
                  }}
                >
                  Phuket property experience
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['First purchase', 'Own 1–2 properties', '3+ properties'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setExperience(opt)}
                      style={{
                        background: experience === opt ? 'var(--navy-900)' : 'var(--sand-200)',
                        color: experience === opt ? '#fff' : 'var(--ink-700)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        fontWeight: 500,
                        padding: '8px 16px',
                        borderRadius: '2px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--ink-400)',
                    marginBottom: '12px',
                  }}
                >
                  Phone (optional)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '15px',
                      color: 'var(--ink-500)',
                      background: 'var(--sand-100)',
                      border: '1px solid var(--sand-300)',
                      borderRadius: '2px',
                      padding: '12px 14px',
                      flexShrink: 0,
                    }}
                  >
                    +66
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="812 345 678"
                    style={{
                      flex: 1,
                      fontFamily: 'var(--font-sans)',
                      fontSize: '15px',
                      color: 'var(--ink-900)',
                      background: '#fff',
                      border: '1px solid var(--sand-300)',
                      borderRadius: '2px',
                      padding: '12px 14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--ink-400)',
                    marginBottom: '12px',
                  }}
                >
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Specific unit types, views, or other requirements"
                  style={{
                    width: '100%',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '15px',
                    color: 'var(--ink-900)',
                    background: '#fff',
                    border: '1px solid var(--sand-300)',
                    borderRadius: '2px',
                    padding: '12px 14px',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {error && (
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    color: 'var(--terracotta-500)',
                    margin: 0,
                  }}
                >
                  {error}
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'var(--navy-900)',
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '15px',
                    fontWeight: 600,
                    padding: '0 32px',
                    height: '48px',
                    borderRadius: '2px',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting ? 'Sending…' : 'Submit request'}
                </button>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    color: 'var(--ink-400)',
                    margin: '12px 0 0',
                    lineHeight: 1.5,
                  }}
                >
                  By submitting you agree to our terms of service. We will not share your details with third parties without your consent.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* What you unlock panel */}
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--sand-300)',
            borderRadius: '2px',
            padding: '32px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.09em',
              textTransform: 'uppercase' as const,
              color: 'var(--ink-400)',
              marginBottom: '20px',
            }}
          >
            What you unlock
          </div>
          <div style={{ display: 'grid', gap: '20px' }}>
            {UNLOCK_ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '2px',
                    background: 'var(--navy-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--navy-900)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--ink-900)',
                      marginBottom: '2px',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--ink-500)',
                    }}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: '28px',
              padding: '16px',
              background: 'var(--sand-200)',
              borderRadius: '2px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--ink-500)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Requests are typically reviewed within one business day.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
