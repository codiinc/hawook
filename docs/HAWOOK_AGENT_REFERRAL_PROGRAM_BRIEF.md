# HAWOOK — AGENT REFERRAL PROGRAM BRIEF

**Status:** Strategic plan. Not active. Held for execution in approximately 2-3 weeks once project catalog reaches 6-8 published projects.
**Owner:** Codi (strategy + partner recruitment), Yogi (operational support)
**Last updated:** 2026-06-23

---

## WHY THIS EXISTS

Foreign buyers shopping for Phuket property frequently arrive through agent referrals from their home country — particularly from countries with established real estate broker cultures (Australia, UK, Germany, US, Singapore). These referring agents have a real client need: they have buyers asking about Thailand and no credible partner to refer them to.

The standard market response is for these buyers to end up on portals (FazWaz, Dot Property) or with whoever they google first. The referring agent gets nothing. Buyer often gets sub-optimal counsel. Hawook is positioned to be a more credible partner for these agents than any portal aggregator can be.

This document holds the strategy in shape so when the platform is ready to support partner activity, we can move quickly without re-thinking from zero.

---

## WHY NOT NOW

Three blockers between today and credible partner activation:

1. **Catalog depth.** Hawook currently has 4-6 published projects. A partner agent needs to be able to refer clients to a catalog that meets their buyer's criteria. Below 8 properly-published projects, partners will hit "you don't have what my client wants" too often.

2. **Partner-specific infrastructure.** Need referral tracking, commission accounting, partner-only resources, and a tracked landing experience. Building these without first having 1-2 real partners is over-engineering. Building them BEFORE inviting partners is necessary.

3. **Brand validation.** Partners refer based on their own reputation. The site needs to look like a credible operation when a partner's client lands on it. Polish Sessions 1-3 worth of polish + 8-10 published projects = credible. Pre-that = risk to partner reputation.

Target activation window: **2-3 weeks from today**, after project catalog reaches 8+ and Polish Session 2 ships.

---

## THE PARTNER PROFILE

We are NOT building an open referral program. We are recruiting specific high-quality partners.

Ideal partner characteristics:

- **Established broker** in their home market, ideally 5+ years in property
- **Has existing client base** of foreign-property-curious buyers (retirees considering downsizing internationally, investors diversifying beyond home market, second-home buyers)
- **Reputation-conscious** — won't refer clients to a service that could damage their own reputation
- **Geographically positioned** in a market where Phuket has natural buyer demand
- **Operates in English** for transaction simplicity
- **Capable of qualifying leads** — sends buyers who are actually ready vs. tire-kickers

Priority source markets in order:

1. **Australia** — Gold Coast, Brisbane, Sunshine Coast brokers with retiree clients
2. **United Kingdom** — London property specialists, Cotswolds/Cornwall brokers with second-home clients
3. **Germany / German-speaking** — emigration consultants, expat brokerages
4. **Singapore** — established Singapore property brokers with diversification-focused clients
5. **United States** — coastal California and Florida brokers with retiree clients (lower priority due to legal complexity around US-domiciled clients buying Thai property)
6. **Hong Kong / Greater China** — established Asian markets where high-net-worth diversification is common (high opportunity, higher complexity around language and visa considerations)

Target: 3-5 active partners by end of Q3 2026. Scale to 8-10 by end of Q4. Cap at 15 active partners by end of year 2 — quality over quantity.

---

## COMMISSION STRUCTURE

Standard structure:

- **First closed referral from a partner:** 20% of Hawook's commission
- **Second closed referral:** 22%
- **Third referral onwards:** 25%
- **Cap at 25%** — no further tiers

Rationale: rewards real producers, deters one-and-done lead farmers, keeps Hawook's margin viable.

Payment terms: net 30 days after Hawook receives developer commission. Payment in USD via bank transfer or Wise.

Quality gate: Hawook reserves the right to decline obviously unqualified leads (budget significantly below entry-level, leasehold-only when buyer requested freehold, wrong market entirely). Partners are notified of declines so they can refine their qualifying.

Transparency: Partners get visibility into their own performance via a partner dashboard at `/admin/partners/[slug]` (when built). Shows referrals sent, status of each, commissions earned, payments processed.

---

## OUTREACH APPROACH

Hawook initiates partnerships. Not the other way around. No public "become an agent partner" landing page in v1.

**Outreach sequence per identified partner:**

1. **Research the partner thoroughly** — what's their client base? What recent transactions can you find? What does their website say about their values? Reference specifics in outreach.

2. **First contact via email (NOT cold WhatsApp).** Tailored message:
   - Reference a specific recent transaction or area of their practice
   - Explain why their client base is a fit
   - Brief Hawook positioning (curated, editorial, 8-10 properly reviewed Phuket projects)
   - Specific value proposition for them (20% commission, partner dashboard, marketing assets)
   - Invitation to a 30-minute Zoom call to discuss further
   - Link to Hawook About page + 2-3 representative project pages

3. **If reply, schedule Zoom.** Walk them through the platform live. Show project examples in their client's price range. Discuss their typical client and how Hawook fits.

4. **If they're interested, send Partner Agreement** — see "Partner Agreement Template" below.

5. **Once signed, onboard:**
   - Provide their unique partner_code (for lead form tracking)
   - Share partner-only resource library (project briefings, area guides, commission FAQ)
   - Schedule monthly check-in for the first three months

---

## INFRASTRUCTURE NEEDED (BUILT WHEN ACTIVATION WINDOW OPENS)

**Code-side build work, estimated 6-8 hours total when ready:**

### 1. Partner tracking in lead form

Add `referring_partner_code` field to the lead capture form. Optional, hidden from buyers by default — populated automatically if a partner-specific URL is used (e.g., `app.hawook.com/?ref=AUSGC01` for the Gold Coast Australian partner).

When a lead is created with a `referring_partner_code`, the field carries through to all downstream notifications and the admin queue.

### 2. Partner admin dashboard

`/admin/partners` — list of all active partners
`/admin/partners/[code]` — individual partner view showing:
- Referral count (total, this month, this quarter)
- Lead status breakdown (New, Qualified, In Progress, Closed, Disqualified)
- Commission earnings (total, paid, pending)
- Recent referrals list
- Notes section for Codi to track relationship

### 3. Commission accounting table

`partner_commissions` table tracking each commission event:
- partner_id, lead_id, project_id, transaction_date
- developer_commission_amount, partner_commission_percentage, partner_commission_amount
- payment_status (pending, processing, paid, disputed)
- payment_date, payment_reference

### 4. Partner resources area

`/admin/partners/[code]/resources` — gated content for the partner including:
- Current project briefings (one-page summaries of each Hawook-recommended project, partner-ready PDFs)
- Area guides (Rawai/Nai Harn briefing, Bang Tao briefing, etc.)
- FAQ document for common partner questions
- Marketing assets (Hawook logo, brand guidelines, project images partners can use in their marketing with attribution)
- Commission and payment policy document

### 5. Partner-specific URLs

URL parameter `?ref=PARTNER_CODE` should set a session cookie that propagates the partner code to all subsequent lead submissions in that browser session. Code stays attached to that lead even if buyer navigates elsewhere before submitting.

---

## PARTNER AGREEMENT TEMPLATE

Need a simple 2-3 page agreement covering:

- Parties: The Chokdee Group Co., Ltd (Hawook) and the partner agent/agency
- Referral commission structure (the tiered percentages)
- What constitutes a valid referral (form submission with partner code, NOT just verbal mention)
- Commission calculation and payment timing (net 30 after Hawook commission received)
- Quality gate language (Hawook can decline unqualified leads with notification)
- Confidentiality (partner doesn't disclose Hawook commission percentages publicly)
- Term and termination (12-month renewable, either party can terminate with 30 days notice)
- Disclosure requirements (partner discloses Hawook referral relationship to clients)
- Governing law: Thailand

Draft this when Thai lawyer reviews Privacy Policy and Terms (already scheduled for legal pass).

---

## METRICS TO TRACK

When the program is live:

- **Partner count** (active vs. inactive)
- **Referrals per partner per month**
- **Conversion rate** (referrals → qualified → closed) per partner
- **Commission per closed referral** (validates the 20-25% tier math)
- **Partner satisfaction** (informal monthly check-ins, sentiment tracking)

If a partner has zero closed referrals after 6 months, transition them to "dormant" status — keep relationship warm but stop active engagement.

---

## SEQUENCE FROM TODAY

**Weeks 1-2 (now):**
- Codi focuses on project catalog (target: 6+ published projects)
- Polish Session 2 ships
- During spare time, Codi compiles a list of 5-10 specific potential partners with research (name, agency, contact, why they're a fit)

**Weeks 3-4:**
- Catalog reaches 8+ published projects
- Vlad builds infrastructure (Tasks 1-5 above): ~6-8 hours of work
- Partner Agreement template drafted and reviewed by Thai lawyer (alongside Privacy Policy review)

**Week 5:**
- First outreach to 2-3 priority partners
- Track responses, schedule Zoom calls
- Refine pitch based on early conversations

**Weeks 6-8:**
- Onboard first 2-3 active partners
- Monitor early referrals carefully
- Document learnings and refine process

**Month 3-4:**
- Expand to 5-7 active partners
- Build outreach pipeline for sustained partner acquisition
- Evaluate which source markets are working

---

## DECISIONS LOCKED

- Invitation-only, never an open public program
- Codi initiates outreach; never reactive
- 20/22/25% tiered commissions, capped at 25%
- Net 30 payment after Hawook commission received
- Partner can be terminated for poor lead quality or non-disclosure

## OPEN QUESTIONS FOR LATER

- Should there be a partner "tier" system (Bronze, Silver, Gold) once we have 5+ partners?
- Should partners have access to bid for exclusive geographic territories (e.g., "only Australian partner for Hawook")?
- Should we build co-branded landing pages per partner (e.g., `app.hawook.com/partners/agency-name`)?
- How do we handle multi-partner referrals (buyer connects with two of our partners) — first form submission wins, or some attribution split?
- What's the right approach to anti-poaching (preventing partners from sniping each other's clients)?

These get answered through real partner operations. Don't pre-decide.

---

**End of Agent Referral Program Brief v1.**

*Status: held for activation in approximately 2-3 weeks. Codi to compile partner research list during this period without active outreach.*
