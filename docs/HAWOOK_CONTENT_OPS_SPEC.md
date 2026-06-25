# HAWOOK — CONTENT OPS & CONCIERGE-DRIVEN ADMIN SPEC

**Version:** 1.2
**Date:** 16 June 2026
**Status:** Build spec — defines what gets built and the rules it operates under
**Owners:** Founder (architecture & approval rules), Yogi (operational owner)
**Companion to:** Hawook Master Doc v1.0, Voice & Knowledge Base v1.0
**Prerequisite for:** Tier 2 Cowork brief covering content ops build

---

## TABLE OF CONTENTS

1. [Purpose & Principles](#1-purpose--principles)
2. [Architecture Overview](#2-architecture-overview)
3. [Operational Patterns — Real Scenarios](#3-operational-patterns--real-scenarios)
4. [MCP Scope — What Claude Can Read and Write](#4-mcp-scope--what-claude-can-read-and-write)
5. [The Proposal Format](#5-the-proposal-format)
6. [Database Constraint Values](#6-database-constraint-values)
7. [Two-Stage Workflow](#7-two-stage-workflow)
8. [Approval Rules](#8-approval-rules)
9. [Admin UI Surface](#9-admin-ui-surface)
10. [Notification Flow After Approval](#10-notification-flow-after-approval)
11. [Hallucination Defenses](#11-hallucination-defenses)
12. [Multi-User Considerations](#12-multi-user-considerations)
13. [Build Sequence](#13-build-sequence)
14. [Open Questions](#14-open-questions)

---

## 1. PURPOSE & PRINCIPLES

Hawook needs a content operations workflow that handles the messy reality of how data actually arrives from developers — WhatsApp messages, PDFs, emails, voice notes, screenshots, social media posts, blog articles. A traditional admin form forces every input into pre-defined fields and discards the noise. Yogi spends time translating, not curating.

The Concierge-Driven Admin Workflow inverts this. Yogi pastes (or uploads) the raw input into his Claude, which has the Hawook Voice & Knowledge Base, the schema, and live MCP read access to Supabase. Claude understands what the input is, proposes structured updates, and queues them for founder approval. Approved updates push to the database via the application code and trigger downstream notifications.

This is not "AI runs the database." This is "AI proposes; humans approve; application code executes." Three principles govern every design choice in this spec:

**Propose-then-apply, never direct execute.** Claude's MCP write scope is limited to a single table — `update_proposals` — where proposals sit in `pending_approval` state. The actual write to `projects`, `areas`, `developers`, or `project_updates` happens via authenticated admin code paths after explicit approval. If Claude hallucinates badly, no live data is corrupted — only a bad proposal is created, which gets rejected.

**Evidence required for every numeric or critical field.** Prices, quotas, dates, fees, areas. Claude must quote the source material verbatim or explicitly state "not stated in source." A proposal without evidence fails validation at the MCP layer.

**One approval queue, one audit log.** All proposals — text content, structured fields, media, status changes — flow through the same queue. Every change to live data is logged with who, what, when, source. No backdoor writes.

---

## 2. ARCHITECTURE OVERVIEW

The system has three components.

### 2.1 Yogi's Claude (input surface)

Claude Desktop running on Yogi's machine. Connected to two MCP servers:

- **Hawook MCP** (custom, business-level operations): exposes high-level functions Claude can call — `read_project(slug)`, `search_projects(query)`, `propose_project_update(...)`, `read_area(slug)`, `read_developer(slug)`. These wrap the underlying Supabase calls so Claude doesn't write raw SQL.
- **Supabase MCP** (read-only fallback): allows Claude to query Supabase directly for context lookups not covered by the custom operations. Read-only scope. Useful when Claude needs to check something the business-level functions don't expose.

Yogi's Claude is loaded at session start with: Voice & Knowledge Base, Master Doc, and a short instruction prompt explaining the proposal workflow. He pastes source material; Claude reads context via MCP; Claude proposes via MCP.

### 2.2 Application code (execution layer)

The Next.js app handles all actual writes to live data. Two paths:

- **Admin UI direct edits** (existing for media; extended in this spec for content): Yogi or Codi makes a direct edit via the admin panel. Writes execute immediately with admin auth. Audit logged.
- **Approval-driven writes** (new): a proposal sits in `update_proposals` table. Admin approves via the queue UI. Application code reads the proposal, validates it, applies the change to the target table, creates a corresponding `project_updates` entry if applicable, marks the proposal as `applied`, and writes to the audit log.

Application code is the only thing with write access to the canonical tables (`projects`, `areas`, `developers`, `project_updates`). Claude never writes there directly.

### 2.3 The lightweight admin UI

Existing admin UI is extended with three new surfaces:

- **Approval queue** (`/admin/queue`) — proposals from Claude awaiting review
- **Audit log** (`/admin/audit`) — read-only history of every change
- **Project detail admin view** (`/admin/projects/[slug]`) — extended with content fields editable in place

Plus extensions to the existing media management to handle documents (sales presentations, brochures, price list PDFs).

---

## 3. OPERATIONAL PATTERNS — REAL SCENARIOS

These are the scenarios the workflow must handle. Each illustrates the full path from raw input to live update.

### 3.1 Scenario A — Developer WhatsApp: price change

*Adora Rawai developer sends Yogi a WhatsApp message: "Hi Yogi, new pricing effective Monday: 1BR studios from 4.635M, 2BR from 7.8M, villa pricing unchanged. Best, Khun Som."*

1. Yogi pastes the message into Claude with no other context.
2. Claude reads the project context via Hawook MCP — finds Adora Rawai, sees current 1BR pricing at 4.5M and 2BR at 7.575M.
3. Claude proposes: update `price_min_thb` from 4,500,000 to 4,635,000 with evidence quoting Khun Som's message; create a `project_updates` entry with `type=pricing`, `severity=major`, summary text drafted in Hawook voice.
4. Proposal lands in queue. Email to Codi (severity=major triggers immediate alert).
5. Codi reviews in admin UI. Approves. Optionally edits the summary text first.
6. Application code applies the price update to `projects` table, creates the `project_updates` entry, marks the proposal `applied`.
7. Notification cron runs: same-day alert to qualified leads following Adora; weekly digest entry queued for others.

### 3.2 Scenario B — Construction photos uploaded

*Developer sends construction photos. Yogi opens the admin UI directly, navigates to Adora Rawai → Media, uploads the photos to the gallery. Done.*

Then optionally: Yogi mentions to Claude that he uploaded construction photos. Claude proposes a `project_updates` entry with `type=construction`, `severity=standard`, summary drafted ("Foundation complete; structure work begun on floors 1–3 as of mid-June").

This separation is intentional: **media goes through the UI; structured content updates go through Claude.** Claude doesn't handle binary uploads.

### 3.3 Scenario C — Foreign quota change

*Developer messages: "Just FYI we now have 21 foreign quota units available on Adora, down from 31 last month."*

1. Yogi pastes into Claude.
2. Claude updates `foreign_quota_available` from 31 to 21. Severity = major (quota changes are buyer-critical).
3. Claude also drafts a Hawook's Take revision noting "foreign quota is filling — at 21 units remaining, worth moving sooner if Adora is your shortlist." (Proposed text, not auto-applied.)
4. Proposal queue: two related changes from one source — quota update + Hawook's Take revision. Reviewed together.
5. Codi approves both. Live.

### 3.4 Scenario D — Blog article published externally

*A partner site publishes a Phuket market commentary article. Yogi pastes the URL/content into Claude.*

1. Claude analyzes: is there structured data here, or is this context?
2. If structured data (e.g., article mentions "Phuket condo prices up 8% YoY in southern districts"): Claude proposes adding context note to relevant area pages with source attribution. Severity = minor.
3. If pure context: Claude proposes addition to the Voice & Knowledge Base feedback log for human review — not a database update.
4. Either way, source URL is preserved in the proposal for future reference.

### 3.5 Scenario E — Developer email: SPA template updated

*Developer emails: new SPA template with revised payment plan. PDF attached.*

1. Yogi uploads the PDF to the admin UI under Adora Rawai → Documents (new section, per this spec). Document is tagged as `payment_plan_v2.pdf`, dated.
2. Yogi tells Claude: "Adora sent a new payment plan. Old was 20% on SPA / 10% on foundation / 10% structure / 10% topping out / 50% handover. New is 30% on SPA / 10% foundation / 10% structure / 50% handover."
3. Claude updates structured `payment_plan` JSONB field with evidence. Severity = standard.
4. Proposal queue. Codi reviews against the document and approves.

### 3.6 Scenario F — Stale data trigger

*The system cron has noticed that Adora Rawai hasn't been updated in 32 days.*

1. Cron creates a task in Yogi's daily queue: "Check Adora Rawai — last update 32 days ago. Suggest reaching out to developer for current pricing, quota, construction status."
2. Yogi messages the developer.
3. Developer responds; Yogi pastes into Claude.
4. Updates flow as in Scenario A.

The cron is the safety net against silent staleness.

### 3.7 Scenario G — Conflict: source contradicts existing data

*Developer says "we're at 31 foreign quota units" but our database shows 35 from two weeks ago, and we have no record of any sales in the gap.*

1. Claude flags the discrepancy in the proposal: "Proposed change to foreign_quota_available from 35 to 31. Note: previous value from 2026-06-01; no project_updates explaining the change. Recommend confirming with developer before applying."
2. Proposal lands in queue with a discrepancy flag.
3. Codi sees the flag, asks Yogi to confirm with developer, then approves once verified.

Claude never silently overwrites data it can't reconcile.

---

## 4. MCP SCOPE — WHAT CLAUDE CAN READ AND WRITE

### 4.1 Hawook MCP — business operations (preferred)

Custom MCP server exposing high-level functions. This is what Claude uses 95% of the time.

**Read operations:**

- `read_project(slug_or_id)` — full project record including internal fields (Hawook Score, internal notes)
- `search_projects(filters)` — by area, price range, developer, status, badge
- `read_area(slug)` — full area record
- `read_developer(slug)` — full developer record
- `read_project_updates(project_slug, since_date?)` — recent updates for a project
- `read_recent_proposals(status?, limit?)` — pending or recently applied proposals (for context — has someone else already proposed this?)
- `read_followers_count(project_slug)` — how many users follow this project (for context on severity weight)

**Write operations (proposal layer only):**

- `propose_project_update(slug, fields_changed[], evidence, severity, related_update_draft?)` — creates a row in `update_proposals` table with `status='pending_approval'`. Returns the proposal ID.
- `propose_area_update(slug, fields_changed[], evidence)` — same shape for areas.
- `propose_developer_update(slug, fields_changed[], evidence)` — same for developers.
- `propose_new_project_update_entry(slug, type, severity, summary_public, summary_internal, source, notify_followers)` — proposes a standalone project_updates entry without a field change (e.g., a news commentary or construction milestone).

**Cannot do:**

- No direct writes to `projects`, `areas`, `developers`, `project_updates` final tables.
- No writes to `leads`, `lead_project_matches`, `viewing_requests`, `chat_sessions`, `handoffs`, `developer_contacts`, `users` — CRM and PII tables are off-limits to content ops.
- No DELETE operations on anything.
- No `users.role` modifications.

### 4.2 Supabase MCP — read-only fallback

Standard Supabase read-only MCP, scoped to public schema, blocked from the CRM/PII tables. Used for ad-hoc context queries Claude needs that aren't covered by the business operations. Should be used rarely.

### 4.3 MCP authentication

Both MCPs use a single scoped service token, stored in Yogi's local Claude Desktop config. The token is bound to:

- Read access on a defined whitelist of tables (per RLS policies)
- Write access only on `update_proposals` table
- No DELETE on anything
- All writes logged with the token identifier (so we know "this came from Yogi's Claude")

If Yogi leaves or his machine is compromised, the token is rotated centrally without affecting any other system.

---

## 5. THE PROPOSAL FORMAT

Every proposal Claude creates conforms to this structure. The `update_proposals` table stores them.

### 5.1 Schema

```sql
CREATE TABLE update_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposed_at TIMESTAMPTZ DEFAULT NOW(),
  proposed_by TEXT, -- 'yogi' | 'codi' | future VA names
  ai_session_context TEXT, -- short note from Claude about what session/context this came from
  
  target_table TEXT NOT NULL, -- 'projects' | 'areas' | 'developers' | 'project_updates'
  target_record_id UUID, -- existing record being updated, or NULL if new
  target_slug TEXT, -- human-readable identifier
  
  update_type TEXT NOT NULL, -- 'field_update' | 'new_record' | 'new_update_entry' | 'media_link'
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'standard', 'major')),
  
  fields_changed JSONB, -- array of {field, current_value, proposed_value, evidence, ai_confidence}
  related_update_entry JSONB, -- if proposal includes a project_updates entry, the draft for it
  
  source_type TEXT, -- 'whatsapp_message' | 'pdf' | 'screenshot' | 'email' | 'voice_transcript' | 'blog_article' | 'manual_note'
  source_raw TEXT, -- the pasted/uploaded content, truncated to 10K chars
  source_metadata JSONB, -- received_from, received_at, etc.
  
  discrepancy_flag BOOLEAN DEFAULT FALSE, -- TRUE if Claude detected something that conflicts with current data
  discrepancy_note TEXT, -- explanation of the flag
  
  status TEXT NOT NULL DEFAULT 'pending_approval'
    CHECK (status IN ('pending_approval', 'approved', 'rejected', 'applied', 'failed')),
  
  reviewed_by UUID, -- references users.id
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT, -- optional notes from approver
  applied_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposals_status ON update_proposals(status);
CREATE INDEX idx_proposals_target_slug ON update_proposals(target_slug);
CREATE INDEX idx_proposals_severity ON update_proposals(severity);
```

### 5.2 fields_changed structure

```json
[
  {
    "field": "price_min_thb",
    "current_value": 4500000,
    "proposed_value": 4635000,
    "evidence": "From WhatsApp from Khun Som, 2026-06-16: 'New pricing effective Monday: 1BR studios from 4.635M'",
    "ai_confidence": "high"
  },
  {
    "field": "price_max_thb",
    "current_value": 7575000,
    "proposed_value": 7800000,
    "evidence": "Same source: '2BR from 7.8M'",
    "ai_confidence": "high"
  }
]
```

`ai_confidence`: `high` (direct quote, unambiguous), `medium` (interpreted from context), `low` (inferred, flag for review).

### 5.3 related_update_entry structure

```json
{
  "type": "pricing",
  "severity": "major",
  "summary_public": "Pricing updated effective Monday. 1-bedroom from ฿4.635M (up 3%), 2-bedroom from ฿7.8M. Villa pricing unchanged.",
  "summary_internal": "Developer-confirmed via WhatsApp, no public announcement yet. Foreign quota status unchanged. Recommend revising Hawook's Take to note pricing movement.",
  "notify_followers": true
}
```

---

## 6. DATABASE CONSTRAINT VALUES

Several columns have check constraints. When proposing values for these fields, use **only** the allowed values listed below. Do not invent descriptive variants or paraphrase — the database will reject them and the proposal will fail at approval time.

This was confirmed in production: the first new_record proposal (The Title Cielo Rawai, June 2026) failed with three constraint violations because AI extraction produced free-text values not in the allowed sets. The constraints below are enforced by the database; they are not suggestions.

### 6.1 projects.status

Allowed: `'Active'` | `'Sold out'` | `'Coming soon'` | `'On hold'`

| Value | Meaning |
|---|---|
| Active | Project is currently selling — includes pre-sale and under-construction phases where units are available |
| Sold out | All units sold, or foreign quota exhausted for foreign-buyer-focused projects |
| Coming soon | Announced but not yet selling |
| On hold | Paused or delayed indefinitely |

Do **not** use: `'pre-sale'`, `'under construction'`, `'launching'`, or any other variant.

### 6.2 projects.page_status

Allowed: `'draft'` | `'published'` | `'archived'`

| Value | Meaning |
|---|---|
| draft | Not visible on the public site (default for new projects) |
| published | Live on the public site |
| archived | Removed from public site but retained in the database |

For all `new_record` proposals: **always set `page_status='draft'`.** Publishing is a human approver decision after images, score, and Hawook's Take are in place.

### 6.3 projects.ownership_type

Allowed: `'Freehold'` | `'Leasehold'` | `'Thai quota only'` | `'Mixed'` | `'Both'`

| Value | Meaning |
|---|---|
| Freehold | Only freehold units available (rare in Thailand for foreign buyers) |
| Leasehold | Only leasehold structures available (typically 30+30+30 years) |
| Thai quota only | Only the 51% Thai-owned quota; foreign buyers cannot access freehold |
| Mixed | Combination of ownership options (e.g. freehold + leasehold + Thai quota all available) |
| Both | Project offers **both** freehold (within foreign quota) **and** leasehold options |

Do **not** use: descriptive strings like `'Thai Freehold / Leasehold / Foreign Freehold'` or `'foreign quota 49%'`.

### 6.4 projects.data_confidence

Allowed: `'Complete'` | `'Flagged'` | `'Incomplete'`

| Value | Meaning |
|---|---|
| Complete | All critical fields populated with high or medium confidence from source material |
| Flagged | Critical fields present but at least one has `discrepancy_flag=true` |
| Incomplete | Critical fields missing, or developer confirmation pending |

For `new_record` proposals: use `'Incomplete'` if any of `price_max`, `foreign_quota_units_remaining`, `payment_plan`, `completion_date` are not yet developer-confirmed. Use `'Complete'` only when everything is confirmed.

Do **not** use: free-text like `'medium — core facts provided'` or `'high confidence'`.

### 6.5 buyer_qa visibility field

Allowed: `'public'` | `'private'`

| Value | Meaning |
|---|---|
| public | Shown to all visitors (logged-out and logged-in) |
| private | Shown only to authenticated users (the gated Q&A section) |

Default to `public` for general questions; `private` for pricing-specific or transaction-stage questions.

### 6.6 projects.hawook_badge

Allowed: `'recommended'` | `'top_pick'` | `NULL`

| Value | Meaning |
|---|---|
| `'recommended'` | Project meets the Hawook bar — displays the "Hawook Recommended" badge publicly |
| `'top_pick'` | Best-in-class within its area and price tier — displays "Hawook Top Pick" badge publicly |
| `NULL` | Project is listed on Hawook without a featured badge ("Hawook Listed" in internal language, but this is **not** a public-facing label or badge value) |

**Score-to-badge thresholds:**

| Hawook Score | Badge |
|---|---|
| ≥ 9.0 | `'top_pick'` |
| 8.0 – 8.99 | `'recommended'` |
| < 8.0 | `NULL` |

**Stage 2 gating:** `hawook_badge` must **never** be proposed in Stage 1 (data extraction). It is only proposed as part of a Stage 2 scoring walkthrough — as a `field_update` proposal with `severity='major'` — after the Hawook Score has been finalized in conversation with the user. See Section 7 (Two-Stage Workflow).

Do **not** use: `'listed'`, `'hawook_listed'`, `'none'`, `'standard'`, `'featured'`, or any other variant. Three states only: `'recommended'`, `'top_pick'`, `NULL`.

### 6.7 Fields you must never propose

The following fields must never appear in a proposal's `fields_changed` array under any circumstances.

| Field | Why reserved |
|---|---|
| `hawook_score` | Set only after explicit score walkthrough in Stage 2 |
| `hawook_score_dimensions` | Set only after explicit score walkthrough in Stage 2 |
| `hawook_badge` | Derived from score; Stage 2 only — see 6.6 |
| `last_updated` | Managed automatically by the application on every write |
| `created_at` | Set at row creation; immutable |
| `updated_at` | Managed automatically by the application on every write |
| `data_confidence` (in `field_update` proposals) | Only valid in `new_record` proposals to set initial confidence; do not propose changes to it via `field_update` — let the approver reset it manually if needed |

If source material contains information that feels relevant to reserved fields (e.g. developer track record notes that would inform a score), capture it in `source_raw` and note it in `ai_session_context`. Do not propose values for reserved fields.

### 6.8 Validation rule

Before submitting any proposal, verify:

- All `status` / `page_status` / `ownership_type` / `data_confidence` / `hawook_badge` values exactly match the allowed lists above (case-sensitive).
- If source material describes something that doesn't map cleanly, choose the closest valid value and note the imprecision in the field's `evidence` string.
- If no valid value fits, **stop and ask** before proposing.
- None of the fields in 6.7 are included in a Stage 1 proposal.

Constraint violations cause the entire proposal approval to fail at the database layer. There is no partial-success path — the whole transaction rolls back.

### 6.9 Column type discipline

Database columns have specific types. The `proposed_value` in every `fields_changed` entry must match the column's type exactly. Descriptive context belongs in adjacent text fields (e.g., `description_public`, `design_commentary`, `facilities`) — never embedded inside numeric, boolean, date, or enum-constrained columns.

Type mismatches are the most common cause of proposal approval failures to date (Adora Rawai, June 2026: `buildings` and `floors` both failed because descriptive strings were proposed instead of integer literals).

**INTEGER columns** — propose a plain integer number only. No strings, no units, no qualifiers.

Confirmed INTEGER columns on `projects`:

| Column | Correct | Wrong |
|---|---|---|
| `buildings` | `9` | `"9 (8 residential A-D and F-I + 1 facilities building E)"` |
| `floors` | `4` | `"4 (residential blocks); 3 (Building E facilities core)"` |
| `total_units` | `210` | `"210 units"` |
| `foreign_quota_units_remaining` | `47` | `"approximately 47"` |

If the source is ambiguous ("around 9 buildings"), propose the best-estimate integer with `ai_confidence='low'` and explain the imprecision in the `evidence` string. Put descriptive context in `design_commentary`, `description_public`, or `facilities`.

**NUMERIC / DECIMAL columns** — plain numbers only. Strip currency symbols, percentage signs, and unit suffixes.

| Correct | Wrong |
|---|---|
| `3990000` | `"3.99M THB"` |
| `3.2` | `"3.2%"` |
| `158000` | `"158k baht"` |

**DATE columns** — ISO 8601 format only (`YYYY-MM-DD`). If source gives a quarter or month without a specific day, pick a reasonable convention (end of month / end of quarter) and note the imprecision in `evidence`.

| Correct | Wrong |
|---|---|
| `"2027-11-30"` | `"Q4 2027"` |
| `"2027-03-31"` | `"March 2027"` |

**BOOLEAN columns** — unquoted JSON literals `true` or `false`. Never `"yes"`, `"no"`, or `"true"`.

**ENUM / CHECK-CONSTRAINED columns** — use only the exact tokens listed in sections 6.1–6.6.

**ARRAY columns** — use JSONB array syntax: `["value1", "value2"]`. Never a comma-separated string.

**Pre-submission type check (mandatory):** Before inserting any proposal, walk each field in `fields_changed` and verify: integer → plain integer; numeric → plain number; date → ISO 8601; boolean → `true`/`false`; enum → allowed token; array → array syntax.

When uncertain about a column's type, query before proposing:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = '<field>';
```

30 seconds of type-checking prevents a failed proposal that requires manual intervention to fix.

---

## 7. TWO-STAGE WORKFLOW

Processing a new project from raw source material is a two-stage operation. The stages are always sequential — Stage 2 never begins until Stage 1 is approved and applied.

### 7.1 Stage 1 — Data extraction

**What it covers:** All structured factual data derivable from source material.

Typical fields: `project_name`, `slug`, `area`, `developer_name`, `status`, `page_status`, `ownership_type`, `data_confidence`, `price_min`, `price_max`, `price_per_sqm_min`, `price_per_sqm_max`, `total_units`, `foreign_quota_units_total`, `foreign_quota_units_remaining`, `unit_types`, `unit_sizes`, `completion_date`, `completion_quarter`, `construction_status`, `payment_plan`, `cam_fee_thb_sqm`, `sinking_fund_thb_sqm`, `foreign_quota_available`, `rental_program_available`, `nearby_landmarks`, `location_description`, `facilities`, `unique_features`, `buyer_qa`, `description_public`.

**What it never covers:** `hawook_score`, `hawook_score_dimensions`, `hawook_badge`, `last_updated`, `created_at`, `updated_at` (see Section 6.7). `data_confidence` is valid in `new_record` proposals only.

**Output:** One `new_record` proposal (for a brand-new project) or one or more `field_update` proposals (for an existing project). Severity is typically `standard` for data population; `major` if price, quota, or status fields change significantly.

**After Stage 1 is approved:** The project row exists in the database with factual data populated. It is in `page_status='draft'` and has no badge or editorial content. It is not visible to the public.

### 7.2 Stage 2 — Scoring and editorial

**What it covers:** The Hawook Score walkthrough and all editorial fields.

This stage is a structured conversation between Claude and the user (Codi or designated approver). Claude does not propose a score unilaterally. Instead:

1. Claude reads the Stage 1-applied project row via MCP.
2. Claude walks through each of the six Hawook Score dimensions with the user, proposing sub-scores with evidence from source material and site knowledge.
3. User agrees or adjusts each sub-score. Total score is calculated.
4. Score determines badge tier (see Section 6.6).
5. Claude drafts `hawook_take`, `hawook_verdict`, and `hawook_intro` for user review (these may be proposed in a separate `field_update` or applied via direct admin edit — they are not gated to Stage 2 like the score fields, but benefit from being drafted after the score is clear).
6. User reviews and approves the editorial drafts.
7. Claude submits a `field_update` proposal with `severity='major'` covering: `hawook_score`, `hawook_score_dimensions`, `hawook_badge`. Editorial fields (`hawook_take`, `hawook_verdict`, `hawook_intro`) may be included in the same proposal or submitted separately.
8. Approver reviews and applies in the queue.

**After Stage 2 is approved:** The project has a score, badge, and editorial content. It is ready for image review and final publishing decision.

### 7.3 Why the split

Mixing data extraction and editorial scoring in a single proposal creates two risks:

1. **Hallucinated editorial content.** Score, badge, and editorial fields require judgment that shouldn't come from the same source-material extraction pass as factual fields. They need a deliberate conversation, not an automated derivation.
2. **Approval coupling.** If factual data and a score are in one proposal, the approver can't apply the data fix without also accepting a score they may not have reviewed carefully. The two-stage split keeps approvals clean.

---

## 8. APPROVAL RULES

### 8.1 Who approves

For v1.0: only Founder. The admin email whitelist in `lib/admin.ts` defines admin access; approval rights are restricted to a subset of that whitelist (defined in a new `lib/approvers.ts` — for now, just Codi's email).

For v1.5+: senior team members can be granted approval rights for `minor` and `standard` severity. `major` always requires Founder.

### 8.2 What auto-approves

**Nothing in v1.0.** Every proposal goes to the queue. As we build confidence, the following may graduate to auto-approval (toggled per category in admin settings):

- Construction milestone updates with `severity=standard` and `ai_confidence=high`
- New amenity tags
- Pure additive content (new FAQ entries, area context additions)

Hawook Score changes and price changes never auto-approve, period.

### 8.3 Severity rules

The severity field controls notification behavior and approval urgency:

**Minor.** Cosmetic content updates, FAQ additions, minor descriptive changes, news commentary without data impact. Queue review during normal weekly admin time. No immediate email to Codi. Bundles into the weekly digest for users following the project.

**Standard.** Most factual updates — construction milestones, document additions, payment plan revisions, non-price specification updates, Hawook's Take revisions. Queue review within 48 hours. Daily email digest to Codi if any standard proposals are pending. Bundles into the weekly digest for users.

**Major.** Price changes, foreign quota changes, Hawook Score changes, project completion / handover, project going off-market, ownership-structure changes. Immediate email to Codi. Same-day notification to qualified+ leads following the project once approved.

Claude proposes the severity; Codi can adjust during review. The severity assigned at approval time is what governs notification flow.

### 8.4 Review actions

For each proposal in the queue, the approver can:

- **Approve** — apply as-is
- **Approve & edit** — open an inline editor, modify the proposed values or summary text, then apply
- **Approve but hold notifications** — apply the data change, but don't trigger user notifications (useful when the change is correct but premature for buyer comms)
- **Reject** — mark rejected with optional note; no data change. Claude can see rejections in future context.
- **Defer** — keep in queue, optionally add a tag like "verify with developer first"

Bulk actions: approve all minor proposals at once (if reviewer is confident).

### 8.5 Time-to-review SLA

- Major proposals: target review within 4 hours during Phuket business hours, 24 hours outer bound. Email pings on creation, escalating ping after 4 hours.
- Standard proposals: 48 hours.
- Minor proposals: weekly.

Proposals not reviewed within their SLA escalate visibly in the queue (badge or sort priority).

---

## 9. ADMIN UI SURFACE

The lightweight admin UI extends what's already built. New surfaces in **bold**.

### 7.1 Existing (keep, extend)

- `/admin` — projects dashboard (existing). **Extend:** add a "Pending Proposals: N" badge linking to the queue. Show last-updated timestamp per project. Show staleness indicator for projects without an update in 30+ days.
- `/admin/projects/[slug]/media` — media management (existing). **Extend:** add a Documents section supporting PDF uploads tagged by document type (sales_presentation, brochure, price_list, payment_plan, foreign_quota_letter, floor_plan_set, other). Each document has: type, version, uploaded_at, uploaded_by, file URL.

### 7.2 New

**`/admin/queue`** — proposal review queue.

Layout: a list of pending proposals, default sorted by severity (major first) then by age. Each row shows: project name + link, update type, severity badge, count of fields changed, proposed_at, proposed_by, discrepancy flag if any. Click expands the row to show:

- The diff: each field with current value, proposed value, evidence quote, AI confidence
- The source material (collapsed expandable view)
- The related project_updates entry draft (editable)
- Action buttons: Approve, Approve & Edit, Approve but Hold Notifications, Reject, Defer
- Note field for review comments

Filters: severity, status (pending/approved/rejected), project, date range, proposed_by.

**`/admin/projects/[slug]`** — project detail admin view.

Existing admin link goes to media. Add a detail view that shows the full project record in tabs:

- **Public content** tab — name, slug, area, developer, public description, Hawook's Take, badges, tags. Editable in place by admins. Edits log to audit, severity=minor.
- **Structured data** tab — pricing, unit types, foreign quota, construction stage, payment plan, fees. Editable in place but each edit creates an `update_proposal` requiring re-approval (even when the editor is the approver — forces the audit pattern).
- **Hawook Score** tab — internal-only view of the six dimensions, sub-scores, evidence notes, calculated total, badge tier. Editable here only.
- **Updates history** tab — chronological list of `project_updates` entries for this project.
- **Followers** tab — count and list (anonymized for non-superadmin) of users following this project.
- **Activity** tab — recent admin actions and AI proposals related to this project.

**`/admin/audit`** — audit log.

Read-only, chronological. Filterable by date, project, actor, action type. Each entry: timestamp, actor (Codi / Yogi / system), action (proposed / approved / rejected / direct-edited / published / unpublished), target, summary of change.

**`/admin/areas/[slug]`** and **`/admin/developers/[slug]`** — area and developer admin views.

Same pattern as project admin view, with relevant fields. Used when content updates need to flow to areas or developers (e.g., adding a new amenity to Rawai area knowledge, updating a developer's project count).

**`/admin/settings/approval`** — approval settings.

Initially minimal: list of approver emails. Future: toggle auto-approval per category, set SLA thresholds, manage notification recipients.

### 7.3 Notifications to Codi from the admin UI

- Email on every Major proposal creation (real-time, within minutes)
- Daily digest email each morning summarising Standard proposals pending
- Weekly digest email each Sunday summarising Minor proposals pending
- No notifications on rejections or applied proposals (already handled by Codi at that point)

---

## 10. NOTIFICATION FLOW AFTER APPROVAL

When a proposal is approved and the data change is applied, the system triggers user notifications based on severity and user stage. This is governed by the cadence rules locked in the Lead Playbook + recent decisions.

### 8.1 The applied flow

1. Approver clicks Approve.
2. Application code reads the proposal.
3. Validates: fields exist, types match, no constraint violations.
4. Applies the change to the target table.
5. If `related_update_entry` exists, creates a row in `project_updates`.
6. Marks the proposal `applied`, logs to audit.
7. Triggers notification logic.

If validation fails: proposal marked `failed`, error logged, Codi notified to investigate.

### 8.2 Notification logic

The `project_updates` entry has `severity` (minor / standard / major) and `notify_followers` (true/false).

For each follower of the project:

1. Determine the follower's notification preference (default: Weekly + Major Events).
2. Determine the follower's lead stage (from `leads` table, joined via user email).
3. Apply the rule:

| Follower preference | Follower stage | Severity = minor | Severity = standard | Severity = major |
|---|---|---|---|---|
| All updates | Any | Same-day email | Same-day email | Same-day email |
| Weekly + Major (default) | Engaged, Qualified, Considering, Reserved | Weekly digest | Weekly digest | Same-day email |
| Weekly + Major (default) | New, Cold, Dead | Weekly digest | Weekly digest | Weekly digest (downgraded) |
| Weekly only | Any | Weekly digest | Weekly digest | Weekly digest |

**Same-day** emails fire within ~4 hours of approval (a job runs every 15–30 min checking for new approved entries with notification eligibility).

**Weekly digest** emails fire Sunday morning Phuket time (configurable). Consolidates all updates across all followed projects for that user, plus one "from the newsletter this week" link and one "you might also like" suggestion (from Tier 3 work).

### 8.3 Edge cases

- User following 3 projects, all with updates this week: one weekly email with all updates grouped by project. Not three emails.
- User following 1 project that had a major update: same-day email for that, plus the next weekly digest will skip mentioning that update (already notified).
- User unsubscribes: all notifications stop. Newsletter only continues if they remain subscribed to that.
- Project removed from site (Hawook Score drops below threshold): followers get one final notification explaining the removal and pointing to comparable projects.

---

## 11. HALLUCINATION DEFENSES

The biggest risk in the workflow is Claude proposing a confident-looking update based on misread or fabricated information. Six defenses.

### 9.1 Evidence required for all numeric and critical fields

Every field in `fields_changed` must include an `evidence` string. For numeric fields and Hawook Score fields, the evidence must include a direct quote from the source material. Claude is instructed to refuse to propose a numeric change without a quotable source, and to instead say "the source doesn't specify the new value clearly; recommend confirming with developer."

The MCP layer validates this — proposals missing evidence on numeric fields are rejected at submission with an error returned to Claude.

### 9.2 AI confidence flag

Every field carries `ai_confidence`: high (direct quote, unambiguous), medium (interpreted from context), low (inferred). Reviewer sees these prominently. Low confidence proposals are visually flagged in the queue.

### 9.3 Discrepancy detection

When Claude proposes a change, the MCP function compares the current value to the proposed value and checks for explanatory context. If the current value was set within the last 14 days and there's no `project_updates` entry explaining a change, the proposal gets `discrepancy_flag=TRUE` automatically. Reviewer sees the flag and the unexplained recent change.

### 9.4 Soft validation on ranges

Built into the MCP layer. If a proposed price change is more than ±20% of current, the MCP doesn't reject but flags the proposal as `severity=major` and adds a note to evidence. Same for foreign_quota_available changes greater than 30% in either direction.

### 9.5 Source preservation

Every proposal stores the raw source material (`source_raw`, truncated to 10K chars). Reviewer can always go back to what Claude was looking at. If Codi reads the source and disagrees with Claude's interpretation, that's a feedback log entry against the Voice & Knowledge Base.

### 9.6 Periodic spot audit

Once a month, Codi or Yogi reviews 10 random applied proposals against their source materials. Looks for hallucination, misinterpretation, or systematic bias. Feedback log entries created from anything found. The Voice & Knowledge Base gets sharpened.

---

## 12. MULTI-USER CONSIDERATIONS

The system is designed for Yogi as the primary operator, but should not depend on him.

### 10.1 Adding a second VA

- Same Claude Desktop setup, same MCP token (rotated periodically anyway), same instruction prompt.
- New email added to admin whitelist for queue access.
- Approval rights still restricted to Founder + designated senior approvers.
- Their proposals are tagged with `proposed_by` so we can attribute and learn from individual patterns.

### 10.2 If Yogi leaves

- Token rotated immediately.
- Successor's Claude Desktop reinitialized with the same configuration.
- The Voice & Knowledge Base and Master Doc are the training materials; no Yogi-specific knowledge is lost because nothing was ever in Yogi's head that wasn't also in the docs.
- Pending proposals at the time of departure: reviewed and either approved or rejected by Codi within the SLA.

### 10.3 Concurrent edits

If Yogi proposes an update while Codi is direct-editing the same field via admin UI:

- Codi's direct edit takes precedence (it's already applied).
- Yogi's proposal lands in the queue with a `discrepancy_flag` because the "current value" Claude saw is no longer current.
- Reviewer sees the flag and decides.

The system never silently overwrites a more recent edit.

### 10.4 Partner agent involvement (future)

When a partner agent comes on board, they may submit content updates too (e.g., "I just toured Surfhouse, here's an updated foreign quota status the developer mentioned"). For v1.0, partner agents don't have direct MCP access — they message Yogi with the info, Yogi processes through his Claude. For v2.0 (after partner agent relationships are mature), a partner-agent-scoped MCP token could be issued with even narrower scope.

---

## 13. BUILD SEQUENCE

The spec is large. The build is staged.

### Phase 1 (Tier 2 Cowork brief — to be written next)

Foundations for everything:

1. `update_proposals` table with full schema.
2. `lib/approvers.ts` defining who can approve.
3. `/admin/queue` page with full diff/approve/reject functionality.
4. `/admin/audit` page (read-only).
5. Application code path for "approve proposal → apply change → log to audit → create project_updates entry."
6. Email notification to Codi on Major proposal creation (via Resend).
7. Daily digest email of pending Standard proposals (cron via Vercel).
8. Project detail admin view with public content + structured data + Hawook Score tabs.
9. Documents section in media admin UI.

### Phase 2 (Tier 2.5 — follows Phase 1)

Yogi's Claude side:

10. Custom Hawook MCP server (Node.js). Deployable both locally on Yogi's machine and as a hosted version (we'll start hosted for simplicity).
11. MCP business operations: `read_project`, `search_projects`, `propose_project_update`, etc.
12. Yogi's Claude Desktop configured with both MCPs.
13. Instruction prompt for Yogi's Claude that loads Voice & Knowledge Base and explains the proposal workflow.
14. Test cycle: run 5 real scenarios end-to-end. Measure: time per proposal, accuracy, reviewer satisfaction.

### Phase 3 (Tier 3)

Notification system:

15. Same-day notification cron for Major updates to qualified+ leads following the project.
16. Weekly digest cron, Sunday Phuket time.
17. User notification preferences UI in the dashboard.
18. Newsletter top-story link integration into weekly digest.
19. "You might also like" project suggestion logic for weekly digest.

### Phase 4 (Tier 4)

Refinements:

20. Auto-approval rules for graduated categories.
21. Bulk approval UX.
22. Areas and Developers admin views.
23. Periodic spot audit tooling (random sample fetcher).
24. Multi-VA support hardening.

---

## 14. OPEN QUESTIONS

Decisions still needed before Phase 1 build starts:

**Q1. Hosted MCP vs local MCP.** Running the custom Hawook MCP server on Vercel (or a small VPS) means Yogi's Claude Desktop just connects to a URL with a token — no local setup, easy onboarding, easy token rotation, works from any machine. Running it locally on Yogi's machine is more private but requires Yogi to maintain Node.js, dependencies, and config. **Recommendation: hosted.** Confirm before Phase 2 build.

**Q2. Resend email templates — who designs them?** The Major proposal alert email, the daily digest, the same-day user notification, the weekly digest. These are buyer-facing for the user notifications and team-facing for the proposal alerts. Voice rules apply. Need to draft these templates as part of Phase 1 (alerts) and Phase 3 (user-facing). **Open: who drafts vs who approves?**

**Q3. How granular do we get with severity?** Three levels (minor / standard / major) feels right. Some other systems use 4–5. Adding a `critical` level above major could cover "legal issue identified" or "developer announces bankruptcy" type events that need same-hour escalation rather than same-day. **Recommendation: start with 3. Add 'critical' if a real scenario demands it.**

**Q4. Newsletter integration timing.** The weekly digest should include a link to the latest newsletter article. This requires the newsletter to have moved from WordPress to a system that exposes its content programmatically. **Open: do we keep WordPress for newsletter authoring and pull via WP REST API? Or migrate newsletter to a different platform that integrates more naturally?** Decide before Phase 3.

**Q5. Source attribution for context updates.** When Claude proposes adding context to an area page from a blog article, the article should be attributed (source URL, title, author, date). The admin UI and the area page UI need to handle this gracefully. **Open: cite inline? Footer? How do we avoid copyright issues if the source is substantive?**

These five answers will inform the Phase 1 Cowork brief.

---

**End of Content Ops & Concierge-Driven Admin Spec v1.2.**

*Founder approves any deviation from this spec during build. Build briefs reference this document by section number. Changes to the spec require explicit version bump and changelog entry.*
