import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// AD-02: WP → app.hawook.com redirect layer (301/410)
//
// Runs BEFORE Supabase auth so WP redirects incur zero DB overhead.
// Migration Runner spot-checks all entries before hawook.com DNS cutover.
// ─────────────────────────────────────────────────────────────────────────────

// Exact-path redirects: WP source path → destination (absolute or root-relative)
const EXACT_REDIRECTS: Record<string, string> = {
  // ── Bang Tao land seizure cluster ─────────────────────────────────────────
  '/the-bang-tao-land-seizure-phuket-beach-crackdown-2025': '/articles/bang-tao-land-seizure-phuket',
  '/the-bang-tao-land-seizure-phuket-beach-crackdown':      '/articles/bang-tao-land-seizure-phuket',
  '/the-bang-tao-land-seizure-phuket':                      '/articles/bang-tao-land-seizure-phuket',
  '/the-bang-tao-land-seizure-why-phukets-beach-crackdown-suddenly-feels-different': '/articles/bang-tao-land-seizure-phuket',

  // ── Area guides ───────────────────────────────────────────────────────────
  '/bang-tao-guide':    '/articles/bang-tao-area-guide-property-buyers-2026',
  '/bang-tao-area':     '/articles/bang-tao-area-guide-property-buyers-2026',
  '/kata-karon-guide':  '/articles/kata-karon-area-guide-property-buyers-2026',
  '/kata-guide':        '/articles/kata-karon-area-guide-property-buyers-2026',
  '/karon-guide':       '/articles/kata-karon-area-guide-property-buyers-2026',
  '/kamala-guide':      '/articles/kamala-area-guide-property-buyers-2026',
  '/kamala-beach-investor-guide': '/articles/kamala-area-guide-property-buyers-2026',
  '/phuket-town-guide': '/articles/phuket-town-area-guide-property-buyers',
  '/phuket-town-area':  '/articles/phuket-town-area-guide-property-buyers',
  '/rawai-guide':              '/articles/rawai-nai-harn-area-guide-property-buyers-2026',
  '/rawai-area-guide':         '/articles/rawai-nai-harn-area-guide-property-buyers-2026',
  '/rawai-area':               '/articles/rawai-nai-harn-area-guide-property-buyers-2026',
  '/nai-harn-guide':           '/articles/rawai-nai-harn-area-guide-property-buyers-2026',
  '/rawai-nai-harn-guide':     '/articles/rawai-nai-harn-area-guide-property-buyers-2026',
  '/rawai-nai-harn-buyer-guide': '/areas/rawai-nai-harn',
  '/bangtao-real-estate-guide-2025-condos-villas-roi': '/areas/bang-tao',
  '/bangtao-property-market-2025-trends-and-roi':      '/areas/bang-tao',
  '/area-overview-thalang-phuket-your-guide-to-living-exploring-and-investing': '/areas/bang-tao',
  '/why-invest-property-in-naiyang-beach-everything-you-need-to-know': '/areas',

  // ── Rawai cluster (final CSV: → /areas/rawai-nai-harn) ────────────────────
  '/expat-life-living-in-phuket-with-a-family':                  '/areas/rawai-nai-harn',
  '/rawai-property-developments-is-this-phukets-last-smart-buy': '/areas/rawai-nai-harn',
  '/investing-in-rawai-nai-harn-south-phuket':                   '/areas/rawai-nai-harn',
  '/top-restaurants-in-rawai-and-naiharn':                       '/areas/rawai-nai-harn',
  '/area-overview-rawai-phuket':                                  '/areas/rawai-nai-harn',
  '/properties-in-rawai':                                         '/areas/rawai-nai-harn',
  '/properties-in-nai-harn':                                      '/areas/rawai-nai-harn',
  '/top-restaurants-in-bangtao':                                  '/areas/bang-tao',

  // ── Property management / STR ─────────────────────────────────────────────
  '/why-property-managers-in-rawai-naiharn-are-essential-for-your-investment': '/guides/short-term-rental-management-phuket',
  '/phuket-property-management-costs-what-you-need-to-know': '/guides/short-term-rental-management-phuket',
  '/short-term-rental-management-in-phuket-top-companies-market-overview': '/guides/short-term-rental-management-phuket',
  '/how-to-list-your-vacation-rental-on-google': '/articles',

  // ── Property entries (slug changes + expert-insights overrides) ───────────
  // These must appear BEFORE the /property/ prefix rule runs.
  '/property/dominion-rawai':                        '/projects/dominion-rawai',
  '/property/rhea-by-sansiri':                       '/projects/rhea-by-sansiri',
  '/property/canvas-cherngtalay':                    '/projects/canvas-cherngtalay',
  '/property/expert-insights-canvas-cherngtalay':    '/projects/canvas-cherngtalay',
  '/property/the-title-adora-rawai':                 '/projects/adora-rawai',
  '/property/the-title-adora-rawai-expert-insights': '/projects/adora-rawai',
  '/property/the-adora-rawai-expert-insights':       '/projects/adora-rawai',
  '/property/the-title-cielo':                       '/projects/the-title-cielo-rawai',
  '/property/the-title-cielo-expert-insights':       '/projects/the-title-cielo-rawai',
  '/property/expert-insights-the-title-cielo':       '/projects/the-title-cielo-rawai',
  '/property/the-modeva':                            '/projects/the-modeva-bang-tao',
  '/property/the-modeva-expert-insights':            '/projects/the-modeva-bang-tao',
  '/property/expert-insights-the-modeva':            '/projects/the-modeva-bang-tao',

  // ── Leasehold cluster ─────────────────────────────────────────────────────
  '/leasehold-vs-freehold-in-thailand-real-pros-cons-for-foreign-buyers': '/guides/leasehold-vs-freehold-thailand',
  '/freehold-vs-leasehold-thailand-which-makes-more-financial-sense-over-30-years': '/guides/leasehold-vs-freehold-thailand',
  '/what-does-leasehold-mean-in-thailand-for-foreigners': '/guides/leasehold-vs-freehold-thailand',
  '/in-depth-guide-leasehold-vs-freehold-property-ownership-in-thailand': '/guides/leasehold-vs-freehold-thailand',
  '/leasehold-vs-freehold-for-expats-in-southeast-asia': '/guides/leasehold-vs-freehold-thailand',
  '/can-you-write-off-a-leasehold-in-thailand': '/guides/leasehold-vs-freehold-thailand',
  '/that-303030-lease-you-bought-in-phuket-the-thai-supreme-court-just-changed-the-rules': '/articles/30-30-30-lease-phuket-supreme-court-ruling',

  // ── Rent-to-own ───────────────────────────────────────────────────────────
  '/thailand-rent-to-own-property-explained':
    '/guides/thailand-rent-to-own-property-explained-how-rto-unlocks-buyers-and-protects-developers',
  '/thailand-rent-to-own-property-explained-how-rto-unlocks-buyers-and-protects-developers':
    '/guides/thailand-rent-to-own-property-explained-how-rto-unlocks-buyers-and-protects-developers',

  // ── Foreign ownership cluster ─────────────────────────────────────────────
  '/buying-property-in-thailand-as-a-foreigner-2026': '/guides/foreign-ownership-thailand-2026-guide',
  '/how-to-buy-property-in-southeast-asia-as-a-foreigner-the-no-nonsense-guide': '/guides/foreign-ownership-thailand-2026-guide',
  '/thailand-property-ownership-for-foreigners-in-2026-what-changed-after-the-nominee-company-crackdown': '/guides/foreign-ownership-thailand-2026-guide',
  '/can-foreigners-legally-buy-property-in-phuket-thailand': '/guides/foreign-ownership-thailand-2026-guide',
  '/owning-land-or-villas-in-thailand': '/guides/foreign-ownership-thailand-2026-guide',
  '/guide-to-owning-property-in-thailand': '/guides/foreign-ownership-thailand-2026-guide',
  '/foreign-condo-ownership-in-thailand': '/guides/foreign-ownership-thailand-2026-guide',
  '/how-to-own-a-freehold-condo-in-thailand': '/guides/foreign-ownership-thailand-2026-guide',
  '/essential-guide-to-buy-a-condo-in-thailand-as-a-foreigner': '/guides/foreign-ownership-thailand-2026-guide',
  '/horizontal-condominiums-in-thailand-how-foreigners-are-legally-titling-houses-under-the-condominium-act': '/articles/horizontal-condominiums-thailand-foreign-ownership',

  // ── Crypto property ───────────────────────────────────────────────────────
  '/buy-property-with-crypto-in-thailand': '/guides/buy-property-with-crypto-in-thailand-without-getting-flagged-or-taxed',
  '/buy-property-with-crypto-in-thailand-without-getting-flagged-or-taxed': '/guides/buy-property-with-crypto-in-thailand-without-getting-flagged-or-taxed',
  '/how-to-buy-property-with-crypto-in-thailand': '/guides/buy-property-with-crypto-in-thailand-without-getting-flagged-or-taxed',

  // ── Nominee / company crackdown ───────────────────────────────────────────
  '/thailand-nominee-company-crackdown-what-foreign-property-buyers-need-to-know-in-2026': '/articles/thai-company-crackdown-2026-market-impact',
  '/how-to-protect-your-phuket-property-after-the-2026-nominee-crackdown': '/articles/thai-company-crackdown-2026-market-impact',

  // ── Rental yields cluster ─────────────────────────────────────────────────
  '/rental-yields-in-phuket-what-condos-and-villas-actually-earn-in-2026': '/articles/rental-yields-phuket-2026-what-condos-villas-actually-earn',
  '/phuket-property-investment-in-2026': '/articles/rental-yields-phuket-2026-what-condos-villas-actually-earn',
  '/rental-yields-in-phukets-rapidly-growing-property-market': '/articles/rental-yields-phuket-2026-what-condos-villas-actually-earn',
  '/how-smart-grid-eco-villas-are-protecting-rental-yields-in-phuket': '/articles/rental-yields-phuket-2026-what-condos-villas-actually-earn',
  '/airbnb-pricing-strategy-for-low-season-what-actually-works': '/articles/rental-yields-phuket-2026-what-condos-villas-actually-earn',
  '/thailand-property-investment-vs-sp-500': '/articles/rental-yields-phuket-2026-what-condos-villas-actually-earn',
  '/calculating-roi-making-your-phuket-property-work-for-you': '/articles/rental-yields-phuket-2026-what-condos-villas-actually-earn',
  '/best-places-to-invest-in-rental-property-2025': '/articles/rental-yields-phuket-2026-what-condos-villas-actually-earn',

  // ── Off-plan cluster ──────────────────────────────────────────────────────
  '/off-plan-property-in-thailand-explained-for-foreign-buyers-2026': '/guides/off-plan-property-thailand-explained',
  '/off-plan-properties-in-thailand-risky-or-rewarding': '/guides/off-plan-property-thailand-explained',
  '/what-is-an-off-the-plan-property': '/guides/off-plan-property-thailand-explained',
  '/how-to-choose-the-right-condo-unit-in-an-off-the-plan-development': '/guides/off-plan-property-thailand-explained',
  '/how-to-stress-test-a-developer-before-you-buy-off-plan': '/guides/how-to-read-condo-floor-plan-choose-unit',
  '/how-to-actually-read-a-developers-floor-plan-without-getting-played': '/guides/how-to-read-condo-floor-plan-choose-unit',
  '/understanding-condo-plan-how-to-read-compare-and-choose-the-right-layout-in-thailand': '/guides/how-to-read-condo-floor-plan-choose-unit',
  '/how-to-evaluate-property-developers': '/guides/how-to-read-condo-floor-plan-choose-unit',

  // ── Where to buy / area guide cluster (final CSV: → /guides/phuket-area-guide) ──
  '/where-to-buy-property-in-thailand-in-2025-top-locations-compared': '/guides/phuket-area-guide-property-buyers-2026',
  '/where-to-buy-property-in-thailand-2025': '/guides/phuket-area-guide-property-buyers-2026',
  '/best-places-to-buy-property-in-thailand-2025-edition': '/guides/phuket-area-guide-property-buyers-2026',
  '/best-places-to-buy-property-in-thailand-2025': '/guides/phuket-area-guide-property-buyers-2026',
  '/where-to-buy-property-in-phuket-2026': '/guides/phuket-area-guide-property-buyers-2026',
  '/where-are-the-expat-communities-in-phuket': '/guides/phuket-area-guide-property-buyers-2026',
  '/phuket-property-hotspots-during-tourist-season-a-guide-for-smart-investors': '/guides/phuket-area-guide-property-buyers-2026',

  // ── Visa cluster ──────────────────────────────────────────────────────────
  '/thailand-ltr-visa-vs-indonesia-second-home-visa-which-property-investment-actually-gets-you-residency-in-2026': '/guides/long-stay-visa-thailand-property',
  '/long-stay-visa-via-real-estate-investment': '/guides/long-stay-visa-thailand-property',
  '/destination-thailand-visa-revolutionizes-tourism-and-real-estate': '/guides/long-stay-visa-thailand-property',
  '/long-stay-visa': '/guides/long-stay-visa-thailand-property',

  // ── Purchase costs / taxes ────────────────────────────────────────────────
  '/thai-tax-residency-property-transfers-2025-updated-rule': '/guides/phuket-property-purchase-costs-taxes-fees-2026',
  '/thailand-property-taxes-everything-you-need-to-know-in-2024': '/guides/phuket-property-purchase-costs-taxes-fees-2026',

  // ── Property scams ────────────────────────────────────────────────────────
  '/how-to-avoid-common-property-scams-in-thailand': '/guides/how-to-avoid-common-property-scams-in-thailand',

  // ── WiFi (corrected: internal guide, not external handoff) ───────────────
  '/best-home-wifi-service-providers-in-thailand-2025-edition': '/guides/best-wifi-internet-providers-thailand-2026',
  '/best-home-wifi-service-providers-in-phuket-in-2025':        '/guides/best-wifi-internet-providers-thailand-2026',
  '/best-gardening-shops-in-phuket': '/articles',

  // ── Market data / analysis ────────────────────────────────────────────────
  '/phuket-property-supply-2025-whats-next-for-buyers-and-investors': '/articles/phuket-property-market-h2-2026-supply-moderation',
  '/phuket-property-market-trends-2025': '/articles/phuket-property-market-h2-2026-supply-moderation',
  '/luxury-property-market-trends-in-phuket-whats-hot-in-2025': '/articles/phuket-property-market-h2-2026-supply-moderation',
  '/property-in-thailand-foreign-buyer-data-2025': '/articles/property-in-thailand-foreign-buyer-data-2026',
  '/the-utility-market-why-85-of-thai-buyers-arent-speculators': '/articles/property-in-thailand-foreign-buyer-data-2026',

  // ── Rental guarantees ─────────────────────────────────────────────────────
  '/how-rental-guarantees-actually-work-and-why-you-should-be-careful': '/articles/rental-guarantees-thailand-what-buyers-should-know',

  // ── Currency risk ─────────────────────────────────────────────────────────
  '/currency-risk-in-southeast-asia-property-the-hidden-factor-eating-your-returns': '/articles/currency-risk-thai-property-hidden-factor-erasing-returns',

  // ── Condos vs villas ──────────────────────────────────────────────────────
  '/condos-vs-villas-in-phuket-which-performs-better-for-investors': '/articles/condos-vs-villas-phuket-investor-comparison',
  '/buying-a-condo-vs-villa-in-southeast-asia': '/articles/condos-vs-villas-phuket-investor-comparison',

  // ── Branded residences ────────────────────────────────────────────────────
  '/branded-residences-vs-unbranded-condos-is-the-premium-worth-paying': '/articles/branded-residences-vs-unbranded-phuket-2026',

  // ── SEA property myths ────────────────────────────────────────────────────
  '/5-southeast-asia-property-myths-that-could-cost-foreign-buyers-thousands': '/articles/thailand-property-myths-foreign-buyers',

  // ── Phuket vs Bali/Vietnam ────────────────────────────────────────────────
  '/phuket-vs-bali-vs-vietnam-where-to-invest': '/articles/phuket-vs-bali-vs-vietnam-property-investment',

  // ── Living costs ──────────────────────────────────────────────────────────
  '/living-costs-in-phuket-cheap-or-extreme-in-2025': '/articles/living-costs-phuket-2026-what-it-actually-costs',
  '/living-in-thailand': '/guides',

  // ── Off-brief / thin content → index pages ────────────────────────────────
  '/housing-law-2023-and-land-law-2024-in-vietnam-the-foreign-buyers-real-rulebook-for-2026': '/articles',
  '/the-generation-of-renters-in-southeast-asia-why-young-professionals-are-delaying-homeownership': '/articles',
  '/the-quiet-shift-happening-across-southeast-asia-real-estate': '/articles',
  '/could-thailand-data-center-property-boom-reshape-real-estate-in-2026': '/articles',
  '/what-changed-in-the-southeast-asia-property-market-in-2026': '/articles',
  '/what-really-drives-property-prices-in-southeast-asia': '/articles',
  '/why-southeast-asia-property-market-is-changing': '/articles',
  '/vietnams-new-property-id-system-what-foreign-investors-should-know': '/articles',
  '/the-missing-ibuyer-why-asia-has-no-opendoor': '/articles',
  '/properties-to-invest-in-southeast-asia-a-comprehensive-investors-guide': '/articles',
  '/bangkok-condo-oversupply-the-investor-reality-in-2025': '/articles',
  '/living-the-digital-nomad-dream-a-guide-to-renting-and-buying-property-in-thailand': '/articles',
  '/the-white-lotus-effect-on-thailand-how-hbos-hit-show-is-redefining-luxury-travel': '/articles',
  '/real-property-investment-a-complete-guide-to-building-wealth-through-real-estate': '/articles',
  '/southeast-asia-property-market-oversupply': '/articles',
  '/bkk-house-buying-guide-2025-prices-areas-tips': '/articles',
  '/bangkok-real-estate-guide-2025-neighborhoods-condos-roi': '/articles',
  '/bangkok-property-guide-2025-edition': '/articles',
  '/best-countries-to-retire-in-southeast-asia': '/articles',
  '/the-future-of-property-how-technology-is-transforming-real-estate-in-southeast-asia': '/articles',
  '/blockchain-and-real-estate-whats-real-whats-coming-and-whats-just-marketing': '/articles',
  '/ai-in-real-estate-how-artificial-intelligence-is-transforming-southeast-asia': '/articles',
  '/how-chinas-belt-and-road-initiative-shaping-southeast-asias-real-estate': '/articles',
  '/how-ev-ready-properties-are-changing-the-property-market': '/articles',
  '/5g-smart-homes-what-buyers-need-to-know': '/articles',
  '/trump-presidency-impact-on-sea-real-estate-market': '/articles',
  '/thailands-pet-friendly-condo-boom': '/articles',
  '/proptech-in-shaping-southeast-asias-real-estate-market-in-2025': '/articles',
  '/real-estate-investment-in-southeast-asia': '/articles',
  '/why-invest-in-eco-friendly-property-development-in-phuket': '/articles',
  '/origin-propertys-b30bn-phuket-investment-plan-bold-vision-or-balance-sheet-gamble': '/articles',
  '/can-you-flip-off-the-plan-property-before-completion-in-thailand': '/articles',
  '/are-phuket-off-the-plan-villas-a-smart-airbnb-investment': '/articles',
  '/what-happens-after-you-buy': '/articles',

  // ── Brochure / listing style → /projects ─────────────────────────────────
  '/prime-koh-samui-villas-for-sale-your-gateway-to-luxury-living': '/projects',
  '/phuket-luxury-villas-for-sale-your-complete-guide-to-island-elegance': '/projects',
  '/thailand-condos-for-sale-your-complete-guide-to-buying-property-in-thailand': '/projects',
  '/monetaria-villas-property-breakdown': '/projects',
  '/the-best-phuket-new-developments-for-2025': '/projects',

  // ── Page entries ──────────────────────────────────────────────────────────
  '/free-off-plan-buyer-checklist': '/guides',
  '/contact-hawook-weekly': '/about',
  '/terms-and-conditions': '/terms',
  '/privacy-policy': '/privacy',
  '/contact': '/about',
  '/properties-in-bang-tao-surin': '/areas/bang-tao',
  '/properties-in-thalang':        '/areas/bang-tao',
  '/properties-in-phuket':  '/projects',
  '/properties-in-mueang':  '/projects',
  '/properties-in-kathu':   '/projects',
  '/properties-in-karon':   '/projects',
  '/properties-in-chalong': '/projects',
  '/properties-in-pa-tong-kamala-kathu': '/projects',
  '/properties-in-bangkok': '/projects',
  '/thailand': '/projects',
  '/sale': '/projects',
  '/compare-properties': '/projects',
  '/search-results-page': '/projects',
  '/search-results': '/projects',
  '/results': '/projects',
  '/property-cards-module': '/projects',
  '/property-by-ids': '/projects',
  '/sub-property': '/projects',
  '/listing-full-width': '/projects',
  '/properties-grid-view-3-cols': '/projects',

  // ── WP project/property contact pages ────────────────────────────────────
  '/trichada-essence': '/projects',
  '/escent-phuket': '/projects',
  '/college-villas-phase-ii': '/projects',
  '/contact-the-title-villa-kirara': '/projects',
  '/contact-vip-venus-karon': '/projects',
  '/contact-the-origin-centre-phuket': '/projects',
  '/contact-the-momentum-phuket': '/projects',
  '/contact-the-base-cherngtalay': '/projects',
  '/contact-surin-sands': '/projects',
  '/contact-adm-platinum-bay': '/projects',
  '/contact-layan-green-park-phase-2': '/projects',
  '/contact-skypark-celeste-laguna': '/projects',
  '/contact-escent-phuket': '/projects',
  '/contact-ayana-heights-seaview-residence': '/projects',
  '/contact-bellevue-beachfront-condo': '/projects',
  '/contact-the-title-legendary-bangtao': '/projects',
  '/contact-naka-bay-seaview': '/projects',
  '/contact-melia-phuket-karon-residences': '/projects',
  '/contact-menara-hills': '/projects',
  '/contact-property-bright-phuket': '/projects',
  '/contact-property-001': '/projects',

  // ── Dashboard redirects ───────────────────────────────────────────────────
  '/user-dashboard':      '/dashboard',
  '/my-properties':       '/dashboard',
  '/my-profile':          '/dashboard',
  '/favorite-properties': '/dashboard',

  // ── Utility / template pages ──────────────────────────────────────────────
  '/select-your-package': '/',
  '/complete-order':      '/',
  '/paypal-ipn':          '/',
  '/thank-you':           '/',
  '/test':                '/',

  // ── Category archives ─────────────────────────────────────────────────────
  '/uncategorized':        '/articles',
  '/new-property-developments': '/projects',
  '/financing-legal':      '/guides',
  '/lifestyle-tourism':    '/articles',
  '/investing-guides':     '/guides',
  '/neighborhood-guides':  '/areas',
  '/sea-market-insights':  '/articles',
  '/how-to-guides':        '/guides',
  '/property-news-trends': '/articles',

  // ── Taxonomy ──────────────────────────────────────────────────────────────
  '/status/for-sale':    '/projects',
  '/label/off-plan-2026': '/projects',
  '/real-estate': '/articles',

  // ── Developer entries (exceptions to prefix rule; root → profiles) ────────
  '/developer/codi-mansbridge-hawook': '/about',
  '/developer/hawook': '/about',
  '/developer': '/profiles',

  // ── Agency root (prefix rule handles /agency/*) ───────────────────────────
  '/agency': '/about',

  // ── Homepage / section roots ──────────────────────────────────────────────
  '/blog':       '/articles',
  '/guides':     '/guides',
  '/properties': '/projects',
  '/property':   '/projects',
}

// Prefix redirects: [prefix, destination, mode?]
//   mode 'fixed': redirect entire prefix to destination (drop remaining path)
//   mode undefined: substitute prefix — destination + remaining path
const PREFIX_REDIRECTS: Array<[string, string, 'fixed'?]> = [
  ['/the-bang-tao-land-seizure', '/articles/bang-tao-land-seizure-phuket', 'fixed'],
  ['/property/', '/projects/'],           // path substitution: /property/X → /projects/X
  ['/developer/', '/profiles', 'fixed'],  // /developer/* → /profiles (exceptions above)
  ['/agency/', '/about', 'fixed'],        // /agency/* → /about
]

function getWpRedirect(pathname: string): { destination: string; status: 301 | 410 } | null {
  // 1. /author/* → 301 /about (no author pages on app)
  if (pathname.startsWith('/author/') || pathname === '/author') {
    return { destination: '/about', status: 301 }
  }

  // 2. /page/N/ pagination → root (WordPress pagination pattern)
  if (/^\/page\/\d+\/?$/.test(pathname)) {
    return { destination: '/', status: 301 }
  }

  // 3. /locations.kml → 410 Gone (KML file, no equivalent)
  if (pathname === '/locations.kml') {
    return { destination: '', status: 410 }
  }

  // 4. Exact redirect map (try with and without trailing slash)
  const exact = EXACT_REDIRECTS[pathname] ?? EXACT_REDIRECTS[pathname.replace(/\/$/, '')]
  if (exact) return { destination: exact, status: 301 }

  // 5. Prefix redirect map
  for (const [prefix, dest, mode] of PREFIX_REDIRECTS) {
    if (pathname.startsWith(prefix)) {
      const destination = mode === 'fixed' ? dest : dest + pathname.slice(prefix.length)
      return { destination, status: 301 }
    }
  }

  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── AD-02: Handle WP redirects before any auth logic ─────────────────────
  const wpRedirect = getWpRedirect(pathname)
  if (wpRedirect) {
    if (wpRedirect.status === 410) {
      return new NextResponse(null, { status: 410 })
    }
    const dest = wpRedirect.destination
    const isExternal = dest.startsWith('http://') || dest.startsWith('https://')
    const redirectUrl = isExternal ? dest : new URL(dest, request.url).toString()
    return NextResponse.redirect(redirectUrl, { status: 301 })
  }

  // ── Unmapped WP-shaped paths: fall through to Next.js 404 ────────────────
  // Long-tail WP URLs not in the explicit map return 404 naturally —
  // Google crawls and drops them. No special handling needed.

  // ── Supabase auth: only run for /dashboard routes ────────────────────────
  // Scoped to /dashboard so Supabase env vars are not needed when Next.js
  // prerenderers static public pages (login, signup, etc.) at build time.
  if (pathname.startsWith('/dashboard')) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - image files
     * - api routes (they handle auth internally)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
