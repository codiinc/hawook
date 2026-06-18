import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MarkdownContent from '@/components/MarkdownContent'
import ProjectCard from '@/components/ProjectCard'
import type { Project } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Rawai & Nai Harn — Phuket Property Guide',
  description: 'Independent guide to buying property in Rawai and Nai Harn, southern Phuket. Area overview, honest buyer advice, and our current project coverage.',
  alternates: { canonical: 'https://app.hawook.com/areas/rawai-nai-harn' },
  openGraph: {
    title: 'Rawai & Nai Harn — Phuket Property Guide',
    description: 'Independent guide to buying property in Rawai and Nai Harn, southern Phuket.',
    url: 'https://app.hawook.com/areas/rawai-nai-harn',
  },
}

const editorialContent = `
# Rawai & Nai Harn

Southern Phuket. The headland.

If Patong is Phuket's nightlife capital and Bang Tao is Phuket's beach-resort showcase, Rawai and Nai Harn are something different: the quiet end. Phuket's southernmost neighbourhoods, where the island narrows toward Promthep Cape, the package tourism doesn't reach, and the residents — both Thai and foreign — actually live.

Hawook is headquartered in this area, which is why we've made it our starting focus. We know the streets, the developers, the beach access, the construction sites, the planning approvals, and what's coming next. Most of our editorial confidence about Rawai and Nai Harn comes from walking it weekly, not from satellite maps.

## What makes Rawai and Nai Harn different

**It's residential, not touristic.** The local economy isn't built on hotel bookings. The community is a mix of long-term Thais, established expats, retirees, digital nomads, and increasingly families — particularly French, German, Russian, and English-speaking families who chose Phuket for school access (UWC Thailand, BCIS, HeadStart) and beach lifestyle.

**It's the quiet end of the island.** Nightlife is minimal — a handful of beach bars at Nai Harn and Rawai Beach, a few restaurants on the main strip, no clubs. Traffic is manageable outside school runs. The pace is slower than Patong by an order of magnitude.

**Beaches are accessible without being mobbed.** Nai Harn Beach is widely considered one of the most beautiful in Phuket and is a 5-10 minute drive from most projects. Yanui Beach (smaller, sheltered) is a short walk from Nai Harn. Rawai Beach itself is less swimmable but is home to the seafood market and the southernmost end of the island.

**It's well-connected by Phuket standards.** Phuket International Airport is 40-45 minutes by car. Phuket Town is 25 minutes. Big shopping (Central, Boat Avenue) is 30-40 minutes. International schools are 15-25 minutes.

**Foreign-owned freehold is widely available.** Most developments in the area sell foreign-quota condos (49% foreign freehold cap by building) and leasehold villas, with the occasional structured freehold villa for higher-end buyers willing to navigate Thai legal structures.

## Who should look here

**Long-term residents wanting calm.** If your priority is a peaceful daily life, not tourist energy, this is the area. Particularly if you'll work remotely or are retired.

**Families with school-age children.** International school access is genuinely better here than other Phuket areas given the distance to UWC, BCIS, and HeadStart.

**Buyers who want beach access without beach-tourist density.** Nai Harn and Yanui beaches are local-favourite, not package-tour-favourite.

**Investors prioritising long-stay rental over short-stay.** The buyer market here is residents, not holidaymakers. Long-stay rental yields are steady; short-stay (Airbnb-style) yields are weaker than Bang Tao or Patong.

## Who should look elsewhere

**Buyers who want Phuket's nightlife scene.** Patong, Bang Tao, and Kamala are better fits.

**Investors prioritising peak-season short-stay yields.** Bang Tao, Patong, and Kamala outperform during November-March peak; Rawai/Nai Harn are flatter year-round.

**Buyers wanting walkable amenities (restaurants, shops, services).** While there are options, this isn't a dense walkable area like Patong or Phuket Town. Most residents drive.

**Buyers wanting close airport access for frequent travel.** 40-45 minutes is fine for monthly travel; tedious for weekly.

## What we're tracking in Rawai and Nai Harn

We're currently reviewing approximately 10 active and pre-launch projects across the two neighbourhoods, ranging from boutique freehold villa developments through mid-rise condo projects up to larger branded residences. Pricing spans roughly 3M THB entry-level for compact units up to 30M+ THB for larger villas.

## What's coming

We'll continue expanding coverage of Rawai and Nai Harn as new projects launch and as we complete reviews of existing inventory. We'll also be publishing more granular guides on specific sub-areas (Nai Harn village, Rawai Pier area, Friendship Beach side, Saiyuan / inland Rawai, the headland villas) as we go deeper.

If you're considering buying in Rawai or Nai Harn and want to discuss your specific criteria, get in touch via WhatsApp or the project enquiry forms.

---

*Last reviewed: 18 June 2026*
`

const waMsg = encodeURIComponent("Hi, I'm exploring Rawai/Nai Harn — could you recommend projects that might suit me?")

export default async function RawaiNaiHarnPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects_public')
    .select('id, project_name, slug, area, price_min, price_max, construction_status, cover_image_url, hawook_intro, hawook_badge, status, foreign_quota_available, rental_program_available, unit_types')
    .in('area', ['Rawai', 'Nai Harn'])
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
          Our Rawai &amp; Nai Harn coverage
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
            Not sure which projects suit your criteria? Message Yogi on WhatsApp — we know every active development in Rawai and Nai Harn and can point you in the right direction in minutes.
          </p>
        </div>
        <Link
          href={`https://wa.me/66805100129?text=${waMsg}`}
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
