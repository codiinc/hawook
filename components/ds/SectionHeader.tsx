import type { ReactNode } from 'react'

interface SectionHeaderProps {
  label?: string
  title: string
  note?: string
  action?: ReactNode
  level?: 2 | 3 | 4
  className?: string
}

export function SectionHeader({ label, title, note, action, level = 2, className }: SectionHeaderProps) {
  const Tag = `h${level}` as 'h2' | 'h3' | 'h4'

  return (
    <div
      className={className}
      style={{
        borderBottom: '1px solid var(--rule)',
        paddingBottom: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}
    >
      {label && (
        <div className="hw-label" style={{ marginBottom: 'var(--space-3)' }}>{label}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        <Tag
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display-4)',
            fontWeight: 'var(--fw-semibold)',
            lineHeight: 'var(--lh-title)',
            letterSpacing: 'var(--tracking-display)',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {title}
        </Tag>
        {action}
      </div>
      {note && (
        <p
          style={{
            marginTop: 'var(--space-3)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            maxWidth: 'var(--measure-prose)',
          }}
        >
          {note}
        </p>
      )}
    </div>
  )
}
