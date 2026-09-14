export const SCORE_DIMENSIONS = [
  { label: 'Developer Track Record', weight: 0.2 },
  { label: 'Location', weight: 0.2 },
  { label: 'Build & Design', weight: 0.15 },
  { label: 'Pricing vs Market', weight: 0.2 },
  { label: 'Ownership & Legal', weight: 0.1 },
  { label: 'Investment Potential', weight: 0.15 },
]

interface Dimension {
  label: string
  score?: number
  weight: number
}

interface ScoreBreakdownProps {
  dimensions?: Dimension[]
  locked?: boolean
  columns?: 2 | 3
  variant?: 'bars' | 'ledger'
  className?: string
}

export function ScoreBreakdown({
  dimensions = SCORE_DIMENSIONS,
  locked = false,
  columns = 2,
  variant = 'bars',
  className,
}: ScoreBreakdownProps) {
  if (variant === 'ledger') {
    return (
      <table className={className} style={{ width: '100%', fontFamily: 'var(--font-sans)', borderCollapse: 'collapse' }}>
        <tbody>
          {dimensions.map((d) => (
            <tr key={d.label} style={{ borderTop: '1px solid var(--rule)' }}>
              <td style={{ padding: '10px 0', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{d.label}</td>
              <td style={{ padding: '10px 0', width: 120, textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(d.weight * 100)}% weight
              </td>
              <td style={{ padding: '10px 0 10px 20px', width: 64, textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: 'var(--text-title)', fontWeight: 'var(--fw-semibold)', color: locked ? 'var(--score-locked)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {locked || d.score == null ? '—' : d.score.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        columnGap: 'var(--space-8)',
        rowGap: 'var(--space-5)',
      }}
    >
      {dimensions.map((d) => (
        <div key={d.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--space-4)', marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
              {d.label}
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', color: locked ? 'var(--score-locked)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {locked || d.score == null ? '—' : d.score.toFixed(1)}
            </span>
          </div>
          <div style={{ height: 3, background: 'var(--score-bar-track)', position: 'relative' }}>
            {!locked && d.score != null && (
              <span style={{ position: 'absolute', inset: 0, width: `${(d.score / 10) * 100}%`, background: 'var(--score-bar-fill)' }} />
            )}
          </div>
          <div style={{ marginTop: 5, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
            {Math.round(d.weight * 100)}% of score
          </div>
        </div>
      ))}
    </div>
  )
}
