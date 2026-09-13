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
  openGraph: {
    siteName: 'Hawook',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hawook',
  },
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hawook',
  legalName: 'The Chokdee Group Co., Ltd.',
  url: 'https://app.hawook.com',
  email: 'hello@hawook.com',
  description: 'Independent Phuket property consultancy providing honest, data-driven reviews of off-plan developments in Phuket, Thailand.',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+66-80-510-0129',
    email: 'hello@hawook.com',
    contactType: 'customer service',
    availableLanguage: 'English',
  },
  areaServed: { '@type': 'Place', name: 'Phuket, Thailand' },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <AnalyticsEvents />
        <Nav />
        <main>{children}</main>
        <FooterWrapper />
        <CookieConsent />
      </body>
    </html>
  )
}
