'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type Currency, CURRENCIES } from '@/lib/fx-rates'

interface CurrencyContextValue {
  currency: Currency
  setCurrency: (c: Currency) => void
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'THB',
  setCurrency: () => {},
})

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('THB')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hawook-currency') as Currency | null
      if (saved && (CURRENCIES as string[]).includes(saved)) setCurrencyState(saved)
    } catch {}
  }, [])

  function setCurrency(c: Currency) {
    setCurrencyState(c)
    try { localStorage.setItem('hawook-currency', c) } catch {}
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
