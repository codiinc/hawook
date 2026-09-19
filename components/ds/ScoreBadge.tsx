interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md'
  className?: string
}

export function ScoreBadge({ score, size = 'md', className }: ScoreBadgeProps) {
  const tier = score >= 9 ? 'toppick' : score >= 8 ? 'recommended' : null
  if (!tier) return null

  const color = tier === 'toppick' ? 'var(--score-toppick)' : 'var(--score-recommended)'
  const barW = size === 'sm' ? 14 : 18

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-sans)',
        fontSize: size === 'sm' ? 'var(--text-label)' : 'var(--text-xs)',
        fontWeight: 'var(--fw-bold)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color,
      }}
    >
      <span aria-hidden="true" style={{ width: barW, height: 2, background: color, display: 'inline-block' }} />
      {tier === 'toppick' ? 'Top Pick' : 'Recommended'}
    </span>
  )
}
