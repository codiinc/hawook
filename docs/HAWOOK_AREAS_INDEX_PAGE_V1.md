# HAWOOK AREAS INDEX PAGE — DRAFT v1

**Purpose:** Source content for `/areas` on app.hawook.com — the index page listing all areas Hawook covers.
**Status:** Draft v1 — ships with 2 areas (Rawai & Nai Harn, Bang Tao); designed to scale to 5-8 areas over time.

---

# Where to look in Phuket

Phuket is a big island. Buyers who arrive expecting one "Phuket" market quickly discover there are really several — each with its own character, buyer profile, pricing logic, and lifestyle implications. The areas we cover are the ones where international freehold property activity is concentrated, where curation matters, and where we can do substantive research firsthand.

We currently cover two areas in depth. Both have distinct profiles. Most buyers find that one is clearly the right fit for them and the other isn't — sometimes for budget reasons, sometimes for lifestyle, sometimes for rental strategy. The wrong area is one of the most common buyer mistakes in Phuket. If you're not sure which area suits you, we'd rather have a 10-minute conversation than have you spend three weeks researching the wrong inventory.

---

## Rawai & Nai Harn

**Southern Phuket. The quiet end.**

Phuket's southernmost neighbourhoods — quieter, more residential, more authentic Thai character. International school access is good (UWC, BCIS within 15-25 minutes). Beaches at Nai Harn and Yanui are among the most beautiful and least crowded on the island. Strong long-stay rental market; weaker peak-season short-stay yields than Bang Tao. Entry-level condos from approximately 3M THB; villas commonly 7M-30M THB freehold-equivalent.

Best for: long-term residents wanting calm, families with school-age children, buyers prioritising beach access without tourist density, investors prioritising long-stay rental over short-stay.

[Card with the Rawai & Nai Harn cover image / map + "See Rawai & Nai Harn" CTA → /areas/rawai-nai-harn]

---

## Bang Tao

**Western Phuket. The high-end coast.**

Phuket's premium resort and beachfront residence area. International-buyer epicentre. Five-star hotel brand concentration. Strongest short-stay rental market on the island. International school access excellent (UWC, BCIS within 10-15 minutes). Entry-level condos from approximately 5-7M THB; branded villas commonly 30M-100M+ THB.

Best for: investors prioritising rental yield, families with school-age children, buyers wanting walkable beach + resort lifestyle, buyers with budgets over 10M THB for condos or 30M THB for villas.

[Card with the Bang Tao cover image / map + "See Bang Tao" CTA → /areas/bang-tao]

---

## Other areas

We're often asked about Patong, Phuket Town, Kata/Karon, Kamala, and the Mai Khao/Nai Yang area to the north. We have informal coverage of several of these areas but haven't yet completed the editorial work required to publish them as Hawook-curated catalog. We'll add areas as we can do them justice — not before.

If you're interested in an area we don't yet cover formally, we can still help in a more informal capacity. Get in touch via WhatsApp.

---

[Single bottom CTA: "Not sure which area fits you? Tell us about your situation and we'll help you narrow it down." → WhatsApp with pre-fill: "Hi, I'm trying to figure out which Phuket area suits me best — could you help?"]

---

*Last reviewed: [date to be set on publish]*

---

# IMPLEMENTATION NOTES FOR DEV WORK

## Page structure

This is essentially a card-based index page with two primary area cards plus an "other areas" mention and a closing CTA.

## Visual design

Two large area cards on desktop, stacked on mobile. Each card includes:

1. **Hero image** — a representative photograph of the area (beach, residential, character shot). For Rawai/Nai Harn: ideally Nai Harn Beach or Promthep Cape. For Bang Tao: ideally a Laguna or Layan beach shot. Sourced or contributed.
2. **Area name** (Fraunces, large, teal/dark)
3. **Subtitle / positioning line** — single line below name in italic ("Southern Phuket. The quiet end." / "Western Phuket. The high-end coast.")
4. **3-4 paragraphs of editorial content** — same text as in the markdown above
5. **"Best for:" summary line** — single sentence
6. **CTA button** — "See Rawai & Nai Harn" / "See Bang Tao" → linking to the respective area page
7. **Optional: project count** — "12 projects we recommend in Rawai & Nai Harn" / "8 projects we recommend in Bang Tao" (live count from the database)

## Card layout

Side-by-side on desktop (1024px+):
- Hero image on the top of each card
- Editorial text below image
- CTA button at bottom of card

Single column stacked on tablet and mobile:
- Hero image full-width
- Editorial text below
- CTA button

Each card should feel premium — generous whitespace, considered typography, no clutter. The visual treatment should evoke editorial magazine rather than property portal.

## Card data source

The areas could be hard-coded for now (only 2 areas, low maintenance) OR sourced from a future `areas` table in Supabase. Hard-code for v1; build a schema layer later if/when we have 5+ areas.

## Nav update

The "Areas" nav link in the header should now point to `/areas` (this index page), not directly to `/areas/rawai-nai-harn`.

## URL encoding for closing CTA

`https://wa.me/66805100129?text=Hi%2C%20I'm%20trying%20to%20figure%20out%20which%20Phuket%20area%20suits%20me%20best%20%E2%80%94%20could%20you%20help%3F`

## Project count derivation

For each area's count, query published projects with matching area field:
```
SELECT COUNT(*) FROM projects_public WHERE area IN ('Rawai', 'Nai Harn');
SELECT COUNT(*) FROM projects_public WHERE area = 'Bang Tao';
```

## Image source for area hero photos

If brand assets aren't ready, use a Cloudinary-hosted placeholder image with the area name overlaid. Flag for proper photography sourcing as a follow-up task.

## Future expansion pattern

When new areas are added (Patong, Phuket Town, etc.), the same card pattern scales. At 4+ areas, consider:
- 2-column grid on desktop
- Filter/sort affordances
- "Featured area this month" promotion

But for v1 with 2 areas, simple side-by-side cards.
