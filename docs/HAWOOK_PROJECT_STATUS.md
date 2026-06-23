# HAWOOK — PROJECT STATUS

**Version:** v1 — current state snapshot
**Last updated:** 23 June 2026 (Bang Tao area page + /areas index page live; Nav updated to /areas)
**Purpose:** If this chat is lost or a new conversation starts, this document brings any AI assistant (or human) up to current state in 5 minutes of reading.

---

## ONE-LINE STATUS

**Tier 2 Phase 1 COMPLETE + Polish Session 1 COMPLETE.** All platform foundations and polish tasks shipped. One external blocker: Resend DNS verification (Yogi). Favicon PNGs (Task 14) need external image generation. Phase 2 (Yogi's Claude + Supabase MCP) is next. Phase 2A first new_record proposal approved: The Title Cielo Rawai (18 June 2026).

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
- Latest commit: (see git log — Session 5 complete — Tasks 12, 14. Phase 1 DONE.)
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
- `PROPOSAL_WEBHOOK_SECRET` = `hwk-wh-prop-phase1` ✅ (added pre-Session 5)

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

### Tier 2 Phase 1 Session 3 — Admin extensions (DONE)

| Task | Outcome |
|---|---|
| Task 6 — Page status toggle | ✅ `StatusToggle` client component + `PATCH /api/admin/projects/[slug]/status` route. Confirmation modals per status. Audit log writes on every change. Admin list page updated. |
| Task 10 — Project detail admin view | ✅ `/admin/projects/[slug]/` nested layout with 8-tab nav (Overview, Public Content, Structured Data, Hawook Score, Updates, Media, Documents, Followers). Server-side auth guard. Tab-aware `usePathname` active states. |
| Task 10 tabs built | ✅ Overview (stats + recent audit), Public Content form, Structured Data form, Hawook Score form (approver-only, live calc, badge preview), Updates list, Media (existing, migrated to sub-layout), Followers (anonymized). |
| Task 11 — Documents tab | ✅ Documents tab inside project admin: 8 document types, PDF-only Cloudinary upload with XHR progress, gated/public toggle per file, delete confirmation. API routes: POST/DELETE/PATCH. Public project page shows Downloads section (RLS-gated automatically). |
| TS fix | ✅ `summary_internal` cast to `string | null` in updates tab to resolve TS2322. |

### Tier 2 Phase 1 Session 4 — Content ops core (DONE)

| Task | Outcome |
|---|---|
| Task 13 — Approval transaction function | ✅ `execute_proposal_approval` PL/pgSQL function with full rollback, `FOR UPDATE` lock (anti-race), field-existence validation, type-compatibility checking, dynamic SQL casting, soft numeric validation (>20% → force major), `project_updates` insert if `related_update_entry` present, `notify_followers` override via `p_notification_hold`, audit_log write with full diff JSONB. `SECURITY DEFINER + search_path` set. Granted to authenticated + service_role. |
| Task 13 — Major proposal webhook trigger | ✅ `pg_net` extension enabled. `app_config` table for base URL + secret (avoids `ALTER DATABASE` superuser requirement). Trigger fires AFTER INSERT WHEN severity='major'. EXCEPTION handler ensures trigger never blocks insert. |
| Task 13 — Approval library | ✅ `lib/proposals.ts` — `executeApproval`, `rejectProposal`, `deferProposal`. Patches edited fields onto proposal before calling RPC (supports "Approve & edit" flow). |
| Task 8 — API routes | ✅ `GET /api/admin/proposals` (filtered, JS-sorted major→standard→minor), `POST .../[id]/approve`, `.../reject`, `.../defer`. All approver-only routes have server-side `isApprover` recheck. `POST .../approve` also calls `GET /api/webhooks/major-proposal-created` for alert. |
| Task 9 — Audit API | ✅ `GET /api/admin/audit` — paginated 50/page, filterable by action, actor_email, target_table, target_slug, date_from, date_to. |
| Task 8 — Queue UI | ✅ `/admin/queue` — server + client components. Severity filter, status filter, text search. Expandable proposals with field diffs (current vs proposed, amber highlight). Edit mode per proposal. Actions: Approve, Approve & edit, Approve+hold notifications, Reject, Defer. Bulk approve minor with confirmation modal. View-only banner when `canApprove=false`. |
| Task 9 — Audit log UI | ✅ `/admin/audit` — read-only chronological log. Filter bar (action, actor, table, slug, date range). Expandable rows with formatted metadata JSON + link to project admin. Paginated. |
| Admin nav | ✅ Layout updated: Projects · Queue · Audit links. |
| Webhook alert route | ✅ `POST /api/webhooks/major-proposal-created` — Bearer token auth against `PROPOSAL_WEBHOOK_SECRET`. Sends `renderMajorProposalAlert` via `sendEmail` to each approver. `Promise.allSettled` so one failure doesn't abort. |
| Smoke test — 4 proposals | ✅ All passed: proposal 1 (minor, field update), proposal 2 (standard, multi-field + update entry, `notify_followers=true` confirmed), proposal 3 (major, `notify_followers=false` via hold), proposal 4 (bad field → `status='failed'` with exact error in `review_notes`). All 3 audit_log entries written correctly. |

### Tier 2 Phase 1 Session 5 — Cron jobs + smoke test (DONE)

| Task | Outcome |
|---|---|
| Task 12.1 — Daily standard proposals digest | ✅ `GET /api/cron/standard-proposals-digest` — Bearer CRON_SECRET auth, queries pending standard proposals, skips if zero, renders template #2 and sends to all APPROVERS. Logs to audit_log on execution. Schedule: `0 1 * * *` |
| Task 12.2 — Weekly minor proposals digest | ✅ `GET /api/cron/minor-proposals-digest` — same pattern for severity='minor', template #3. Schedule: `0 2 * * 0` (Sunday) |
| Task 12.3 — Stale project alert | ✅ `GET /api/cron/stale-project-check` — queries published projects with last_updated > 30 days, 7-day per-project suppression via audit_log, renders template #4, sends to yogi@hawook.com. Schedule: `0 2 * * *` |
| vercel.json cron config | ✅ All 3 crons added to vercel.json |
| Task 14 — Phase 1 smoke test | ✅ Results documented in `docs/HAWOOK_PHASE1_SMOKE_TEST_RESULTS.md`. All code/DB-verifiable checks pass. Email delivery pending Resend DNS (external). Browser tests pending manual verification. |

### Notable decisions locked during execution

- **Service-role bypass is canonical for admin access** — not role-column RLS. Email whitelist at application layer.
- **`hawook_take` vs `hawook_verdict` clarified** — `hawook_take` is the prose paragraph ("Hawook's Take"), `hawook_verdict` is the structured BUY IF | SKIP IF | WATCH FOR cards. Both public, both already rendered.
- **Budget bracket format** = human-readable form labels ("Under 5M THB", "5–10M THB", etc.). Stored as-is in `budget_bracket`.
- **Phone vs WhatsApp** — write WhatsApp to existing `phone` column for pragmatic v1. Split later if needed.
- **`page_status` is the publish toggle** (`draft` / `published` / `archived`). `status` is content state (`Active` / `Coming Soon` / `Sold Out`). Two separate concerns.
- **Content Ops prompt versioned as v1.1** — DATABASE CONSTRAINT VALUES section added after first real Phase 2A new_record proposal (The Title Cielo Rawai, 18 June 2026) surfaced three constraint mismatches (`data_confidence`, `ownership_type`, `status` all had free-text values that failed DB check constraints). `HAWOOK_CONTENT_OPS_PROMPT_V1.1.md` is now the current working prompt. v1 was not committed to the repo (existed only as a working document). Future iterations: v1.2 (additions/corrections), v2.0 (structural rework). `HAWOOK_CONTENT_OPS_SPEC.md` bumped to v1.1 with the same constraint values section added as section 6.
- **Content Ops prompt versioned as v1.2** — Two-stage workflow added (Stage 1: data extraction only → Stage 2: scoring walkthrough + editorial). Stage 1 never proposes `hawook_score`, `hawook_score_dimensions`, or `hawook_badge`. Stage 2 proposes these as a single `major`-severity `field_update` after score is finalized in conversation with the user. Surfaced by Rhea badge constraint issue (June 2026). `HAWOOK_CONTENT_OPS_PROMPT_V1.2.md` is the current working prompt; v1 and v1.1 retained as historical record. Spec bumped to v1.2 with section 7 (Two-Stage Workflow) and updated section 6 (badge tokens, never-propose fields).
- **Hawook badge value tokens locked** — `'recommended'` (Hawook Recommended badge), `'top_pick'` (Hawook Top Pick badge), `NULL` (no badge — project listed without featured status). Internal language "Hawook Listed" refers to the NULL state but is **not** a public-facing label and must never be used as a column value. Three states only. Score thresholds: ≥9.0 → `top_pick`, 8.0–8.99 → `recommended`, <8.0 → `NULL`.
- **Listability floor locked: 7.5 weighted total** as soft floor. Projects below 7.5 require explicit approver override with documented reason; default is non-listing. Per-dimension hard floors unchanged: Ownership & Legal ≥ 6.0 and Developer Track Record ≥ 5.0 required regardless of weighted total. Documented in `HAWOOK_MASTER_DOC_v1.2.md` Section 2.5.

---

## WORK REMAINING IN TIER 2 PHASE 1

| Session | Tasks | Theme |
|---|---|---|
| ~~Session 3~~ | ~~Tasks 6, 10, 11~~ | ~~Admin extensions: page status toggle, project detail admin view (8 tabs), documents section~~ ✅ DONE |
| ~~Session 4~~ | ~~Tasks 8, 9, 13~~ | ~~Content ops core: approval queue, audit log page, approval flow execution code~~ ✅ DONE |
| ~~Session 5~~ | ~~Tasks 12, 14~~ | ~~Cron jobs (3) + full Phase 1 smoke test~~ ✅ DONE |

**TIER 2 PHASE 1 IS COMPLETE.** All 14 tasks built, code-verified, deployed. Smoke test results: `docs/HAWOOK_PHASE1_SMOKE_TEST_RESULTS.md`.

**POLISH SESSION 1 IS COMPLETE.** All 14 polish tasks shipped (18 June 2026). See below.

---

## WORK AFTER TIER 2 PHASE 1

### Polish Session 1 — Critical fixes + SEO + compliance (DONE)

| Task | Outcome |
|---|---|
| Task 1.1 — /about page | ✅ `app/about/page.tsx` — full editorial content from HAWOOK_ABOUT_PAGE_V1.md. Static, MarkdownContent rendered, canonical + OG metadata. |
| Task 1.2 — /areas/rawai-nai-harn page | ✅ `app/areas/rawai-nai-harn/page.tsx` — editorial content + live project grid (Rawai + Nai Harn, Active status) + WhatsApp CTA with contextual pre-fill. Map deferred to Polish Session 4. |
| Task 2 — Footer | ✅ 4-column footer with FooterWrapper (hidden on /admin/*). |
| Task 3 — Cookie consent | ✅ Consent Mode v2 banner with Accept/Analytics only/Reject. |
| Task 4 — 404 page | ✅ Custom not-found.tsx. |
| Task 5 — Nav area link fix | ✅ /areas → /areas/rawai-nai-harn. |
| Task 6 — Homepage metadata + auth CTA | ✅ Canonical, OG, JSON-LD. Logged-in → "Go to dashboard", logged-out → "Get free access". |
| Task 7 — Lead form GDPR fix | ✅ subscribeNewsletter defaults false; auth pre-fill for name + email. |
| Task 8 — Project detail SEO | ✅ generateMetadata with canonical, OG; RealEstateListing + Breadcrumb + FAQ JSON-LD schemas. |
| Task 9.1 — /privacy page | ✅ `app/privacy/page.tsx` — PDPA-compliant draft from HAWOOK_PRIVACY_POLICY_V1.md. Substitutions applied. Draft disclaimer in italic box. |
| Task 9.2 — /terms page | ✅ `app/terms/page.tsx` — 16-section ToS from HAWOOK_TERMS_OF_SERVICE_V1.md. Substitutions applied. Draft disclaimer in italic box. |
| Task 10 — Sitemap | ✅ Static pages + project URLs, `as const` fix. |
| Task 11 — ROI model empty card fix | ✅ Filters null/empty items before rendering. |
| Task 12 — WhatsApp pre-fill on project pages | ✅ Contextual message with project name. |
| Task 13 — Developer awards list rendering | ✅ Semicolon-split → `<ul>` when multiple items. |
| Task 14 — Favicon PNGs | ⏳ Blocked — image files need external generation. |

### Area pages — DONE (23 June 2026)

| Task | Outcome |
|---|---|
| Build `/areas/bang-tao` | ✅ `app/areas/bang-tao/page.tsx` — editorial content from HAWOOK_AREA_PAGE_BANG_TAO_V1.md + project grid (area=Bang Tao, status=Active) + WhatsApp CTA. Map and sub-area links deferred to Polish Session 4. |
| Build `/areas` index page | ✅ `app/areas/page.tsx` — two area cards with live project counts from `projects_public`, editorial intro, "Other areas" note, WhatsApp CTA. Hard-coded areas for v1. |
| Update Nav "Areas" link | ✅ `components/Nav.tsx` — desktop and mobile both now point to `/areas`. |
| Hero images for area cards | ⏳ Placeholder gradient in both cards. Needs: Nai Harn Beach photo (Rawai & Nai Harn card) and Laguna/Layan beach shot (Bang Tao card). Brand asset task — upload to Cloudinary and wire into `/areas/page.tsx`. |

### Agent Referral Program — Strategic backlog

Brief held in `docs/HAWOOK_AGENT_REFERRAL_PROGRAM_BRIEF.md`. Not active. Invitation-only; Codi initiates all outreach.

**Activation target: ~2-3 weeks (mid-July 2026)** — after catalog reaches 8+ published projects and Polish Session 2 ships.

Pre-activation (now): Codi compiles research list of 5-10 priority partners (no outreach yet). Infrastructure build (~6-8 hrs, Vlad) opens in Weeks 3-4. First partner outreach in Week 5. Commission: 20% → 22% → 25% tiered, capped at 25%. Net 30 USD via bank transfer or Wise.

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

8. **Build verification must use `npm run build`, not `npx tsc --noEmit`.** Vercel runs `next build` which includes ESLint (`next/core-web-vitals` ruleset). `tsc --noEmit` only type-checks; it does not run ESLint. Three lint errors slipped through Sessions 3–4 because only tsc was run locally. **Before any push to main, run `npm run build` in the worktree and confirm it succeeds.** This catches unused-vars, unescaped JSX entities, and any other lint rules that Vercel will enforce.

---

## ALL SPEC DOCS IN /docs/

- `HAWOOK_MASTER_DOC_v1.2.md` — orientation, business model, principles, tech stack
- `HAWOOK_VOICE_KNOWLEDGE_BASE.md` — tone, glossary, common Q&A, area knowledge, honesty boundaries
- `HAWOOK_LEAD_PLAYBOOK_v1.2.md` — 11 stages, qualifying, cadence, message frameworks
- `HAWOOK_CONTENT_OPS_SPEC.md` — Yogi's Claude + MCP + approval workflow (v1.2 — sections 6–7: DB constraints, two-stage workflow, badge tokens, never-propose fields)
- `HAWOOK_CONTENT_OPS_PROMPT_V1.2.md` — **current** system prompt for Yogi's Claude Desktop
- `HAWOOK_CONTENT_OPS_PROMPT_V1.1.md` — historical (v1.1 — DB constraint values added)
- `HAWOOK_CONTENT_OPS_PROMPT_V1.md` — historical baseline (retroactively committed)
- `HAWOOK_AI_CONCIERGE_SPEC.md` — public-facing chat agent spec
- `HAWOOK_AGENT_REFERRAL_PROGRAM_BRIEF.md` — invitation-only agent referral strategy; held for activation ~2-3 weeks after catalog reaches 8+ published projects and Polish Session 2 ships
- `HAWOOK_EMAIL_TEMPLATES.md` — 14 plain-text templates verbatim
- `HAWOOK_TIER2_PHASE1_COWORK_BRIEF.md` — 14-task build brief
- `HAWOOK_PROJECT_STATUS.md` — this file

---

## HOW TO PICK UP IF CHAT IS LOST

If this chat closes or a new conversation starts:

1. Read this file first.
2. Read `docs/HAWOOK_MASTER_DOC_v1.2.md` for full business context.
3. Read `docs/HAWOOK_PHASE1_SMOKE_TEST_RESULTS.md` for Phase 1 test status and pending manual checks.
4. Phase 1 is complete. Next work is Phase 2 (Yogi's Claude + Supabase MCP brief — not yet written).
5. Before Phase 2 kick-off: confirm Resend DNS has propagated and close the email smoke test items in the results doc.
6. Open relevant spec doc for whatever specific work is being picked up.

---

**End of Project Status v1.**

*Updated by Founder or by Claude after each significant milestone. If significantly stale (>2 weeks since "Last updated"), regenerate before relying on it.*
