import Link from 'next/link'

export function GateBand() {
  const lockedRows = [
    'Full scoring breakdown — all 6 dimensions',
    'Price per sqm across unit types',
    'Developer financial history',
    'Private buyer Q&A (members only)',
    'Yield calculator and ROI model',
  ]

  return (
    <div
      style={{
        background: 'var(--navy-900)',
        width: '100%',
        padding: '72px var(--gutter-lg)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Lock icon */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '34px',
            fontWeight: 700,
            lineHeight: 1.1,
            color: '#fff',
            maxWidth: '560px',
            margin: '0 0 12px',
          }}
        >
          See the full analysis
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '480px',
            margin: '0 0 40px',
            lineHeight: 1.6,
          }}
        >
          Create a free account to unlock the complete scoring breakdown, yield model, and private buyer Q&A.
        </p>

        {/* Locked preview rows */}
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            marginBottom: '40px',
          }}
        >
          {lockedRows.map((row, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                {row}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.25)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                —
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/signup"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
            color: 'var(--navy-900)',
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            fontWeight: 600,
            padding: '14px 32px',
            borderRadius: '2px',
            textDecoration: 'none',
            marginBottom: '16px',
          }}
        >
          Sign up free
        </Link>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.3)',
            margin: 0,
          }}
        >
          No credit card required.
        </p>
      </div>
    </div>
  )
}
