interface CompProject {
  name: string
  developer?: string
  area?: string
  score?: number
  priceFrom?: string
  sizeRange?: string
  units?: number
  tenure?: string
  pricePerSqm?: string
  notes?: string
}

interface MarketCompGridProps {
  comps: CompProject[]
}

export function MarketCompGrid({ comps }: MarketCompGridProps) {
  if (!comps || comps.length === 0) return null

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
          Members only
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-title)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Market comparison
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}
      >
        {comps.map((comp, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              border: '1px solid var(--sand-300)',
              borderRadius: '2px',
              padding: '32px',
            }}
          >
            {/* Head */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: 'var(--navy-900)',
                    lineHeight: 1.2,
                    marginBottom: '4px',
                  }}
                >
                  {comp.name}
                </div>
                {(comp.developer || comp.area) && (
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      color: 'var(--ink-500)',
                    }}
                  >
                    {[comp.developer, comp.area].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
              {comp.score != null && (
                <div
                  className="hw-num"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--navy-900)',
                    flexShrink: 0,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {comp.score.toFixed(1)}
                </div>
              )}
            </div>

            {/* Data rows */}
            <div style={{ display: 'grid', gap: '0', marginBottom: comp.notes ? '16px' : 0 }}>
              {[
                comp.priceFrom && { label: 'Price from', value: comp.priceFrom },
                comp.sizeRange && { label: 'Sizes', value: comp.sizeRange },
                comp.units != null && { label: 'Units', value: String(comp.units) },
                comp.tenure && { label: 'Tenure', value: comp.tenure },
                comp.pricePerSqm && { label: 'Price/sqm', value: comp.pricePerSqm },
              ]
                .filter(Boolean)
                .map((row, j) => {
                  const r = row as { label: string; value: string }
                  return (
                    <div
                      key={j}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: '16px',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--sand-300)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '14px',
                          color: 'var(--ink-500)',
                        }}
                      >
                        {r.label}
                      </span>
                      <span
                        className="hw-num"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--ink-900)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {r.value}
                      </span>
                    </div>
                  )
                })}
            </div>

            {comp.notes && (
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'var(--ink-500)',
                  margin: '16px 0 0',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--sand-300)',
                  lineHeight: 1.5,
                }}
              >
                {comp.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Summary strip */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
          background: '#fff',
          border: '1px solid var(--sand-300)',
          borderRadius: '2px',
          padding: '20px 24px',
          marginTop: '16px',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--navy-900)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, marginTop: '2px' }}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: 'var(--ink-700)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Published prices at time of research. Hawook does not mark up prices or earn commission on unit sales.
        </p>
      </div>
    </section>
  )
}
