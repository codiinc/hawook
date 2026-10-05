'use client'

import { useCurrency } from '@/components/CurrencyContext'
import { CURRENCIES, type Currency } from '@/lib/fx-rates'

interface Props {
  /** 'inline' = compact pill row; 'bar' = full-width bar with disclaimer */
  variant?: 'inline' | 'bar'
}

export function CurrencyToggle({ variant = 'inline' }: Props) {
  const { currency, setCurrency } = useCurrency()

  if (variant === 'bar') {
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px 16px',
          padding: '10px 0',
          borderBottom: '1px solid var(--rule)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', flexShrink: 0 }}>
          Display currency:
        </span>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c as Currency)}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: currency === c ? 600 : 400,
                color: currency === c ? 'var(--text-on-inverse)' : 'var(--text-secondary)',
                background: currency === c ? 'var(--navy-900)' : 'transparent',
                border: '1px solid',
                borderColor: currency === c ? 'var(--navy-900)' : 'var(--rule)',
                borderRadius: '4px',
                padding: '3px 8px',
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>
        {currency !== 'THB' && (
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            Approximate — THB is the contract currency
          </span>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {CURRENCIES.map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c as Currency)}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: currency === c ? 600 : 400,
            color: currency === c ? 'var(--text-on-inverse)' : 'var(--text-tertiary)',
            background: currency === c ? 'var(--navy-900)' : 'transparent',
            border: 'none',
            borderRadius: '3px',
            padding: '2px 6px',
            cursor: 'pointer',
          }}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
