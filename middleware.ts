import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// AD-02: WP → app.hawook.com redirect layer (301/410)
//
// Runs BEFORE Supabase auth so WP redirects incur zero DB overhead.
// Migration Runner spot-checks all entries before hawook.com DNS cutover.
//
// ⚠️ Three destinations flagged as unverified — see comments below.
// ─────────────────────────────────────────────────────────────────────────────

// Exact-path redirects: WP source path → destination (absolute or root-relative)
const EXACT_REDIRECTS: Record<string, string> = {
  // ── Top content by GSC clicks ─────────────────────────────────────────────
  // Rock 1: bang-tao land seizure (109 clicks/3mo)
  '/the-bang-tao-land-seizure-phuket-beach-crackdown-2025': '/articles/bang-tao-land-seizure-phuket',
  '/the-bang-tao-land-seizure-phuket-beach-crackdown':      '/articles/bang-tao-land-seizure-phuket',
  '/the-bang-tao-land-seizure-phuket':                      '/articles/bang-tao-land-seizure-phuket',

  // ── External handoffs to Phuket Community ────────────────────────────────
  '/best-home-wifi-service-providers-in-thailand-2025-edition': 'https://phuketcommunity.com/guides/home-internet-providers-phuket',
  '/best-gardening-shops-in-phuket':                            'https://phuketcommunity.com/guides/gardening-shops-phuket',

  // ── Property listing redirect ─────────────────────────────────────────────
  '/property/dominion-rawai': '/projects/dominion-rawai',

  // ── Rent-to-own ───────────────────────────────────────────────────────────
  '/thailand-rent-to-own-property-explained':
    '/articles/thailand-rent-to-own-property-explained-how-rto-unlocks-buyers-and-protects-developers',

  // ── Area guides ──────────────────────────────────────────────────────────
  '/bang-tao-guide':    '/articles/bang-tao-area-guide-property-buyers-2026',
  '/bang-tao-area':     '/articles/bang-tao-area-guide-property-buyers-2026',
  '/kata-karon-guide':  '/articles/kata-karon-area-guide-property-buyers-2026',
  '/kata-guide':        '/articles/kata-karon-area-guide-property-buyers-2026',
  '/karon-guide':       '/articles/kata-karon-area-guide-property-buyers-2026',
  '/kamala-guide':      '/articles/kamala-area-guide-property-buyers-2026',
  '/phuket-town-guide': '/articles/phuket-town-area-guide-property-buyers',
  '/phuket-town-area':  '/articles/phuket-town-area-guide-property-buyers',

  // ⚠️ FLAGGED — destination slugs not confirmed in DB; Migration Runner to verify before merge:
  '/where-to-buy-property-in-thailand-in-2025-top-locations-compared':
    '/articles/where-to-buy-property-thailand-2026',          // ⚠️ verify slug exists
  '/where-to-buy-property-in-thailand-2025':
    '/articles/where-to-buy-property-thailand-2026',          // ⚠️ verify slug exists
  '/buy-property-with-crypto-in-thailand':
    '/articles/buy-property-with-crypto-in-thailand-without-getting-flagged-or-taxed', // actual DB slug
  '/best-places-to-buy-property-in-thailand-2025-edition':
    '/articles/best-places-to-buy-property-thailand-2026',    // ⚠️ verify slug exists
  '/best-places-to-buy-property-in-thailand-2025':
    '/articles/best-places-to-buy-property-thailand-2026',    // ⚠️ verify slug exists

  // ── Homepage / category roots ─────────────────────────────────────────────
  '/blog':    '/articles',
  '/guides':  '/guides',
  '/properties': '/projects',
  '/property':   '/projects',
}

// Prefix redirects: if pathname starts with key, redirect to value
// (Used for WP URL patterns with varying slugs)
const PREFIX_REDIRECTS: Array<[string, string]> = [
  ['/the-bang-tao-land-seizure', '/articles/bang-tao-land-seizure-phuket'],
  ['/property/', '/projects/'],
]

function getWpRedirect(pathname: string): { destination: string; status: 301 | 410 } | null {
  // 1. /author/* → 410 Gone (no equivalent author pages on app)
  if (pathname.startsWith('/author/') || pathname === '/author') {
    return { destination: '', status: 410 }
  }

  // 2. /page/N/ pagination → root (WordPress pagination pattern)
  if (/^\/page\/\d+\/?$/.test(pathname)) {
    return { destination: '/', status: 301 }
  }

  // 3. Exact redirect map
  const exact = EXACT_REDIRECTS[pathname] ?? EXACT_REDIRECTS[pathname.replace(/\/$/, '')]
  if (exact) return { destination: exact, status: 301 }

  // 4. Prefix redirect map
  for (const [prefix, destPrefix] of PREFIX_REDIRECTS) {
    if (pathname.startsWith(prefix)) {
      const dest = destPrefix + pathname.slice(prefix.length)
      return { destination: dest, status: 301 }
    }
  }

  return null
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // ── Strip URL hash fragments (hashes never reach the server, but guard anyway)
  // Real hash stripping happens client-side; server receives path without fragment.

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

  // ── Unmapped WP-shaped paths: fall through to Next.js 404 (not 410) ───────
  // Long-tail WP URLs that aren't in the explicit map return 404 naturally —
  // Google needs to crawl and drop them. No special handling needed.

  // ── Supabase auth session refresh (existing) ──────────────────────────────
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

  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
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
