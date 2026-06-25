# HAWOOK — INTERNAL MASTER DOCUMENT

**Version:** 1.2
**Date:** 17 June 2026
**Status:** Living document — updated as the business evolves
**Owners:** Founder, Yogi (Operations)

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Hawook Score — Quality & Curation System](#2-hawook-score--quality--curation-system-v10)
3. [Future Sections (placeholders)](#3-future-sections)

---

## 1. PROJECT OVERVIEW

### 1.1 What Hawook Is

Hawook helps international buyers find the best freehold property in Thailand, starting in Phuket.

**Public positioning (one-liner):** *"We help people find the best freehold property in Thailand."*

**Internal positioning:** Hawook is a curated property discovery and brokerage platform. We list a small number of high-quality off-plan freehold projects per area, write honest analysis on each, build trust over the 3–6 month buyer decision cycle, and convert through personalised follow-up and viewings. We are agency-licensed in Thailand and earn commission from developers. We are a curated agency with a media front-end — not a portal, not a generic listings site, not a content blog.

### 1.2 What Hawook Is Not

- **Not a comprehensive listings database.** We list a few quality projects per area, not every project.
- **Not a pushy sales operation.** We follow up consistently and helpfully, never aggressively.
- **Not a leasehold-first business.** Leasehold and alternative ownership structures handled via partners; freehold is the core.
- **Not a multi-market scaling play in year 1.** Rawai → Bang Tao → wider Phuket → Bangkok → wider Asia. One step at a time.
- **Not an opinion-free portal.** We take views. We say when something doesn't make sense.

### 1.3 Revenue Goal & Timeline

**Three-year target: 20M THB/year in agency commission revenue by end of year 3 (2028).**

Working assumptions:

- Average sale price: ~8M THB
- Average gross commission: ~5% (range 3–8% by developer)
- Average commission per closed deal: ~400K THB
- Annual closed deals needed at peak: ~50/year

Phasing:

- **Year 1 (2026):** 2–4M THB. Prove the funnel works end-to-end. 5–10 closed sales. Rawai focus.
- **Year 2 (2027):** 8–12M THB. Add partner agents. Bang Tao operational. 20–30 closed sales.
- **Year 3 (2028):** 20M THB+. Multiple Phuket areas operational, recurring developer relationships, brand has gravity. 45–55 closed sales.

### 1.4 Geographic Focus & Phasing

- **Phase 1 (now):** Rawai / Nai Harn only. 10 launch projects.
- **Phase 2 (Q4 2026):** Add Bang Tao when Rawai is generating consistent leads and viewings.
- **Phase 3 (2027):** Wider Phuket — Patong/Kamala, Chalong, Thalang.
- **Phase 4 (2028):** Bangkok and/or Koh Samui.
- **Phase 5 (2029+):** SEA expansion — Bali, Vietnam, Cambodia.

**Geographic discipline is critical.** Each new area requires (a) signed agency agreements with quality developers, (b) on-the-ground knowledge — partner agent or founder presence, and (c) enough content to compete on SEO and AI discovery in that area.

### 1.5 Target Audiences

**Primary: International Property Buyers**

- Foreign buyers researching off-plan freehold in Phuket
- Lifestyle buyers (second home, retirement, relocation)
- Investors (rental yield, capital appreciation)
- Digital nomads and remote workers exploring long-stay
- First-time international property buyers needing guidance

**Secondary: Property Developers**

- Distribution channel for new launches
- Exposure to qualified international buyers
- Newsletter inclusion, content features, partnership opportunities
- Source of agency stock

**Tertiary: Other Agents & Agencies**

- Partnership opportunities, co-broking
- Leasehold referrals to specialist partners
- Future stock pipeline as Hawook expands

### 1.6 Core Principles

1. **Curated, not comprehensive.** We list what we believe in. Quality over coverage.
2. **Honest over hyped.** Buyers can see through generic agency language. Real analysis builds trust.
3. **Freehold core.** Leasehold and alternative structures referenced and supported via partners, never the core offering.
4. **No pressure, persistent helpfulness.** We follow up every lead until they buy, opt out, or go dark. We never push.
5. **Data freshness as a moat.** Stale data is what every other portal does. We update, we notify, we stay current.
6. **Pan-buyer, single-region focus.** We serve buyers from anywhere in the world, but we know one region (Rawai) deeply before we touch the next.
7. **Public free, qualified treated well.** All useful content is free. Qualified leads get the white-glove treatment.
8. **AI-native discovery.** Content is structured so AI tools (ChatGPT, Claude, Perplexity) can find and cite us. This is already happening and we lean into it.

### 1.7 Team & Roles

**Founder (~4 hrs/week strategic + viewings as needed)**

- Partner agent and developer relationships (primary)
- Final approval on Hawook Score, content, and project updates
- Strategic decisions
- Qualified viewings in Rawai (until partner agent in place)
- Weekly review with Yogi

**Yogi — Operations VA (~2 hrs/day, 10 hrs/week)**

- Lead follow-up — top priority, every active lead, every day, until they buy or go dark
- CRM hygiene
- Content pipeline operation (extraction → writer → publish)
- Newsletter production
- Ad operations and reporting
- AI prompt maintenance
- Drafting project updates for founder approval

**Partner Agent — Rawai (commission-based, to be signed)**

- Showings (once active)
- Developer registrations
- On-the-ground market intelligence
- Commission split: 50/50 to 60/40 of agency commission, depending on who sourced the lead

**AI & Automation**

- Content first drafts (extraction → writer pipeline)
- Newsletter topic suggestions and drafts
- Lead nurture sequences
- Project update detection (Cowork cron checking for stale data)
- SEO content briefs

### 1.8 Technology Stack

**Public site (content layer): WordPress at hawook.com**

Articles, How-To Guides, area guides, blog posts, newsletter signup. Existing SEO authority preserved. WiFi/gardening legacy articles left in place as quiet traffic generators. New investigative articles (e.g. the Bang Tao Land Seizure piece) published here.

**App (interactive layer): Next.js 14 on Vercel**

Project profiles, area profiles, developer profiles, user auth, gated content, project following, dashboard, admin panel. Migrated from existing WordPress property pages with 301 redirects to preserve SEO.

URL routing:

- `hawook.com/blog/*`, `/how-to-guides/*`, `/sea-market-insights/*` → WordPress
- `hawook.com/property/*` → 301 redirect → `app.hawook.com/projects/*`
- `hawook.com/area/*` → 301 redirect → `app.hawook.com/areas/*`
- `hawook.com/developer/*` → 301 redirect → `app.hawook.com/developers/*`

**Database: Supabase (schema v3.0 deployed)**

Core tables: `projects`, `developers`, `areas`, `leads`, `project_follows`, `project_updates`, `users`, `handoffs`.

**Content pipeline:**

- Claude Project "Hawook — Project Extractions" — structured data extraction from source materials
- Claude Project "Hawook — Project Writer" — editorial content generation
- Cowork — database push, project update ingestion, approval workflow

**Media:** Cloudinary, managed via admin panel.

**Email:** Resend for transactional and nurture sequences.

**Newsletter:** Currently 120 subs at 20% open rate. Platform decision pending (Beehiiv, ConvertKit, or self-hosted via Resend with Supabase integration).

**Ads:** Google Search (~$200/mo) + Meta Retargeting (~$100/mo) initially. Ramp to $1000/mo total when cost per qualified lead drops below $30.

**CRM:** Notion or Airtable until 50+ active leads, then graduate to a purpose-built CRM.

**Analytics:** Google Analytics 4 (live), conversion tracking via GA events + Supabase events.

### 1.9 Editorial Voice

Hawook uses a small set of writer personas to give regional and thematic coverage variety while maintaining a unified honest, grounded voice. Current active personas include Codi Mansbridge (Phuket on-the-ground), Maya Chen (investment analysis), Dan Suriya (regional / structural commentary), Tatiana Belova (market trends).

All content follows the editorial principles in Section 1.6 — honest, grounded, not hyped, willing to say when something doesn't make sense.

A full editorial voice spec sits in a separate document (TBD: see Section 3).

### 1.10 Current Phase

As of June 2026, the business is in restart mode. WordPress assets producing 732 monthly active users (mostly organic search), 120 newsletter subs, 5–7 signed developer agreements in Rawai, and an existing Next.js MVP on Vercel. Schema v3.0 partially deployed.

Immediate 30-day focus: Hawook Score system live, 10 Rawai projects rebuilt on the app with full data and badges, project update + notification system operational, lead capture → CRM → nurture flow end-to-end, ads switched on.

The 30/60/90 day execution plan lives in a separate document and is updated weekly.

---

## 2. HAWOOK SCORE — QUALITY & CURATION SYSTEM v1.0

### 2.1 Purpose

The Hawook Score is the **internal curation tool** that determines:

- Whether a project gets listed at all
- What badge tier (if any) it earns publicly
- How prominently it's featured
- When it gets newsletter coverage
- When it should be removed or re-scored

The numerical score is **internal only**. Buyers never see numbers. They see badges, descriptive tags, and a qualitative paragraph ("Hawook's Take") that explains the judgment in plain language.

### 2.2 Why Internal-Only Scoring

Three problems with public numerical scores:

**Buyer psychology.** Booking.com proved that hotels rated 7.0 don't get booked. A 7.0/10 on a freehold condo — technically "good" — reads as "not the best" to a buyer making a 5–20M THB decision. Public numbers below the maximum suppress conversion.

**Developer relationships.** Developers will not tolerate a public 6.4 on their project. Even private scores leak. The relationship cost is not worth the curation benefit.

**Score drift.** Projects change — foreign quota fills, construction slips, comparables launch at lower prices. Public score downgrades create awkward archaeology and constant pressure to revise upward.

**The Michelin parallel applies.** Michelin doesn't publish 6.4/10 for restaurants they didn't like — they simply don't include them. Inclusion in the guide is itself the recognition. Stars, Bib Gourmand, and bare inclusion are the only public signals. Hawook works the same way.

### 2.3 The Six Scoring Dimensions

Each dimension is scored 1–10 with concrete evidence. Yogi proposes scores with evidence sources documented; Founder approves or revises. Scores are stored in the `projects` table in Supabase but never exposed to public-facing pages or APIs.

---

**Dimension 1: Developer Track Record — Weight 25%**

The most important dimension because off-plan = trust in delivery. The developer's history is the single best predictor of whether the project will actually be delivered as sold.

*Evidence to gather:* years operating in Thailand, number of completed projects, on-time delivery history, post-handover service reputation, any legal disputes or project failures, public listing status, principal background.

| Score | What it looks like |
|---|---|
| 9–10 | Publicly listed (SET) or equivalent. 20+ year track record. 10+ completed projects in Thailand. On-time delivery norm. Strong post-handover service. No significant complaints. Sansiri tier. |
| 7–8 | Established mid-tier. 5+ completed projects. Generally on-time. No significant legal issues. Reasonable post-handover response. |
| 5–6 | Newer or smaller developer. 1–2 completed projects. Mixed signals on delivery or service. Some buyer complaints but nothing structural. |
| 3–4 | First or second project. Unknown principals. Some red flags — late delivery, quality complaints, financial concerns. |
| 1–2 | Significant red flags — failed prior project, legal action, principal track record in unrelated industry, financial distress signals. |

---

**Dimension 2: Location Quality — Weight 20%**

Micro-location matters more than buyers realise. Within Rawai, a five-minute walk from the beach is worth dramatically more than a ten-minute drive.

*Evidence to gather:* distance to beach (walk and drive), road quality and access, surrounding development (settled vs raw vs over-developed), proximity to amenities (supermarket, hospital, international school), infrastructure (sewage, water, power reliability), view quality and view-blocking risk from future builds, neighbourhood character.

| Score | What it looks like |
|---|---|
| 9–10 | Walkable to beach. Established, settled neighbourhood. Strong amenities. No obvious view-blocking or infrastructure risk. Clear road access. |
| 7–8 | Short drive (under 5 min) to beach. Good road access. Solid surroundings with established amenities. Minor risk factors. |
| 5–6 | 10+ min drive to beach. Some access friction. Underdeveloped surroundings or significant ongoing construction nearby. Amenities require a drive. |
| 3–4 | Poor access, problematic location, significant downside risk (e.g. flood, noise, planned highway). |
| 1–2 | Fundamentally compromised location. |

---

**Dimension 3: Build & Design Quality — Weight 15%**

What's actually being built — materials, layout, design integrity.

*Evidence to gather:* architect or designer credentials, materials specification (slab thickness, glazing, fixtures, AC), layout efficiency (sqm wasted on corridors and dead space), finish quality on completed similar projects by the same developer or designer, sustainability features, build standard relative to area peers.

| Score | What it looks like |
|---|---|
| 9–10 | International-quality architecture. Premium materials throughout. Smart, efficient layouts. Considered finishes. Often a recognised designer or developer with a clear design DNA. |
| 7–8 | Above market standard. Considered design, no obvious cost-cutting. Good materials in key areas. Layouts work. |
| 5–6 | Market standard. Generic but acceptable. Some value-engineered choices visible. |
| 3–4 | Below market standard. Visible cost-cutting, poor layouts, cheap finishes that will date quickly. |
| 1–2 | Substantially below standard. Concerns about long-term durability. |

---

**Dimension 4: Pricing vs Market — Weight 15%**

Is the buyer getting value at current pricing? Compared to comparable projects, not in absolute terms.

*Evidence to gather:* price per sqm vs three nearest comparable projects (same area, similar tier, similar completion timeframe), payment plan terms, hidden costs (CAM fee, sinking fund, transfer fees, furniture pack required or optional), total-cost transparency.

| Score | What it looks like |
|---|---|
| 9–10 | Priced meaningfully below comparable projects. Favourable payment terms (low deposit, milestone-based). All costs transparent and reasonable. |
| 7–8 | Priced in line with market. Reasonable payment terms. No hidden costs of concern. |
| 5–6 | Slight premium without clear justification. Payment terms okay but not generous. Some cost ambiguity. |
| 3–4 | Meaningful overpricing or hidden cost issues. Aggressive payment schedule. |
| 1–2 | Significantly overpriced or cost structure designed to mislead. |

---

**Dimension 5: Ownership & Legal — Weight 15%**

The deal can only happen if the legal foundation is clean.

*Evidence to gather:* freehold structure clarity, foreign quota status (available, partially available, full), building permit status, EIA approval status (if required), land title cleanliness (Chanote vs other), legal entity track record of the developer.

| Score | What it looks like |
|---|---|
| 9–10 | Clean Chanote freehold. Foreign quota comfortably available. All permits secured. EIA approved if needed. Established legal entity with clean record. |
| 7–8 | Freehold confirmed. Foreign quota available. Permits in late stages or secured. Legal entity in order. |
| 5–6 | Some legal complexity — permits still pending, quota tight, structure needs explanation. Buyer will need careful guidance. |
| 3–4 | Foreign quota full or unavailable. Significant permit delays. Legal complexity that limits buyer pool. |
| 1–2 | Fundamental legal issues — title concerns, permit problems, foreign ownership not possible. |

Note: a score below 6 on this dimension alone is grounds for non-listing, regardless of overall weighted score. Legal cleanliness is a threshold, not just a contributor.

---

**Dimension 6: Investment Potential — Weight 10%**

For buyers who care about yield and resale. Lower weight because many Hawook buyers are lifestyle-led, but it matters and we need to be honest about it.

*Evidence to gather:* rental demand in the micro-location (not the area generally), realistic achievable yield based on comparable completed projects (not developer-promised yield), exit liquidity / resale market activity, capital appreciation outlook based on infrastructure and area development.

| Score | What it looks like |
|---|---|
| 9–10 | Strong proven rental demand in the immediate area. Realistic 6%+ net yield achievable based on comparable completed projects. Active resale market with reasonable liquidity. |
| 7–8 | Decent rental potential. 4–6% net yield achievable. Reasonable resale outlook in 5–10 year window. |
| 5–6 | Lifestyle purchase more than investment. Weak rental yield case or significant management/seasonality issues. |
| 3–4 | Poor rental prospects. Illiquid resale. Better suited to buyer planning to occupy. |
| 1–2 | No realistic investment case. Pure lifestyle play. |

---

### 2.4 Calculating the Score

Weighted average, rounded to one decimal place.

Formula:

```
Score = (D1 × 0.25) + (D2 × 0.20) + (D3 × 0.15) + (D4 × 0.15) + (D5 × 0.15) + (D6 × 0.10)
```

**Worked example.** A project scoring 8 / 7 / 7 / 6 / 9 / 6:

= (8 × 0.25) + (7 × 0.20) + (7 × 0.15) + (6 × 0.15) + (9 × 0.15) + (6 × 0.10)
= 2.00 + 1.40 + 1.05 + 0.90 + 1.35 + 0.60
= **7.30**

### 2.5 Internal Listing Thresholds

| Internal Score | Action |
|---|---|
| Below 7.0 | Not listed. Do not pursue. |
| 7.0–7.9 | Listed. Standard project page. No badge. |
| 8.0–8.4 | Listed with "Hawook Recommended" badge. Featured in area pages. |
| 8.5–8.9 | Listed with "Hawook Recommended" badge. Newsletter feature. |
| 9.0+ | Listed with "Hawook Top Pick" badge. Hero placement. Newsletter lead. |

**Hard floor:** any project scoring below 6 on Ownership & Legal (Dimension 5) is not listed regardless of overall score. Legal cleanliness is non-negotiable.

**Soft floor:** any project scoring below 5 on Developer Track Record (Dimension 1) is not listed regardless of overall score. We do not vouch for unproven developers.

#### Listability Floor

**Soft listing floor: 7.5 weighted total.** Projects scoring below 7.5 require explicit approver override to be listed in the public catalog, with a documented reason recorded in the project's internal notes. Below the floor, the default is non-listing. Per-dimension hard floors remain unchanged: Ownership & Legal must be ≥ 6.0 and Developer Track Record must be ≥ 5.0 for a project to be listable at all, regardless of weighted total.

### 2.6 Public-Facing Badge Tiers

Three tiers, all positive recognition. The absence of a badge is not a negative signal — it just means the project is listed.

**Hawook Listed** (implicit, no badge displayed)

Every project on the site has passed our quality framework. Agency agreement signed, internal score 7.0+, full diligence done. The fact of being on Hawook is the recognition.

**Hawook Recommended** (visible badge)

Score 8.0+. Strong across most dimensions. Featured in area pages, newsletter mentions when relevant.

**Hawook Top Pick** (visible badge, rare)

Score 9.0+. Exceptional across nearly all dimensions. Hero placement on relevant pages. Newsletter lead coverage. Limited to ~3–5 projects across the entire site at any time. If too many projects qualify, the threshold becomes the top 5 highest scoring.

### 2.7 Descriptive Tags

Factual descriptors that buyers can filter and sort by. These are not judgmental — they describe attributes, not quality.

Initial tag set:

- **Location attributes:** *Walk to Beach, Beach Within 5 Min, Near International School, Near Hospital, Near Boat Avenue, Quiet Neighborhood, Established Area*
- **Project attributes:** *Foreign Quota Available, Freehold Confirmed, Furnished, Pet Friendly, Pool Villa, Sea View Units, Mountain View Units, Brand New Launch, Under Construction, Completing 2026, Completing 2027, Ready to Move In*
- **Buyer attributes:** *Foreign Finance Friendly, Strong Rental Yield Potential, Lifestyle Focus, Investor Focus, Family Friendly, Retirement Friendly, Below Market Pricing*
- **Developer attributes:** *Established Developer, Publicly Listed Developer, First Phuket Project, Boutique Developer*

Tag set evolves over time. New tags require Founder approval to maintain consistency.

### 2.8 Hawook's Take — The Qualitative Paragraph

Every listed project gets a 100–150 word public-facing paragraph explaining the judgment in plain language. This is the trust-builder. Numbers and badges alone don't convince a 10M THB buyer; honest analysis does.

**Template structure:**

1. Sentence 1 — the headline judgment in one line (e.g. "Strong micro-location, established developer, fair pricing.")
2. Sentence 2–3 — what the project does well, with specifics.
3. Sentence 4–5 — the trade-off or caveat worth knowing.
4. Sentence 6–7 — who this project is right for (and implicitly, who it isn't).
5. Optional final line — a comparative pointer to a different project for buyers with different priorities.

**Example (Adora Rawai):**

> *Adora Rawai sits in a strong micro-location — a five-minute walk from Rawai beach with established surroundings. Pricing at ฿95K/sqm is in line with nearby comparables and the foreign quota is currently available. Rhom Bho Property has delivered three projects in Phuket on time, which counts for a lot in off-plan. The trade-off worth noting: foreign quota is filling fast and lower-floor units have limited sea view. For buyers prioritising location quality and a proven developer, this is a strong pick. For pure rental yield, compare against The Title Halo Naiyang — slightly higher achievable yields but a less established neighbourhood.*

**Tone rules:**

- Specific over vague ("five-minute walk to Rawai beach" not "great location")
- Honest about trade-offs — every project has them
- Never use generic agency words: *luxury, exclusive, premium, unique, breathtaking, unmissable*
- Always end with who it suits — buyers want to feel seen, not sold to
- Comparative pointers are welcome — buyers comparing two Hawook projects are still buying from Hawook

**Database column note:** This qualitative paragraph is stored in the `hawook_take` column on the `projects` table. A separate field, `hawook_verdict`, stores structured BUY IF | SKIP IF | WATCH FOR cards (pipe-delimited, e.g. `"BUY IF: ... | SKIP IF: ... | WATCH FOR: ..."`). These are two distinct, complementary features — both are public and both are rendered on project detail pages. `hawook_take` is the prose paragraph described in this section. `hawook_verdict` is the structured cards. Do not conflate them.

### 2.9 Public-Facing Explanation Copy

This appears on the About page and "How Hawook Curates" page, and should be referenced (briefly) on project pages.

> **How Hawook Curates**
>
> Most property portals list everything. We don't.
>
> Every project on Hawook has passed our quality framework — six dimensions covering developer track record, location, build quality, pricing, legal cleanliness, and investment potential. If a project doesn't clear our bar, it doesn't go on the site. We'd rather list ten projects we'd buy ourselves than three hundred we wouldn't.
>
> When you see a project on Hawook, it means we've signed an agency agreement with the developer, done full diligence, and decided it's worth your time. Some projects also carry a *Hawook Recommended* or *Hawook Top Pick* badge — these are the projects that stood out most clearly across our framework.
>
> We don't publish numerical scores. We publish honest analysis instead — what each project does well, what the trade-offs are, and who it's actually right for. You can read our take on every project, ask our team anything, and trust that what you see is what we believe.

### 2.10 Scoring Workflow

The full process from raw materials to live project page:

1. **Materials gathered** — brochure, price list, floor plans, legal docs, developer materials. Stored in project folder.
2. **Yogi runs extraction** — Claude Project "Hawook — Project Extractions" produces structured data.
3. **Yogi scores against the six dimensions** — each score includes a one-line evidence note (e.g. "D1 score: 8. Rhom Bho Property — 3 completed projects in Phuket, all delivered within 6 months of original date.")
4. **Yogi drafts Hawook's Take** — using template in Section 2.8.
5. **Founder reviews** — approves or revises scores and the paragraph. This is the founder's single highest-leverage quality touchpoint. Aim for 10–15 min per project.
6. **Final score calculated** — automatic via weighting formula.
7. **Badge tier assigned** — automatic from threshold table.
8. **Page published** — Yogi runs Claude Project "Hawook — Project Writer" for additional public content (SEO description, area context, etc.), pushes to Supabase via Cowork.
9. **Project page goes live** — public content visible, gated content (full pricing, floor plans, ROI breakdown) behind signup wall.

### 2.11 Re-scoring Triggers

The score is recalculated when any of the following happens. Most are detected by the `project_updates` system; the rest are scheduled.

**Automatic / event-driven triggers:**

- Foreign quota status changes (affects D5)
- Major price change up or down (affects D4)
- Construction stage milestone (affects D1 indirectly — on-time delivery evidence)
- Comparable project launches at materially different pricing (affects D4)
- Developer news — financial issues, awards, completed project (affects D1)

**Scheduled triggers:**

- Quarterly review of every listed project (light)
- Annual full re-score (deep)

**Outcome of re-scoring:**

- Score moves up by 0.5 or more → badge may upgrade
- Score moves down by 0.5 or more → badge may downgrade or be removed
- Score moves below 7.0 → project removed from site (with explanation to developer)
- Score moves below 6.0 on D5 (legal) or below 5.0 on D1 (developer) → immediate removal regardless of overall score

When a project is removed, the public page returns a 410 Gone with a brief explanation and a link to comparable currently-listed projects. SEO juice is preserved by redirecting to a closely related area or project page where appropriate.

---

## 3. FUTURE SECTIONS

Sections to be added to this master doc as they're decided. Each gets its own document until mature, then merges in here.

- **Content & Editorial Spec** — full writer persona briefs, voice guide, content type templates, AI prompt structure for the extraction and writer pipelines.
- **Lead Handling Playbook** — lead stages, qualifying criteria, follow-up cadence per stage, white-glove treatment definition, when to register a buyer with a developer, lead-source attribution rules.
- **Partner Agent Framework** — agreement template, commission splits and tiebreakers, lead handoff process, agent onboarding, performance review cadence.
- **Developer Relations** — agency agreement template, exclusivity terms, paid-feature pricing (when developers pay for placement), communication cadence, escalation process.
- **Project Update System Spec** — full data flow, approval interface, notification rules, frequency caps, what triggers an update vs a re-score.
- **Newsletter & Content Cadence** — weekly newsletter structure, content production pipeline, editorial calendar, repurposing rules.
- **Ad & Growth Playbook** — channel-by-channel briefs, target CPA, creative principles, landing page rules.
- **Brand & Visual Identity** — logo, colour, typography, photography style, social asset templates.

---

## CHANGELOG

| Version | Date | Change |
|---|---|---|
| 1.0 | 16 June 2026 | Initial version — project overview, Hawook Score system, scoring workflow |
| 1.2 | 17 June 2026 | `hawook_take` vs `hawook_verdict` naming clarified — `hawook_take` is the prose paragraph (Hawook's Take), `hawook_verdict` is the structured BUY IF | SKIP IF | WATCH FOR cards. Clarifying note added to Section 2.8. |
| 1.2 | 21 June 2026 | Added 7.5 soft listing floor for Hawook Score weighted total (Section 2.5 — Listability Floor). Below 7.5 requires explicit approver override with documented reason. Per-dimension hard floors unchanged. |
| 1.2 | 25 June 2026 | Column type discipline formalised in Content Ops Spec (Section 6.9) after Adora Rawai proposal failures (buildings, floors integer type mismatches). Integer columns must use plain integer literals. Numeric columns strip currency symbols and percentage signs. Date columns use ISO 8601. |

---

**End of Master Document v1.2.**

*Owner of this document: Founder. Last review: 17 June 2026. Next scheduled review: end of July 2026. Any team member can propose edits; only Founder approves changes.*
