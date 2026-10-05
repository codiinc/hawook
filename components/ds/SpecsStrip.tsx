interface SpecsStripProps {
  items: Array<{ label: string; value: string }>
}

export function SpecsStrip({ items }: SpecsStripProps) {
  if (items.length === 0) return null

  return (
    <>
      <style>{`
        .specs-strip-inner {
          display: flex;
          min-height: 96px;
          align-items: stretch;
        }
        .specs-strip-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          padding: 20px 24px;
        }
        .specs-strip-item + .specs-strip-item {
          border-left: 1px solid var(--sand-300);
        }
        @media (max-width: 480px) {
          .specs-strip-inner {
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: auto;
          }
          .specs-strip-item {
            padding: 16px 18px;
          }
          .specs-strip-item + .specs-strip-item {
            border-left: none;
          }
          .specs-strip-item:nth-child(even) {
            border-left: 1px solid var(--sand-300);
          }
          .specs-strip-item:nth-child(n+3) {
            border-top: 1px solid var(--sand-300);
          }
        }
      `}</style>
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
          }}
        >
          <div className="specs-strip-inner">
            {items.map((item, i) => (
              <div key={i} className="specs-strip-item">
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
                    overflowWrap: 'break-word',
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
