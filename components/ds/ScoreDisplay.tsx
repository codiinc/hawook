'use client'

import { useState } from 'react'
import { ScoreBadge } from './ScoreBadge'

interface ScoreDimension {
  label: string
  score: number
  weight: number
}

interface ScoreDisplayProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  locked?: boolean
  dimensionsLocked?: boolean
  badge?: boolean
  strip?: boolean
  dimensions?: ScoreDimension[]
  label?: string
  align?: 'left' | 'center'
  className?: string
}

const NUM_SIZE: Record<string, string> = {
  sm: 'var(--text-display-4)',
  md: 'var(--text-display-3)',
  lg: 'var(--text-display-1)',
}

export function ScoreDisplay({
  score,
  size = 'sm',
  locked = false,
  dimensionsLocked,
  badge = true,
  strip = false,
  dimensions,
  label = 'Hawook Score',
  align = 'left',
  className,
}: ScoreDisplayProps) {
  const [hover, setHover] = useState<number | null>(null)
  const showStrip = strip && dimensions && dimensions.length > 0
  const dimLocked = dimensionsLocked ?? locked
  const isLg = size === 'lg'

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        gap: isLg ? 'var(--space-3)' : 'var(--space-1)',
      }}
    >
      <span className="hw-label">{label}</span>

      <span style={{ display: 'flex', alignItems: 'baseline', gap: isLg ? 'var(--space-4)' : 'var(--space-3)' }}>
        <span
          className="hw-num"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: NUM_SIZE[size],
            fontWeight: 'var(--fw-semibold)',
            lineHeight: 'var(--lh-display-tight)',
            letterSpacing: 'var(--tracking-display)',
            color: locked ? 'var(--score-locked)' : 'var(--text-primary)',
          }}
        >
          {locked ? '—' : score.toFixed(1)}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isLg ? 'var(--text-display-4)' : 'var(--text-sm)',
            color: 'var(--text-tertiary)',
          }}
        >
          /10
        </span>
      </span>

      {badge && !locked && <ScoreBadge score={score} size={size === 'sm' ? 'sm' : 'md'} />}

      {showStrip && dimensions && (
        <div style={{ position: 'relative', marginTop: 4 }} onMouseLeave={() => setHover(null)}>
          <div style={{ display: 'flex', width: isLg ? 340 : 150, gap: 2 }}>
            {dimensions.map((d, i) => (
              <div
                key={d.label}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                tabIndex={0}
                role="img"
                aria-label={`${d.label}: ${dimLocked ? 'hidden' : d.score.toFixed(1)} out of 10, ${Math.round(d.weight * 100)}% of the score`}
                style={{
                  flex: d.weight,
                  height: isLg ? 38 : 16,
                  background: 'var(--score-bar-track)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'default',
                  outline: 'none',
                  opacity: hover === null || hover === i ? 1 : 0.45,
                  transition: `opacity var(--dur-fast) var(--ease-out)`,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    height: dimLocked ? 0 : `${Math.max(6, ((d.score - 6) / 4) * 100)}%`,
                    background: hover === i ? 'var(--navy-700)' : 'var(--score-bar-fill)',
                    transition: `background var(--dur-fast) var(--ease-out)`,
                  }}
                />
              </div>
            ))}
          </div>
          <div
            aria-hidden="true"
            style={{
              marginTop: 8,
              minHeight: isLg ? 34 : 30,
              opacity: hover === null ? 0.55 : 1,
              transition: `opacity var(--dur-fast) var(--ease-out)`,
            }}
          >
            {hover === null ? (
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                Six dimensions · hover for detail
              </span>
            ) : (
              <span style={{ display: 'block', borderTop: '1px solid var(--rule-brand)', paddingTop: 6 }}>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>
                    {dimensions[hover].label}
                  </span>
                  <span
                    className="hw-num"
                    style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-title)', fontWeight: 'var(--fw-semibold)', color: dimLocked ? 'var(--score-locked)' : 'var(--text-primary)' }}
                  >
                    {dimLocked ? '—' : dimensions[hover].score.toFixed(1)}
                  </span>
                </span>
                <span style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {Math.round(dimensions[hover].weight * 100)}% of the score
                  {dimLocked ? '' : ` · contributes ${(dimensions[hover].score * dimensions[hover].weight).toFixed(2)}`}
                </span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
