export function formatPrice(amount: number | null): string {
  if (!amount) return 'POA'
  return '฿' + amount.toLocaleString('en-US')
}

export function formatPriceFrom(amount: number | null): string {
  if (!amount) return 'Price on request'
  return 'From ฿' + amount.toLocaleString('en-US')
}

export function parseVerdict(text: string | null): {
  buyIf: string
  skipIf: string
  watchFor: string
} | null {
  if (!text) return null
  const parts = text.split('|').map((s) => s.trim())
  const get = (prefix: string) => {
    const part = parts.find((p) => p.startsWith(prefix))
    return part ? part.replace(prefix, '').trim() : ''
  }
  return {
    buyIf: get('BUY IF:'),
    skipIf: get('SKIP IF:'),
    watchFor: get('WATCH FOR:'),
  }
}
