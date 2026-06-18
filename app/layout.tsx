import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Nav from '@/components/Nav'
import AnalyticsEvents from '@/components/AnalyticsEvents'
import FooterWrapper from '@/components/FooterWrapper'
import CookieConsent from '@/components/CookieConsent'

export const metadata: Metadata = {
  title: {
    default: 'Hawook — Phuket Property, Honestly Reviewed',
    template: '%s | Hawook',
  },
  description: 'Browse off-plan developments in Phuket with independent pricing, ROI analysis, and area guides — no sales spin.',
  metadataBase: new URL('https://app.hawook.com'),
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {GA_ID && (
          <>
            {/* Consent Mode v2 — deny-by-default before any user consent signal */}
            <Script id="ga-consent-defaults" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('consent', 'default', {
                  'ad_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied',
                  'analytics_storage': 'denied'
                });
              `}
            </Script>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: true });
              `}
            </Script>
          </>
        )}
        <AnalyticsEvents />
        <Nav />
        <main>{children}</main>
        <FooterWrapper />
        <CookieConsent />
      </body>
    </html>
  )
}
