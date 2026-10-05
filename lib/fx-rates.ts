// FX rates: 1 THB → each currency
// Snapshot: 5 October 2026 (source: xe.com)
// Update manually every 30 days. Flag to whoever owns this — see Sprint 02 C1 backlog.
export const FX_SNAPSHOT_DATE = '5 Oct 2026'

export type Currency = 'THB' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'SGD'

export const CURRENCIES: Currency[] = ['THB', 'USD', 'EUR', 'GBP', 'AUD', 'SGD']

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  THB: '฿',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  SGD: 'S$',
}

// Rates: how many units of the target currency equals 1 THB
export const FX_RATES: Record<Currency, number> = {
  THB: 1,
  USD: 0.0283,
  EUR: 0.0261,
  GBP: 0.0219,
  AUD: 0.0440,
  SGD: 0.0374,
}

export function convertFromTHB(thb: number, to: Currency): number {
  return thb * FX_RATES[to]
}

export function formatPrice(thb: number, currency: Currency): string {
  const amount = convertFromTHB(thb, currency)
  const sym = CURRENCY_SYMBOLS[currency]

  if (currency === 'THB') {
    return `฿${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }

  // Round to nearest sensible unit
  if (amount >= 1_000_000) {
    return `${sym}${(amount / 1_000_000).toFixed(2)}M`
  }
  if (amount >= 1_000) {
    return `${sym}${Math.round(amount / 1000)}k`
  }
  return `${sym}${Math.round(amount).toLocaleString('en-US')}`
}
