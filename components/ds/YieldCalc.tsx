'use client'

import { useState, useId } from 'react'

interface YieldCalcProps {
  unitTypes: string | null
  priceMin: number | null
}

const DEFAULT_TYPES = ['Studio', '1BR', '2BR']
const PRICE_MULTIPLIERS: Record<string, number> = {
  Studio: 1,
  '1BR': 1.47,
  '2BR': 2.35,
}

function getDefaultMultiplier(type: string, allTypes: string[]): number {
  if (type in PRICE_MULTIPLIERS) return PRICE_MULTIPLIERS[type]
  const idx = allTypes.indexOf(type)
  if (idx === 0) return 1
  if (idx === 1) return 1.47
  return 2.35
}

const DEFAULT_PRICE_FALLBACK = 4_500_000 // THB

function formatTHB(n: number) {
  return `THB ${Math.round(n).toLocaleString('en')}`
}

function SliderWithFill({
  id,
  min,
  max,
  value,
  onChange,
  step,
  formatLabel,
}: {
  id: string
  min: number
  max: number
  value: number
  onChange: (v: number) => void
  step: number
  formatLabel: (v: number) => string
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div style={{ position: 'relative', height: '20px' }}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '4px',
          transform: 'translateY(-50%)',
          background: 'var(--sand-300)',
          borderRadius: '2px',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'var(--navy-900)',
            borderRadius: '2px',
          }}
        />
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
          margin: 0,
        }}
        aria-label={formatLabel(value)}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: `${pct}%`,
          width: '16px',
          height: '16px',
          background: 'var(--navy-900)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          boxShadow: 'var(--shadow-lift)',
        }}
      />
    </div>
  )
}

export function YieldCalc({ unitTypes, priceMin }: YieldCalcProps) {
  const parsedTypes = unitTypes
    ? unitTypes.split(',').map((t) => t.trim()).filter(Boolean)
    : DEFAULT_TYPES

  const [activeType, setActiveType] = useState(parsedTypes[0] || 'Studio')
  const [occupancy, setOccupancy] = useState(72)
  const [nightlyRate, setNightlyRate] = useState(2800)
  const [tenure, setTenure] = useState<'Freehold' | 'Leasehold'>('Freehold')

  const id = useId()
  const occId = `${id}-occ`
  const rateId = `${id}-rate`

  const multiplier = getDefaultMultiplier(activeType, parsedTypes)
  const unitPrice = priceMin != null ? priceMin * multiplier : DEFAULT_PRICE_FALLBACK * multiplier

  const grossRental = nightlyRate * 365 * (occupancy / 100)
  const mgmtFee = grossRental * 0.3
  const fixedDeductions = 43200 + 28800 // CAM + insurance
  const netIncome = grossRental - mgmtFee - fixedDeductions
  const netYield = (netIncome / unitPrice) * 100

  const breakdownRows: { label: string; value: number; negative?: boolean }[] = [
    { label: 'Gross rental income', value: grossRental },
    { label: 'Mgmt fee (30%)', value: -mgmtFee, negative: true },
    { label: 'Common area fees', value: -43200, negative: true },
    { label: 'Insurance & repairs', value: -28800, negative: true },
  ]

  const priceMLabel = `THB ${(unitPrice / 1_000_000).toFixed(1)}M`

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
          Yield calculator
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Inputs card */}
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--sand-300)',
            borderRadius: '2px',
            padding: '40px',
            display: 'grid',
            gap: '32px',
          }}
        >
          {/* Unit type pills */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.09em',
                textTransform: 'uppercase' as const,
                color: 'var(--ink-400)',
                marginBottom: '12px',
              }}
            >
              Unit type
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {parsedTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  style={{
                    background: activeType === type ? 'var(--navy-900)' : 'var(--sand-200)',
                    color: activeType === type ? '#fff' : 'var(--ink-700)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: '8px 16px',
                    borderRadius: '2px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Occupancy slider */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '12px',
              }}
            >
              <label
                htmlFor={occId}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--ink-400)',
                }}
              >
                Occupancy
              </label>
              <span
                className="hw-num"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--ink-900)',
                }}
              >
                {occupancy}%
              </span>
            </div>
            <SliderWithFill
              id={occId}
              min={40}
              max={95}
              step={1}
              value={occupancy}
              onChange={setOccupancy}
              formatLabel={(v) => `${v}% occupancy`}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--ink-400)',
                marginTop: '6px',
              }}
            >
              <span>40%</span>
              <span>95%</span>
            </div>
          </div>

          {/* Nightly rate slider */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '12px',
              }}
            >
              <label
                htmlFor={rateId}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--ink-400)',
                }}
              >
                Nightly rate
              </label>
              <span
                className="hw-num"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--ink-900)',
                }}
              >
                THB {nightlyRate.toLocaleString('en')}
              </span>
            </div>
            <SliderWithFill
              id={rateId}
              min={1500}
              max={6000}
              step={100}
              value={nightlyRate}
              onChange={setNightlyRate}
              formatLabel={(v) => `THB ${v} nightly rate`}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--ink-400)',
                marginTop: '6px',
              }}
            >
              <span>THB 1,500</span>
              <span>THB 6,000</span>
            </div>
          </div>

          {/* Ownership pills */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.09em',
                textTransform: 'uppercase' as const,
                color: 'var(--ink-400)',
                marginBottom: '12px',
              }}
            >
              Ownership structure
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['Freehold', 'Leasehold'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setTenure(opt)}
                  style={{
                    background: tenure === opt ? 'var(--navy-900)' : 'var(--sand-200)',
                    color: tenure === opt ? '#fff' : 'var(--ink-700)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: '8px 16px',
                    borderRadius: '2px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output card */}
        <div
          style={{
            background: 'var(--navy-900)',
            borderRadius: '2px',
            padding: '40px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.09em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '8px',
            }}
          >
            Net yield (projected)
          </div>
          <div
            className="hw-num"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '56px',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1,
              marginBottom: '32px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {netYield.toFixed(1)}%
          </div>

          {/* Breakdown nested card */}
          <div
            style={{
              background: '#fff',
              borderRadius: '2px',
              padding: '24px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--ink-400)',
                marginBottom: '16px',
              }}
            >
              Annual breakdown — {activeType}, {priceMLabel}
            </div>

            {breakdownRows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
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
                  {row.label}
                </span>
                <span
                  className="hw-num"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: row.negative ? 'var(--terracotta-500)' : 'var(--ink-900)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {row.negative ? `−${formatTHB(Math.abs(row.value)).replace('THB ', 'THB ')}` : formatTHB(row.value)}
                </span>
              </div>
            ))}

            {/* Net income row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '12px 0 0',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--ink-900)',
                }}
              >
                Net income
              </span>
              <span
                className="hw-num"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: netIncome < 0 ? 'var(--terracotta-500)' : 'var(--ink-900)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {netIncome < 0 ? `−${formatTHB(Math.abs(netIncome)).replace('THB ', 'THB ')}` : formatTHB(netIncome)}
              </span>
            </div>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.35)',
              margin: '16px 0 0',
              lineHeight: 1.5,
            }}
          >
            Projections based on stated inputs. Hawook has not independently verified occupancy rates.
          </p>
        </div>
      </div>
    </section>
  )
}
