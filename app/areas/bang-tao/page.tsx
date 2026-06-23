import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MarkdownContent from '@/components/MarkdownContent'
import ProjectCard from '@/components/ProjectCard'
import type { Project } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Bang Tao Property Guide | Hawook',
  description: 'Bang Tao is Phuket\'s premium resort and beachfront residence area — a 6-kilometre stretch of Andaman Sea coast anchored by Laguna Phuket.',
  alternates: { canonical: 'https://app.hawook.com/areas/bang-tao' },
  openGraph: {
    title: 'Bang Tao Property Guide | Hawook',
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

**The schools matter.** UWC Thailand (one of Asia's most respected international schools) and BCIS are both within a 10-15 minute drive. For buyers with school-age children — a meaningful slice of the foreign-buyer market — this is genuinely the most practical area to live in Phuket. Many family-buyer decisions effectively come down to "where can the kids walk to school from?" and Bang Tao answers that better than any alternative.

**It's developed-feeling, not "frontier."** Unlike Rawai/Nai Harn, where parts of the area still feel residential-village and the infrastructure has clearly grown organically, Bang Tao feels planned. Wide roads, consistent commercial corridors, branded developments behind perimeter walls. Some buyers find this premium; others find it sterile.

**Pricing is meaningfully higher than other areas.** Entry-level condos start around 5-7M THB in Bang Tao versus 3-4M THB in Rawai/Nai Harn for comparable size. Villa pricing varies enormously — branded freehold villas start around 30M THB and run well past 100M THB for premium product.

## Who should look here

**Investors prioritising rental yield.** Bang Tao is the area to look at if rental returns are central to your purchase decision. Managed rental programs through hotel brands or specialist operators are common here and produce stronger nightly rates than non-Bang Tao alternatives.

**Buyers with school-age children.** UWC and BCIS proximity is genuinely meaningful. Daily school runs from other Phuket areas are tedious; Bang Tao is the practical answer.

**Buyers wanting walkable beach + resort lifestyle.** Many Bang Tao developments are within walking distance of the beach. Restaurants, beach clubs, and resort amenities are accessible without driving. This is rare elsewhere on the island.

**Buyers wanting a more "international" feel.** If your priority is a community that feels familiar (English-speaking, internationally-staffed services, consistent infrastructure), Bang Tao is the right choice.

**Buyers with higher budgets.** If your budget is genuinely 10M+ THB for a condo or 30M+ THB for a villa, Bang Tao is where the best inventory in that range is concentrated. Below that, the price-to-quality ratio in Bang Tao gets less favourable, and Rawai/Nai Harn becomes more competitive on value.

## Who should look elsewhere

**Buyers wanting quieter, more authentic Thai-residential character.** Bang Tao is firmly international-resort in character. If you're looking for the part of Phuket that still feels like Thailand, this isn't it.

**Buyers prioritising long-stay rental over short-stay.** The buyer market here is heavily seasonal. Long-stay rental tenants are harder to find and produce flatter returns than in residential-resident areas like Rawai.

**Value-conscious buyers under 7M THB.** At the entry level, Bang Tao's price-to-quality ratio is typically less favourable than Rawai/Nai Harn. You can find better-built, better-located condos for the same money in southern Phuket.

**Buyers prioritising the airport.** Bang Tao to the airport is 15-25 minutes — closer than Rawai but not as close as the projects right on the Mai Khao side. For frequent international travelers, the Mai Khao/Layan northern end of Bang Tao works best; the Cherngtalay/Surin southern end adds 10 minutes.

**Buyers wanting genuine local food culture.** There are excellent restaurants in Bang Tao, but most are international-resort restaurants serving international cuisine at international prices. For Thai food culture and local markets, Rawai and Phuket Town are stronger.

## Sub-areas within Bang Tao

Bang Tao is large enough that the sub-areas matter meaningfully for buyer decisions:

**Laguna / Cherngtalay.** The original integrated resort area, anchored by the Laguna Phuket complex. Most established. Highest concentration of branded residences and managed rental programs. Most pedestrian-friendly area within Bang Tao. Best fit for buyers prioritising rental program management and immediate amenity access.

**Surin / South Bang Tao.** Closer to Patong, slightly more nightlife adjacent. Pretty beach (Surin Beach itself is excellent). Mix of villas and condos. Slightly older residential character. Best fit for buyers wanting a quieter feel within Bang Tao while still being close to action.

**Layan / North Bang Tao.** Closer to the airport. More villa-heavy. Some of the most premium new launches are here (branded residences, luxury villa estates). Quieter and more spread out. Best fit for buyers wanting privacy, large villas, and proximity to the airport.

**Inland Bang Tao (Cherngtalay east of the bypass).** More residential-affordable. Less premium feel. Some good-value condos and townhomes here. Best fit for value-conscious buyers who prioritise Bang Tao's amenities but don't need beachside or premium-branded inventory.

When we review Bang Tao projects, we always note which sub-area the project sits in and whether the sub-area suits the project's positioning.

## What we're tracking in Bang Tao

Hawook covers a curated selection of Bang Tao projects across the sub-areas above. Pricing in our Bang Tao catalog spans roughly 5-8M THB entry-level condos through 100M+ THB branded villas. Status mix includes pre-launch, under-construction, and recently-completed inventory.

## What's coming

We'll continue expanding Bang Tao coverage as new developments meet our review bar. Particular focus on the new branded residence launches in Layan and the next wave of pre-construction launches in Laguna. We'll also be publishing more granular guides on specific sub-areas (Laguna, Surin, Layan, Cherngtalay inland) as we go deeper.

If you're considering buying in Bang Tao and want to discuss your specific criteria — budget, rental program priorities, sub-area preferences, school-proximity needs — get in touch via WhatsApp or the project enquiry forms.

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Editorial content */}
      <div className="max-w-2xl">
        <MarkdownContent content={editorialContent} />
      </div>

      {/* Project grid */}
      <div className="mt-16">
        <h2 className="font-serif text-2xl font-medium text-gray-900 mb-6">
          Our Bang Tao coverage
        </h2>
        {projectList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectList.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No published projects yet — check back soon.
          </p>
        )}
      </div>

      {/* WhatsApp CTA */}
      <div className="mt-16 bg-cream rounded-xl border border-gray-200 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="flex-1">
          <p className="font-serif text-xl font-medium text-gray-900 mb-1">Talk to us about this area</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Not sure which projects suit your criteria? Message Yogi on WhatsApp — we know every active development in Bang Tao and can point you in the right direction in minutes.
          </p>
        </div>
        <Link
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-medium bg-teal text-white px-5 py-3 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          WhatsApp us
        </Link>
      </div>
    </div>
  )
}
