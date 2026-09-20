interface VerdictCardsProps {
  buyIf: string | null
  skipIf: string | null
  watchFor: string | null
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

interface CardProps {
  iconBg: string
  icon: React.ReactNode
  label: string
  labelColor: string
  body: string
}

function VerdictCard({ iconBg, icon, label, labelColor, body }: CardProps) {
  return (
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
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '2px',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.09em',
            textTransform: 'uppercase' as const,
            color: labelColor,
          }}
        >
          {label}
        </span>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--ink-700)',
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  )
}

export function VerdictCards({ buyIf, skipIf, watchFor }: VerdictCardsProps) {
  const cards = [
    buyIf && {
      iconBg: 'var(--navy-900)',
      icon: <CheckIcon />,
      label: 'Buy if',
      labelColor: 'var(--navy-900)',
      body: buyIf,
    },
    skipIf && {
      iconBg: 'var(--terracotta-500)',
      icon: <XIcon />,
      label: 'Skip if',
      labelColor: 'var(--terracotta-500)',
      body: skipIf,
    },
    watchFor && {
      iconBg: 'var(--brass-600)',
      icon: <EyeIcon />,
      label: 'Watch for',
      labelColor: 'var(--brass-600)',
      body: watchFor,
    },
  ].filter(Boolean) as CardProps[]

  if (cards.length === 0) return null

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
      }}
    >
      {cards.map((card, i) => (
        <VerdictCard key={i} {...card} />
      ))}
    </div>
  )
}
