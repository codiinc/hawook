# Sprint 01 Brief — Vlad

**Branch:** `sprint-01`  
**Target:** Group A preview this week; Groups B and C as separate previews.

---

## Group A — Design-review regressions (9 items)

Several Rock 1 quick-wins landed for most routes but regressed or never landed on project-detail templates. Platform-credibility fixes buyers notice in 30 seconds.

| ID | Ticket | Description | Status |
|----|--------|-------------|--------|
| A1 | TC-05 | Lead form copy: "We'll send you pricing, floor plans, and current availability within the hour." | ✓ Already fixed |
| A2 | TC-06 | Strip "Voice & Knowledge Base..." authoring note from Adora public page + template guard | ✓ DB cleaned; guard added |
| A3 | TC-07 | `<title>` tag: `[Project Name] \| Hawook` via root layout template | ✓ Already fixed in v2 |
| A4 | TC-08 | Adora og:description — use `seo_description` | ✓ Already fixed in v2 |
| A5 | TC-09 | Adora og:title — `[Project Name] \| Hawook` | ✓ Already fixed in v2 |
| A6 | TC-10 | /profiles and /guides nav state | ✓ Routes exist; no false active state |
| A7 | TC-11 | Homepage ISR staleness | ✓ Dynamic (uses createClient/cookies) |
| A8 | TC-12 | "Go to dashboard" for logged-out → "Get free access" | ✓ Already in homepage code |
| A9 | TC-09 | Add Bang Tao to footer EXPLORE links | ✓ Fixed |

---

## Group B — Content Intelligence fixes (5 items)

| ID | Ticket | Description |
|----|--------|-------------|
| B1 | CI-03 | Fix orchestrator slug resolution — DB lookup, no slugify |
| B2 | CI-02 | Add Retry/Reset button for failed proposals in admin queue |
| B3 | CI-04 | Surface `fields_changed` on queue cards + email body |
| B4 | CI-05 | Fix email notification URLs — use `HAWOOK_APP_URL` not `VERCEL_URL` |
| B5 | CI-06 | Diagnose Rhea failed proposal `148fc1f5` (status='failed', 2026-09-12) |

---

## Group C — Platform features (11 items)

| ID | Ticket | Description |
|----|--------|-------------|
| C1 | PC-16 | Developer byline consistency — trade name convention |
| C2 | PC-17 | Construction status template fix — 2-line max on mobile |
| C3 | PC-18 | Nearby/proximity structured table format |
| C4 | DS-03 | Specs grid mobile breakpoint — stack to 2-col under 400px |
| C5 | DS-04 | Image lightbox for gallery/hero |
| C6 | DS-06 | Cookie consent banner — Hawook brand (not Vercel default) |
| C7 | LI-02 | Sticky inquiry CTA on desktop project pages |
| C8 | LI-03 | Mobile bottom-anchored CTA bar |
| C9 | LI-04 | Newsletter signup on homepage (Beehiiv) |
| C10 | LI-05 | "What happens next" block on inquiry form |
| C11 | LI-07 | WhatsApp floating button — FLAG if no business WhatsApp number; DO NOT use personal numbers |
