import type { ReactNode } from 'react'

type CalloutKind = 'take' | 'verdict' | 'flag'

const KINDS: Record<CalloutKind, { label: string; rule: string; color: string }> = {
  take: { label: "Hawook's Take", rule: 'var(--rule-brand)', color: 'var(--text-brand)' },
  verdict: { label: 'Verdict', rule: 'var(--rule-brand)', color: 'var(--text-brand)' },
  flag: { label: "What We'd Flag", rule: 'var(--rule-flag)', color: 'var(--text-flag)' },
}

interface CalloutProps {
  kind?: CalloutKind
  label?: string
  byline?: string
  children: ReactNode
  className?: string
}

export function Callout({ kind = 'take', label, byline, children, className }: CalloutProps) {
  const k = KINDS[kind]
  const emphatic = kind === 'verdict'

  return (
    <aside
      className={className}
      style={{
        borderLeft: `var(--border-side-rule) solid ${k.rule}`,
        paddingLeft: 'var(--space-6)',
        maxWidth: 'var(--measure-prose)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-label)',
          fontWeight: 'var(--fw-bold)',
          letterSpacing: 'var(--tracking-label)',
          textTransform: 'uppercase',
          color: k.color,
          marginBottom: 'var(--space-4)',
        }}
      >
        {label ?? k.label}
      </div>
      <div
        style={{
          fontFamily: emphatic ? 'var(--font-display)' : 'var(--font-sans)',
          fontSize: emphatic ? 'var(--text-lead)' : 'var(--text-body-lg)',
          lineHeight: emphatic ? 1.5 : 'var(--lh-editorial)',
          color: 'var(--text-primary)',
          display: 'grid',
          gap: 'var(--space-5)',
        }}
      >
        {children}
      </div>
      {byline && (
        <div
          style={{
            marginTop: 'var(--space-5)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
          }}
        >
          {byline}
        </div>
      )}
    </aside>
  )
}
