'use client'

import { useCurrency } from '@/components/CurrencyContext'
import { formatPrice } from '@/lib/fx-rates'

interface Props {
  thb: number | null
  prefix?: string
  suffix?: string
  style?: React.CSSProperties
}

export function PriceDisplay({ thb, prefix, suffix, style }: Props) {
  const { currency } = useCurrency()
  if (thb == null) return null
  return (
    <span style={style}>
      {prefix}{formatPrice(thb, currency)}{suffix}
    </span>
  )
}
