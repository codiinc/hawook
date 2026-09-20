interface SpecsStripProps {
  items: Array<{ label: string; value: string }>
}

export function SpecsStrip({ items }: SpecsStripProps) {
  if (items.length === 0) return null

  return (
    <div
      style={{
        background: '#fff',
        borderBottom: '1px solid var(--sand-300)',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container)',
          margin: '0 auto',
          padding: '0 var(--gutter-lg)',
          display: 'flex',
          minHeight: '96px',
          alignItems: 'stretch',
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '6px',
              padding: '20px 24px',
              borderLeft: i > 0 ? '1px solid var(--sand-300)' : 'none',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.09em',
                textTransform: 'uppercase' as const,
                color: 'var(--ink-400)',
              }}
            >
              {item.label}
            </span>
            <span
              className="hw-num"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--ink-900)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
