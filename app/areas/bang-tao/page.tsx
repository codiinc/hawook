import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MarkdownContent from '@/components/MarkdownContent'
import ProjectCard from '@/components/ProjectCard'
import type { Project } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Bang Tao Property Guide',
  description: 'Bang Tao is Phuket\'s premium resort and beachfront residence area — a 6-kilometre stretch of Andaman Sea coast anchored by Laguna Phuket.',
  alternates: { canonical: 'https://app.hawook.com/areas/bang-tao' },
  openGraph: {
    title: 'Bang Tao Property Guide',
    description: 'Bang Tao is Phuket\'s premium resort and beachfront residence area — a 6-kilometre stretch of Andaman Sea coast anchored by Laguna Phuket.',
    url: 'https://app.hawook.com/areas/bang-tao',
  },
}

const editorialContent = `
# Bang Tao

Western Phuket. The high-end coast.

Bang Tao is Phuket's premium resort and beachfront residence area — a 6-kilometre stretch of Andaman Sea coast that runs from Layan Beach in the north to Surin Beach in the south. The area is anchored by Laguna Phuket, the original integrated resort development that defined the model for branded residential property in Phuket and continues to set the tone for the surrounding neighbourhoods. The major five-star hotel brands cluster here. The international schools — particularly UWC Thailand and BCIS — are within a 10-15 minute drive. This is the area where most buyers spending 10M+ THB on a second home in Phuket end up looking.

Hawook covers Bang Tao as our second priority area after Rawai and Nai Harn. The catalog is more selective here because the inventory is enormous — there are more developments launching in Bang Tao than any other Phuket area, and the variation in developer quality, design integrity, and pricing logic is wider than anywhere else on the island. Curation matters more here precisely because the volume is so high. We review carefully and list only the developments we'd recommend to a buyer paying 10M-50M THB for a second home or investment property.

## What makes Bang Tao different

**It's the international-buyer epicentre of Phuket.** More than any other area, Bang Tao's buyer demographic is firmly international — primarily Northern European, North American, Australian, and increasingly East Asian and Middle Eastern. The local resident community is dwarfed by the international and seasonal-resident community. English is the default language of business in most parts of Bang Tao.

**It's where five-star hotel brands concentrate.** Banyan Tree, Angsana, Cassia, Outrigger, Trisara, Andaz, Anantara, and the Laguna Phuket family of hotels all anchor the area. This concentration drives a number of things: better restaurants, branded residences with managed rental programs, hotel-tier infrastructure within walking distance of many residential developments, and a generally more polished consumer experience than other parts of Phuket.

**It's the strongest short-stay rental market on the island.** For investors prioritising peak-season nightly rates, Bang Tao outperforms every other Phuket area. The November-March high season produces premium rental yields here, particularly for furnished branded residences with managed rental programs. Year-round occupancy is typically 60-75% for well-located properties versus 40-55% for non-Bang Tao alternatives.

**The schools matter.** UWC Thailand (one of Asia's most respected international schools) and BCIS are both within a 10-15 minute drive. For buyers with school-age children — a meaningful slice of the foreign-buyer market — this is genuinely the most practical area to live in Phuket.

**It's developed-feeling, not "frontier."** Unlike Rawai/Nai Harn, where parts of the area still feel residential-village and the infrastructure has clearly grown organically, Bang Tao feels planned. Wide roads, consistent commercial corridors, branded developments behind perimeter walls.

**Pricing is meaningfully higher than other areas.** Entry-level condos start around 5-7M THB in Bang Tao versus 3-4M THB in Rawai/Nai Harn for comparable size. Villa pricing varies enormously — branded freehold villas start around 30M THB and run well past 100M THB for premium product.

## Who should look here

**Investors prioritising rental yield.** Bang Tao is the area to look at if rental returns are central to your purchase decision. Managed rental programs through hotel brands or specialist operators are common here and produce stronger nightly rates than non-Bang Tao alternatives.

**Buyers with school-age children.** UWC and BCIS proximity is genuinely meaningful. Daily school runs from other Phuket areas are tedious; Bang Tao is the practical answer.

**Buyers wanting walkable beach + resort lifestyle.** Many Bang Tao developments are within walking distance of the beach. Restaurants, beach clubs, and resort amenities are accessible without driving.

**Buyers with higher budgets.** If your budget is genuinely 10M+ THB for a condo or 30M+ THB for a villa, Bang Tao is where the best inventory in that range is concentrated.

## Who should look elsewhere

**Buyers wanting quieter, more authentic Thai-residential character.** Bang Tao is firmly international-resort in character.

**Buyers prioritising long-stay rental over short-stay.** The buyer market here is heavily seasonal. Long-stay rental tenants are harder to find and produce flatter returns than in residential-resident areas like Rawai.

**Value-conscious buyers under 7M THB.** At the entry level, Bang Tao's price-to-quality ratio is typically less favourable than Rawai/Nai Harn.

## Sub-areas within Bang Tao

**Laguna / Cherngtalay.** The original integrated resort area. Most established. Highest concentration of branded residences and managed rental programs. Best fit for buyers prioritising rental program management and immediate amenity access.

**Surin / South Bang Tao.** Closer to Patong. Pretty beach. Mix of villas and condos. Best fit for buyers wanting a quieter feel within Bang Tao while still being close to action.

**Layan / North Bang Tao.** Closer to the airport. More villa-heavy. Some of the most premium new launches are here. Best fit for buyers wanting privacy, large villas, and proximity to the airport.

**Inland Bang Tao (Cherngtalay east of the bypass).** More residential-affordable. Less premium feel. Best fit for value-conscious buyers who prioritise Bang Tao's amenities but don't need beachside or premium-branded inventory.

## What we're tracking in Bang Tao

Hawook covers a curated selection of Bang Tao projects across the sub-areas above. Pricing in our Bang Tao catalog spans roughly 5-8M THB entry-level condos through 100M+ THB branded villas. Status mix includes pre-launch, under-construction, and recently-completed inventory.

---

*Last reviewed: 23 June 2026*
`

const waHref = 'https://wa.me/66805100129?text=Hi%2C%20I\'m%20exploring%20Bang%20Tao%20%E2%80%94%20could%20you%20recommend%20projects%20that%20might%20suit%20me%3F'

export default async function BangTaoPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects_public')
    .select('id, project_name, slug, area, price_min, price_max, construction_status, cover_image_url, hawook_intro, hawook_badge, status, foreign_quota_available, rental_program_available, unit_types')
    .eq('area', 'Bang Tao')
    .eq('status', 'Active')
    .order('created_at', { ascending: false })

  const projectList = (projects ?? []) as Project[]

  return (
    <div style={{ maxWidth: 'var(--container)', margin: '0 auto', padding: 'var(--space-9) var(--gutter)' }}>
      <div style={{ maxWidth: 'var(--container-narrow)' }}>
        <MarkdownContent content={editorialContent} />
      </div>

      <div style={{ marginTop: 'var(--space-10)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display-4)', fontWeight: 'var(--fw-medium)', color: 'var(--text-brand)', margin: '0 0 var(--space-7)' }}>
          Our Bang Tao coverage
        </h2>
        {projectList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-6)' }}>
            {projectList.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            No published projects yet — check back soon.
          </p>
        )}
      </div>

      <div style={{ marginTop: 'var(--space-10)', background: 'var(--bg-inverse)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', alignItems: 'flex-start' }} className="sm:flex-row sm:items-center">
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-title)', fontWeight: 'var(--fw-medium)', color: 'var(--text-on-inverse)', margin: '0 0 var(--space-3)' }}>
            Talk to us about this area
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-on-inverse-muted)', lineHeight: 'var(--lh-editorial)', margin: 0 }}>
            Not sure which projects suit your criteria? We know every active development in Bang Tao and can point you in the right direction in minutes.
          </p>
        </div>
        <Link
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-brand)', background: 'var(--bg-surface)', padding: '10px 20px', borderRadius: 'var(--radius-md)', textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          WhatsApp us
        </Link>
      </div>
    </div>
  )
}
