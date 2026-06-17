# HAWOOK — PROJECT STATUS

**Version:** v1 — current state snapshot
**Last updated:** 17 June 2026
**Purpose:** If this chat is lost or a new conversation starts, this document brings any AI assistant (or human) up to current state in 5 minutes of reading.

---

## ONE-LINE STATUS

Tier 1 complete and verified. Tier 2 Phase 1 mid-execution — Sessions 1 and 2 of 5 complete. Public lead capture form is live, Hawook Score badges render, content ops + admin sessions still ahead. Pending external dependency: Resend domain DNS verification by Yogi.

---

## WHAT HAWOOK IS

Hawook helps international buyers find the best freehold property in Thailand, starting in Phuket. Curated property discovery and brokerage platform. Currently focused on Rawai/Nai Harn (Phase 1 of geographic phasing). Founder is Codi Mansbridge (working ~4 hrs/week strategic + viewings); operations VA is Yogi (~2 hrs/day, Indonesia-based, remote).

Revenue goal: 20M THB/year in agency commission by end of 2028 (~50 closed deals/year at ~400K THB avg commission). Year 1 target: 2–4M THB and 5–10 closed deals to prove the funnel.

Full positioning, principles, and revenue model in `docs/HAWOOK_MASTER_DOC_v1.2.md`.

---

## ARCHITECTURE OVERVIEW

**Public site (content layer):** WordPress at hawook.com. Articles, How-To Guides, area guides, blog, newsletter signup. Keeps existing SEO authority.

**App (interactive layer):** Next.js 14 on Vercel. Currently deployed at `hawook.vercel.app`; custom domain `app.hawook.com` configured in Vercel, DNS CNAME pending Yogi. Project profiles, area profiles, developer profiles, user auth, gated content, project following, dashboard, admin panel, future AI Concierge.

**Database:** Supabase Postgres (project `jpuaradwxylxkyvnncdq`, ap-southeast-1). Schema has 16+ planned tables; Tiers 1–2 are activating them progressively.

**Email:** Resend for transactional (configured, awaiting DNS verification). Beehiiv for newsletter.

**Media:** Cloudinary.

**Repo:** https://github.com/codiinc/hawook. Production branch is `main`. Live deployment commit at time of writing: `2aab796` (after Session 2 + lazy-init fix). All Hawook spec docs live in `/docs/` in the repo.

---

## TEAM AND HUMAN ROLES

| Role | Who | Hours | Responsibilities |
|---|---|---|---|
| Founder | Codi | ~4 hrs/week + viewings | Strategy, approvals, partner agent + developer relationships, qualified viewings, weekly Yogi review |
| Operations VA | Yogi | ~2 hrs/day | Lead follow-up, CRM, content pipeline ops, newsletter, ad ops, webmaster (DNS/mailboxes) |
| Partner Agent | TBD | Commission-based | Showings, on-the-ground intelligence (signing pending) |
| AI Concierge | (build pending) | Always on | Public-facing chat, info gate, handoff triage |
| Content Ops Claude | (build pending) | Yogi-driven | Proposes updates from raw inputs via Supabase MCP |

---

## CURRENT TECH STATE

### Production deployment
- Repo: https://github.com/codiinc/hawook
- Production branch: `main`
- Live URL: `hawook.vercel.app` (custom domain `app.hawook.com` pending DNS)
- Latest commit: `2aab796` (Session 2 + lazy-init fix)
- Vercel project linked, auto-deploys on push to main

### Vercel environment variables set
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_HELLO` = hello@hawook.com
- `RESEND_FROM_SYSTEM` = system@hawook.com
- `RESEND_FROM_YOGI` = yogi@hawook.com
- `RESEND_FROM_CODI` = codi@hawook.com
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `CRON_SECRET`
- `BEEHIIV_API_KEY`
- `BEEHIIV_PUBLICATION_ID`

### Supabase tables (activated through Tier 2 Session 1)

Active:
- `projects` (with new columns: `hawook_score`, `hawook_score_dimensions`, `hawook_badge`, `hawook_take`, `update_notes`, `last_updated`, `page_status`)
- `projects_public` (view exposing only safe columns where `page_status='published'`)
- `public.users` (with on_auth_user_created trigger)
- `project_follows`
- `leads` (29 columns including 5 added in Session 2: persona, message, source, current_project_context_id, subscribe_newsletter)
- `update_proposals` (added Session 1)
- `project_updates` (added Session 1)
- `project_documents` (added Session 1)
- `audit_log` (added Session 1)

Schema-only (no UI yet):
- `chat_sessions` (Concierge — Phase 3)
- `viewing_requests`
- `buyer_profiles`
- `subscriptions`
- `lead_activity_log`
- `developers`, `areas`, `countries`, `blog_articles`, `handoffs`, `developer_contacts`, `lead_project_matches`

### RLS status
- `projects`: SELECT policy for published rows only via `projects_public` view; anon SELECT revoked on the underlying table
- `projects_public` view: SELECT granted to anon + authenticated
- `leads`, `lead_project_matches`, `developer_contacts`, `handoffs`: RLS enabled, no anon policies (deny-all; service role only)
- `project_updates`, `project_documents`, `audit_log`, `update_proposals`: admin-only via service role; some have public-read policies for non-gated rows
- `public.users`, `project_follows`: standard authenticated user policies

### Admin access pattern (canonical)
Admin UI uses service-role client (`lib/supabase/admin.ts`) for all reads and writes, bypassing RLS. Admin email whitelist in `lib/admin.ts`. Approver whitelist in `lib/approvers.ts` (currently just codi@chokdee.co).

### Live integrations
- **Supabase Auth:** email/password, magic-link not configured
- **Cloudinary:** signed uploads via `/api/cloudinary/upload` (auth-gated since Tier 1 Task 2)
- **Resend:** configured, domain added, DNS records being added by Yogi (verification pending)
- **GA4:** "Hawook App" property created, measurement ID in env, gtag wired (Session 1 Task 5)
- **Beehiiv:** API credentials in env, lead-form newsletter opt-in wired (Session 2)

---

## WORK COMPLETED

### Tier 1 — Security & pre-launch hardening (DONE)

| Task | Outcome |
|---|---|
| Task 1 — RLS on 5 critical tables | ✅ projects, leads, lead_project_matches, developer_contacts, handoffs all RLS-enabled. Admin via service role bypass (pattern locked) |
| Task 2 — Auth guard on Cloudinary upload | ✅ Returns 401 for anonymous, 403 for non-admin authenticated |
| Task 3 — next.config.mjs image domains | ✅ res.cloudinary.com added |
| Task 4 — public.users trigger | ✅ on_auth_user_created creates public.users row on signup |
| Task 5 — Replace placeholders | ✅ WhatsApp = +66 80 510 0129, Tally removed |
| Task 6 — Hawook Score columns | ✅ hawook_score, hawook_score_dimensions, hawook_badge, hawook_take added to projects |
| Tier 1.1 patch — column leak via projects_public view | ✅ View created, app code migrated to view, anon SELECT revoked on projects table |

### Tier 2 Phase 1 Session 1 — Foundations (DONE)

| Task | Outcome |
|---|---|
| Task 1 — DB additions | ✅ update_proposals, project_updates, project_documents, audit_log tables + lib/approvers.ts |
| Task 2 — Resend integration | ✅ SDK installed, lib/email.ts utility with 4 sender identities, lazy-init for build safety |
| Task 3 — Email templates | ✅ All 14 templates in lib/email-templates/ as TypeScript functions, verbatim text |
| Task 5 — GA4 wiring | ✅ gtag.js + Consent Mode v2 deny-default + lib/analytics.ts. Events wired: project_followed, gated_content_unlocked, user_signup, page_view (auto) |

### Tier 2 Phase 1 Session 2 — Public lead capture + badges (DONE)

| Task | Outcome |
|---|---|
| Task 4 — Native lead capture form | ✅ Form on project detail pages, API route, honeypot, column-mapped insert, soft-gate visual, Beehiiv opt-in, email triggers wired (#5 to Yogi, #7 to lead) |
| Task 7 — Hawook Score badges | ✅ HawookBadge + HawookTake + MarkdownContent components, badges on detail/card/homepage/listing pages, projects_public view confirmed excludes hawook_score |
| Bug fix | ✅ Resend client lazy-init prevents build-time throw |
| Schema correction | ✅ budget_bracket and timeline check constraints updated from dead quiz-flow values to brief's form labels |

### Notable decisions locked during execution

- **Service-role bypass is canonical for admin access** — not role-column RLS. Email whitelist at application layer.
- **`hawook_take` vs `hawook_verdict` clarified** — `hawook_take` is the prose paragraph ("Hawook's Take"), `hawook_verdict` is the structured BUY IF | SKIP IF | WATCH FOR cards. Both public, both already rendered.
- **Budget bracket format** = human-readable form labels ("Under 5M THB", "5–10M THB", etc.). Stored as-is in `budget_bracket`.
- **Phone vs WhatsApp** — write WhatsApp to existing `phone` column for pragmatic v1. Split later if needed.
- **`page_status` is the publish toggle** (`draft` / `published` / `archived`). `status` is content state (`Active` / `Coming Soon` / `Sold Out`). Two separate concerns.

---

## WORK REMAINING IN TIER 2 PHASE 1

| Session | Tasks | Theme |
|---|---|---|
| Session 3 | Tasks 6, 10, 11 | Admin extensions: page status toggle, project detail admin view (8 tabs), documents section in media admin |
| Session 4 | Tasks 8, 9, 13 | Content ops core: approval queue, audit log page, approval flow execution code |
| Session 5 | Tasks 12, 14 | Cron jobs (3) + full Phase 1 smoke test |

Brief: `docs/HAWOOK_TIER2_PHASE1_COWORK_BRIEF.md`. All 14 task definitions in there.

---

## WORK AFTER TIER 2 PHASE 1

### Tier 2 Phase 2 — Content Ops + Yogi's Claude (brief not yet written)
Yogi's Claude Desktop + Supabase MCP setup. Voice & Knowledge Base injected into his session. Proposes structured updates from raw inputs (developer WhatsApp, PDFs, blog articles) via the approval queue built in Session 4.

### Tier 2 Phase 3 — AI Concierge (brief not yet written)
Public-facing chat on project pages. Spec in `docs/HAWOOK_AI_CONCIERGE_SPEC.md`. Estimated 4-week build (Phases A–F). Cost ~$85/mo at current traffic.

### Tier 3 — User notification system
Same-day major event notifications, weekly digest cron, newsletter integration via Beehiiv API.

### Tier 4 — Refinements
Auto-approval rules, bulk actions, multi-VA support, intent scoring algorithm, smart routing.

### Future docs to write when needed
- Developer Relations Framework (when formalizing the 5–7 Rawai agreements)
- Partner Agent Framework (when first partner agent signed)
- Ad & Growth Playbook (when ad spend exceeds $500/mo)
- Editorial Spec & Persona Briefs (when content velocity >2 projects/week)
- Brand & Visual Identity

---

## PENDING EXTERNAL DEPENDENCIES

| Dependency | Owner | Status |
|---|---|---|
| `app.hawook.com` CNAME at registrar | Yogi | Requested, pending |
| Resend SPF/DKIM/MX/DMARC records | Yogi | Requested, pending |
| `hello@hawook.com` mailbox + forwarding to Yogi | Yogi | Requested, pending |
| `system@hawook.com` mailbox + forwarding to Codi | Yogi | Requested, pending |
| Verify all Resend records green | Codi | Blocked on Yogi |

When all five resolve, the lead-capture email triggers (templates #5 and #7) become fully verified. Welcome email (#6) trigger also completes. No code change needed at that point.

---

## CURRENT KNOWN ISSUES & FOLLOW-UPS

Items flagged during execution, deferred not forgotten:

1. **Soft-gate UI could be richer.** Current implementation: blurred skeleton + lock overlay. Future: improve visual signal of what's behind the gate (preview snippets, specific value props per content type). Cosmetic — defer to design pass.

2. **`anon` retains INSERT/UPDATE/DELETE table grants on `projects`.** RLS blocks them so harmless, but cosmetically untidy. Address in "Security hardening housekeeping" task in Session 3 or later.

3. **Mutable `search_path` on trigger functions.** Linter warning, easy fix (`ALTER FUNCTION ... SET search_path = public, pg_temp`). Same housekeeping task.

4. **`handle_new_user` callable as RPC by anon/authenticated.** Revoke EXECUTE. Same housekeeping task.

5. **Leaked-password protection disabled in Supabase Auth.** Toggle on in dashboard. 30-second fix anytime.

6. **Intent scoring not implemented.** `leads.intent_score` column exists but no algorithm writes to it. Manual Yogi setting for now. Algorithm is Tier 3 / v1.5.

7. **Markdown rendering uses default react-markdown styling.** Will need design-token-matched component overrides as content density grows. Currently functional.

---

## ALL SPEC DOCS IN /docs/

- `HAWOOK_MASTER_DOC_v1.2.md` — orientation, business model, principles, tech stack
- `HAWOOK_VOICE_KNOWLEDGE_BASE.md` — tone, glossary, common Q&A, area knowledge, honesty boundaries
- `HAWOOK_LEAD_PLAYBOOK_v1.2.md` — 11 stages, qualifying, cadence, message frameworks
- `HAWOOK_CONTENT_OPS_SPEC.md` — Yogi's Claude + MCP + approval workflow
- `HAWOOK_AI_CONCIERGE_SPEC.md` — public-facing chat agent spec
- `HAWOOK_EMAIL_TEMPLATES.md` — 14 plain-text templates verbatim
- `HAWOOK_TIER2_PHASE1_COWORK_BRIEF.md` — 14-task build brief
- `HAWOOK_PROJECT_STATUS.md` — this file

---

## HOW TO PICK UP IF CHAT IS LOST

If this chat closes or a new conversation starts:

1. Read this file first.
2. Read `docs/HAWOOK_MASTER_DOC_v1.2.md` for full business context.
3. Read `docs/HAWOOK_TIER2_PHASE1_COWORK_BRIEF.md` if next action is build work.
4. Check current commit hash in repo against the "Latest commit" line above — confirms where execution actually is.
5. Confirm Tier 2 Session 3 is next (assuming Session 2 was the last completed).
6. Open relevant spec doc for whatever specific work is being picked up.

---

**End of Project Status v1.**

*Updated by Founder or by Claude after each significant milestone. If significantly stale (>2 weeks since "Last updated"), regenerate before relying on it.*
