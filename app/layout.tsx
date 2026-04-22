import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: {
    default: 'Hawook — Phuket Property, Honestly Reviewed',
    template: '%s | Hawook',
  },
  description: 'Browse off-plan developments in Phuket with independent pricing, ROI analysis, and area guides — no sales spin.',
  metadataBase: new URL('https://app.hawook.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
