import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Phuket Property Areas',
  description: 'Where to look in Phuket — Hawook\'s curated coverage of Rawai & Nai Harn and Bang Tao.',
  alternates: { canonical: 'https://app.hawook.com/areas' },
  openGraph: {
    title: 'Phuket Property Areas',
    description: 'Where to look in Phuket — Hawook\'s curated coverage of Rawai & Nai Harn and Bang Tao.',
    url: 'https://app.hawook.com/areas',
  },
}

const waHref = 'https://wa.me/66805100129?text=Hi%2C%20I\'m%20trying%20to%20figure%20out%20which%20Phuket%20area%20suits%20me%20best%20%E2%80%94%20could%20you%20help%3F'

const areaBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--fw-semibold)',
  color: 'var(--text-on-inverse)',
  background: 'var(--action-primary)',
  padding: '10px 20px',
  borderRadius: 'var(--radius-md)',
  textDecoration: 'none',
  whiteSpace: 'nowrap' as const,
}

export default async function AreasPage() {
  const supabase = await createClient()

  const [{ count: rawaiCount }, { count: bangTaoCount }] = await Promise.all([
    supabase.from('projects_public').select('*', { count: 'exact', head: true }).in('area', ['Rawai', 'Nai Harn']),
    supabase.from('projects_public').select('*', { count: 'exact', head: true }).eq('area', 'Bang Tao'),
  ])

  return (
    <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--space-9) var(--gutter)' }}>

      {/* Intro */}
      <div style={{ maxWidth: 'var(--container-narrow)', marginBottom: 'var(--space-10)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 4vw, var(--text-display-3))',
          fontWeight: 'var(--fw-medium)',
          color: 'var(--text-brand)',
          lineHeight: 'var(--lh-title)',
          letterSpacing: 'var(--tracking-display)',
          margin: '0 0 var(--space-6)',
        }}>
          Where to look in Phuket
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', color: 'var(--text-primary)', lineHeight: 'var(--lh-editorial)', margin: '0 0 var(--space-5)' }}>
          Phuket is a big island. Buyers who arrive expecting one &ldquo;Phuket&rdquo; market quickly discover there are really several — each with its own character, buyer profile, pricing logic, and lifestyle implications. The areas we cover are the ones where international freehold property activity is concentrated, where curation matters, and where we can do substantive research firsthand.
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', color: 'var(--text-primary)', lineHeight: 'var(--lh-editorial)', margin: 0 }}>
          We currently cover two areas in depth. Both have distinct profiles. Most buyers find that one is clearly the right fit for them and the other isn&rsquo;t — sometimes for budget reasons, sometimes for lifestyle, sometimes for rental strategy. The wrong area is one of the most common buyer mistakes in Phuket. If you&rsquo;re not sure which area suits you, we&rsquo;d rather have a 10-minute conversation than have you spend three weeks researching the wrong inventory.
        </p>
      </div>

      {/* Area cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-8)', marginBottom: 'var(--space-10)' }}>

        {/* Rawai & Nai Harn */}
        <div style={{ border: '1px solid var(--rule)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', boxShadow: 'var(--shadow-lift)' }}>
          <div style={{ position: 'relative', height: 224, overflow: 'hidden' }}>
            <Image
              src="https://res.cloudinary.com/dq5a1hiut/image/upload/v1782223609/hawook/areas/rawai-nai-harn-hero.jpg"
              alt="Sunset over Rawai pier, southern Phuket"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display-4)', fontWeight: 'var(--fw-medium)', color: 'var(--text-brand)', margin: '0 0 4px' }}>
              Rawai &amp; Nai Harn
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', fontStyle: 'italic', margin: '0 0 var(--space-6)' }}>
              Southern Phuket. The quiet end.
            </p>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 'var(--lh-editorial)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <p style={{ margin: 0 }}>Phuket&rsquo;s southernmost neighbourhoods — quieter, more residential, more authentic Thai character. International school access is good (UWC, BCIS within 15–25 minutes). Beaches at Nai Harn and Yanui are among the most beautiful and least crowded on the island.</p>
              <p style={{ margin: 0 }}>Strong long-stay rental market; weaker peak-season short-stay yields than Bang Tao. Entry-level condos from approximately 3M THB; villas commonly 7M–30M THB freehold-equivalent.</p>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-editorial)', margin: 'var(--space-6) 0' }}>
              <strong style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>Best for:</strong>{' '}
              long-term residents wanting calm, families with school-age children, buyers prioritising beach access without tourist density, investors prioritising long-stay rental over short-stay.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
              {rawaiCount !== null && rawaiCount > 0 && (
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  {rawaiCount} project{rawaiCount === 1 ? '' : 's'} we cover
                </span>
              )}
              <Link href="/areas/rawai-nai-harn" style={{ ...areaBtn, marginLeft: 'auto' }}>
                See Rawai &amp; Nai Harn
              </Link>
            </div>
          </div>
        </div>

        {/* Bang Tao */}
        <div style={{ border: '1px solid var(--rule)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', boxShadow: 'var(--shadow-lift)' }}>
          <div style={{ position: 'relative', height: 224, overflow: 'hidden' }}>
            <Image
              src="https://res.cloudinary.com/dq5a1hiut/image/upload/v1782223601/hawook/areas/bang-tao-hero.jpg"
              alt="Beach club at sunset, Bang Tao, Phuket"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display-4)', fontWeight: 'var(--fw-medium)', color: 'var(--text-brand)', margin: '0 0 4px' }}>
              Bang Tao
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', fontStyle: 'italic', margin: '0 0 var(--space-6)' }}>
              Western Phuket. The high-end coast.
            </p>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 'var(--lh-editorial)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <p style={{ margin: 0 }}>Phuket&rsquo;s premium resort and beachfront residence area. International-buyer epicentre. Five-star hotel brand concentration — Banyan Tree, Angsana, Outrigger, Andaz, Anantara, and the Laguna Phuket family. Strongest short-stay rental market on the island.</p>
              <p style={{ margin: 0 }}>International school access excellent (UWC, BCIS within 10–15 minutes). Entry-level condos from approximately 5–7M THB; branded villas commonly 30M–100M+ THB.</p>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-editorial)', margin: 'var(--space-6) 0' }}>
              <strong style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>Best for:</strong>{' '}
              investors prioritising rental yield, families with school-age children, buyers wanting walkable beach + resort lifestyle, buyers with budgets over 10M THB for condos or 30M THB for villas.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
              {bangTaoCount !== null && bangTaoCount > 0 && (
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  {bangTaoCount} project{bangTaoCount === 1 ? '' : 's'} we cover
                </span>
              )}
              <Link href="/areas/bang-tao" style={{ ...areaBtn, marginLeft: 'auto' }}>
                See Bang Tao
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Other areas note */}
      <div style={{ maxWidth: 'var(--container-narrow)', marginBottom: 'var(--space-10)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-title)', fontWeight: 'var(--fw-medium)', color: 'var(--text-brand)', margin: '0 0 var(--space-4)' }}>
          Other areas
        </h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 'var(--lh-editorial)', margin: 0 }}>
          We&rsquo;re often asked about Patong, Phuket Town, Kata/Karon, Kamala, and the Mai Khao/Nai Yang area to the north. We have informal coverage of several of these areas but haven&rsquo;t yet completed the editorial work required to publish them as Hawook-curated catalog. We&rsquo;ll add areas as we can do them justice — not before. If you&rsquo;re interested in an area we don&rsquo;t yet cover formally, we can still help in a more informal capacity. Get in touch via WhatsApp.
        </p>
      </div>

      {/* Bottom CTA */}
      <div style={{ background: 'var(--bg-inverse)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', alignItems: 'flex-start' }} className="sm:flex-row sm:items-center">
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-title)', fontWeight: 'var(--fw-medium)', color: 'var(--text-on-inverse)', margin: '0 0 var(--space-3)' }}>
            Not sure which area fits you?
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-on-inverse-muted)', lineHeight: 'var(--lh-editorial)', margin: 0 }}>
            Tell us about your situation and we&rsquo;ll help you narrow it down — budget, lifestyle priorities, rental goals, school needs. Takes 10 minutes.
          </p>
        </div>
        <Link href={waHref} target="_blank" rel="noopener noreferrer" style={{ ...areaBtn, flexShrink: 0, background: 'var(--bg-surface)', color: 'var(--text-brand)' }}>
          WhatsApp us
        </Link>
      </div>
    </div>
  )
}
