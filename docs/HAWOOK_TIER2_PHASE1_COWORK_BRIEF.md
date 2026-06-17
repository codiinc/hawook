# HAWOOK — TIER 2 COWORK BRIEF: PHASE 1

**Brief version:** 1.0
**Date:** 16 June 2026
**Target sessions:** 5 sessions estimated, 3–5 hours each. See "Suggested Session Groupings" below.
**Prerequisite:** Tier 1 Cowork Brief executed in full (RLS, auth checks, image domains, user trigger, placeholder replacements, Hawook Score schema additions). Verify before starting.
**Repo:** https://github.com/codiinc/hawook.git
**Production URL:** https://app.hawook.com
**Supabase project:** https://jpuaradwxylxkyvnncdq.supabase.co (ap-southeast-1)

**Reference documents** (in repo or shared workspace):
- Master Doc v1.1 — orientation
- Voice & Knowledge Base v1.0 — tone, glossary, voice rules
- Lead Playbook v1.1 — 11 stages, lead source tracking, message frameworks
- Content Ops & Concierge-Driven Admin Spec v1.0 — approval workflow architecture
- AI Concierge Spec v1.0 — context only; Concierge build is Phase 3, not in this brief
- Email Templates v1.0 — all 14 templates, plain text format

---

## CONTEXT

This brief covers Phase 1 of Tier 2 — the foundational build that enables lead capture, the Concierge-Driven Admin approval workflow, the Hawook Score badge display, transactional email infrastructure, and analytics. After Phase 1 is live, Hawook can take real leads, ingest project updates via Yogi's Claude (Phase 2), and ship the public AI Concierge (Phase 3).

**What's in scope for Phase 1:**

- Database additions (update_proposals table, documents extension, project_updates table, approver whitelist file)
- Resend integration for transactional email
- All 14 email templates implemented as renderable functions; triggers wired for the 5 that have triggers in Phase 1
- Native lead capture form on project pages, writing to `leads` table
- Google Analytics 4 wired on app.hawook.com with Consent Mode v2
- Page status toggle in admin (draft / published / archived)
- Hawook Score badges displayed publicly on project pages and project cards
- Admin queue at `/admin/queue` for AI-proposed update review
- Audit log at `/admin/audit`
- Project detail admin view with Public Content, Structured Data, and Hawook Score tabs
- Documents section in media admin (sales presentations, brochures, price lists, payment plans, etc.)
- Daily standard proposals digest cron
- Major proposal alert email trigger
- Stale project alert cron
- Approval flow execution code (read approved proposal → apply change → log audit → create project_updates entry)

**What's NOT in scope for Phase 1** (later phases or briefs):

- AI Concierge build (Phase 3 — separate brief)
- Yogi's Claude Desktop + Supabase MCP setup (Phase 2)
- Same-day major event notification cron to followers (Phase 3)
- Weekly digest cron to followers (Phase 3)
- Lead intent scoring algorithm (Phase 4)
- Areas / Developers admin or public pages (Phase 2+)
- About page (Phase 2)
- AI Concierge handoff confirmation, viewing booking, viewing reminder triggers (later phases when those features exist)
- Cookie banner UI for GDPR (Phase 3 with Concierge)
- Auto-approval rules (Phase 4)
- Multilingual support (deferred per founder decision)
- Smart partner-agent routing (deferred per founder decision)

---

## SUGGESTED SESSION GROUPINGS

To make execution manageable, the 14 tasks split into 5 sessions with clean dependencies:

| Session | Tasks | Theme |
|---|---|---|
| Session 1 | 1, 2, 3, 5 | Foundations: schema, Resend, email templates, GA4 |
| Session 2 | 4, 7 | Lead capture + public Hawook Score badge display |
| Session 3 | 6, 10, 11 | Admin extensions: page status toggle, project admin view, documents |
| Session 4 | 8, 9, 13 | Content ops: queue, audit, approval flow execution |
| Session 5 | 12, 14 | Automation crons + smoke test |

Each session is bookended by a smoke test for the tasks it covers. Final smoke test (Task 14) runs against the entire Phase 1 deliverable.

---

## TASK 1 — Database additions

### What's needed

Three new tables (or extensions) on Supabase, plus a code file for approver whitelist. All additive — no destructive changes to existing schema.

### SQL

```sql
-- 1.1 update_proposals — AI-proposed changes awaiting review
CREATE TABLE IF NOT EXISTS update_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposed_at TIMESTAMPTZ DEFAULT NOW(),
  proposed_by TEXT NOT NULL, -- 'yogi' | 'codi' | future VA names
  ai_session_context TEXT, -- short note from Claude about the session/context
  
  target_table TEXT NOT NULL CHECK (target_table IN ('projects', 'areas', 'developers', 'project_updates')),
  target_record_id UUID,
  target_slug TEXT,
  
  update_type TEXT NOT NULL CHECK (update_type IN ('field_update', 'new_record', 'new_update_entry', 'media_link')),
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'standard', 'major')),
  
  fields_changed JSONB,
  related_update_entry JSONB,
  
  source_type TEXT,
  source_raw TEXT, -- max 10K chars enforced in app layer
  source_metadata JSONB,
  
  discrepancy_flag BOOLEAN DEFAULT FALSE,
  discrepancy_note TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending_approval'
    CHECK (status IN ('pending_approval', 'approved', 'rejected', 'applied', 'failed')),
  
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  applied_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposals_status ON update_proposals(status);
CREATE INDEX idx_proposals_target_slug ON update_proposals(target_slug);
CREATE INDEX idx_proposals_severity ON update_proposals(severity);
CREATE INDEX idx_proposals_created_at ON update_proposals(created_at DESC);

-- RLS: admin-only access
ALTER TABLE update_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read proposals" ON update_proposals
  FOR SELECT USING (
    auth.email() IN (SELECT email FROM public.users WHERE role = 'admin')
  );
CREATE POLICY "Admins can write proposals" ON update_proposals
  FOR ALL USING (
    auth.email() IN (SELECT email FROM public.users WHERE role = 'admin')
  );

-- 1.2 project_updates — published change records (if not already created in Tier 1)
CREATE TABLE IF NOT EXISTS project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  type TEXT NOT NULL, -- 'pricing' | 'availability' | 'construction' | 'incentive' | 'document' | 'news' | 'other'
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'standard', 'major')),
  summary_public TEXT NOT NULL,
  summary_internal TEXT,
  source TEXT, -- 'developer_email' | 'yogi_manual' | 'cowork_cron' | 'site_visit' | 'ai_proposal' | etc.
  source_proposal_id UUID REFERENCES update_proposals(id),
  notify_followers BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_project_updates_project ON project_updates(project_id);
CREATE INDEX idx_project_updates_created_at ON project_updates(created_at DESC);

ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read project updates" ON project_updates FOR SELECT USING (true);
CREATE POLICY "Admins can write project updates" ON project_updates
  FOR ALL USING (
    auth.email() IN (SELECT email FROM public.users WHERE role = 'admin')
  );

-- 1.3 documents — project-attached PDFs and downloads
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  document_type TEXT NOT NULL CHECK (document_type IN (
    'sales_presentation', 'brochure', 'price_list', 'payment_plan',
    'foreign_quota_letter', 'floor_plan_set', 'spa_template', 'other'
  )),
  version TEXT, -- e.g. 'v2', '2026-06', 'final'
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  filename TEXT,
  file_size_bytes INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES public.users(id),
  is_gated BOOLEAN DEFAULT TRUE -- gated documents require lead login
);

CREATE INDEX idx_project_documents_project ON project_documents(project_id);

ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read non-gated documents" ON project_documents
  FOR SELECT USING (is_gated = FALSE);
CREATE POLICY "Authenticated users can read gated documents" ON project_documents
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can write documents" ON project_documents
  FOR ALL USING (
    auth.email() IN (SELECT email FROM public.users WHERE role = 'admin')
  );

-- 1.4 Add last_updated and page_status to projects table (if not already in Tier 1)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS update_notes TEXT,
  ADD COLUMN IF NOT EXISTS page_status TEXT DEFAULT 'draft'
    CHECK (page_status IN ('draft', 'published', 'archived'));

-- 1.5 audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.users(id),
  actor_email TEXT,
  action TEXT NOT NULL, -- 'proposed' | 'approved' | 'rejected' | 'direct_edit' | 'published' | 'unpublished' | 'archived' | etc.
  target_table TEXT,
  target_record_id UUID,
  target_slug TEXT,
  summary TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_target ON audit_log(target_table, target_record_id);
CREATE INDEX idx_audit_actor ON audit_log(actor_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read audit log" ON audit_log
  FOR SELECT USING (
    auth.email() IN (SELECT email FROM public.users WHERE role = 'admin')
  );
CREATE POLICY "System can write audit log" ON audit_log
  FOR INSERT WITH CHECK (true); -- service role only via app code
```

### Code file: `lib/approvers.ts`

```typescript
// Approver whitelist — emails allowed to approve update_proposals.
// This is intentionally separate from lib/admin.ts (which controls admin UI access).
// All approvers must also be admins. Not all admins are approvers.
export const APPROVERS = ['codi@chokdee.co'];

export function isApprover(email: string | null | undefined): boolean {
  if (!email) return false;
  return APPROVERS.includes(email.toLowerCase());
}
```

### Definition of done

- All five SQL blocks execute without error in Supabase.
- All RLS policies verified by anonymous query (anon can read `project_updates` and non-gated `project_documents`; cannot read `update_proposals` or `audit_log`).
- `lib/approvers.ts` exists and is imported correctly where needed in later tasks.
- Existing app continues to function (no breaks from `page_status` default value).

---

## TASK 2 — Resend integration setup

### What's needed

Install Resend SDK, set up environment variables, create email-sending utility.

### Implementation

1. **Install dependency:** `npm install resend`

2. **Add environment variables to Vercel** (and `.env.local`):
   - `RESEND_API_KEY` (production key)
   - `RESEND_FROM_HELLO=hello@hawook.com`
   - `RESEND_FROM_SYSTEM=system@hawook.com`
   - `RESEND_FROM_YOGI=yogi@hawook.com`
   - `RESEND_FROM_CODI=codi@hawook.com`

3. **Domain verification:** Verify `hawook.com` and all four sender addresses in Resend dashboard. Set SPF, DKIM, and DMARC records. Mark as complete in smoke test only after DMARC reports show emails passing.

4. **Create utility:** `lib/email.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailSender = 'hello' | 'system' | 'yogi' | 'codi';

const SENDER_MAP: Record<EmailSender, { name: string; email: string }> = {
  hello: { name: 'Hawook', email: process.env.RESEND_FROM_HELLO! },
  system: { name: 'Hawook System', email: process.env.RESEND_FROM_SYSTEM! },
  yogi: { name: 'Yogi at Hawook', email: process.env.RESEND_FROM_YOGI! },
  codi: { name: 'Codi at Hawook', email: process.env.RESEND_FROM_CODI! },
};

export interface SendEmailParams {
  from: EmailSender;
  to: string | string[];
  subject: string;
  text: string;
  replyTo?: string;
  tags?: { name: string; value: string }[]; // for Resend filtering/analytics
}

export async function sendEmail(params: SendEmailParams) {
  const sender = SENDER_MAP[params.from];
  
  try {
    const result = await resend.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      reply_to: params.replyTo,
      tags: params.tags,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('Resend error:', error);
    return { success: false, error };
  }
}
```

### Definition of done

- Resend SDK installed.
- All env vars set in Vercel (production) and `.env.local`.
- All four sender domains verified in Resend dashboard.
- `lib/email.ts` exists and exports `sendEmail` function.
- Test email sent successfully from each sender address to a known inbox.

---

## TASK 3 — Email template implementations

### What's needed

All 14 templates from Email Templates v1.0 implemented as TypeScript functions that take typed parameters and return `{ subject: string; text: string; from: EmailSender }`.

### Implementation

Create `lib/email-templates/` directory with one file per template:

- `lib/email-templates/major-proposal-alert.ts` (template #1)
- `lib/email-templates/daily-standard-digest.ts` (template #2)
- `lib/email-templates/weekly-minor-digest.ts` (template #3)
- `lib/email-templates/stale-project-alert.ts` (template #4)
- `lib/email-templates/new-lead-alert.ts` (template #5)
- `lib/email-templates/welcome.ts` (template #6)
- `lib/email-templates/lead-acknowledgment.ts` (template #7)
- `lib/email-templates/ai-concierge-handoff.ts` (template #8)
- `lib/email-templates/major-update-notification.ts` (template #9)
- `lib/email-templates/weekly-digest.ts` (template #10)
- `lib/email-templates/cold-reengagement.ts` (template #11)
- `lib/email-templates/viewing-confirmation.ts` (template #12)
- `lib/email-templates/viewing-reminder.ts` (template #13)
- `lib/email-templates/post-viewing-followup.ts` (template #14)

Each file exports a function. Example shape (use this pattern for all):

```typescript
// lib/email-templates/new-lead-alert.ts
import type { EmailSender } from '@/lib/email';

export interface NewLeadAlertParams {
  leadName: string;
  leadEmail: string;
  leadWhatsapp?: string;
  leadSource: 'form_submission' | 'ai_concierge' | 'newsletter' | 'referral' | 'partner' | 'other';
  leadProjectContext?: string;
  leadBudget?: string;
  leadTimeframe?: string;
  leadPersona?: 'buyer' | 'investor' | 'agent' | 'other';
  aiConciergeContext?: boolean;
  aiConciergeSummary?: string;
  schedulingContext?: string;
  leadUrl: string;
}

export function renderNewLeadAlert(params: NewLeadAlertParams): {
  subject: string;
  text: string;
  from: EmailSender;
} {
  const subject = `New lead — ${params.leadName} (${params.leadSource})`;
  
  let text = `A new lead just came in.\n\n`;
  text += `Name: ${params.leadName}\n`;
  text += `Email: ${params.leadEmail}\n`;
  if (params.leadWhatsapp) text += `WhatsApp: ${params.leadWhatsapp}\n`;
  text += `Source: ${params.leadSource}\n`;
  if (params.leadProjectContext) text += `Project: ${params.leadProjectContext}\n`;
  if (params.leadBudget) text += `Budget: ${params.leadBudget}\n`;
  if (params.leadTimeframe) text += `Timeframe: ${params.leadTimeframe}\n`;
  if (params.leadPersona) text += `Identifies as: ${params.leadPersona}\n`;
  
  if (params.aiConciergeContext && params.aiConciergeSummary) {
    text += `\nWhat they asked the Concierge:\n${params.aiConciergeSummary}\n`;
    if (params.schedulingContext) {
      text += `\nScheduling info gathered:\n${params.schedulingContext}\n`;
    }
  }
  
  text += `\nSLA: respond within 1 hour (Phuket business hours), 4 hours outer bound.\n\n`;
  text += `Open lead in CRM:\n${params.leadUrl}\n\n`;
  text += `—\nHawook System`;
  
  return { subject, text, from: 'system' };
}
```

Follow Email Templates v1.0 verbatim for subject, body text, sender, and signature. Variables map exactly to the variables listed under each template.

### Triggers wired in Phase 1

Implement the templates as functions for all 14; wire actual sending only for these 5 in Phase 1:

| Template | Wired in Task | Trigger |
|---|---|---|
| #1 Major proposal alert | Task 13 | On `update_proposals` insert with `severity='major'` |
| #2 Daily standard digest | Task 12 | Daily cron at 8am Phuket |
| #4 Stale project alert | Task 12 | Daily cron at 9am Phuket; one per stale project per week max |
| #5 New lead alert | Task 4 | On `leads` insert |
| #6 Welcome | Task 4 | On `public.users` insert via auth trigger |
| #7 Lead acknowledgment | Task 4 | On `leads` insert (sent to lead, not Yogi) |

Other templates (#3, #8, #9, #10, #11, #12, #13, #14) — functions exist and are tested, but no automated trigger fires until Phase 2 or 3 when their parent features ship.

### Definition of done

- All 14 template files exist with the function pattern above.
- Each function returns the correct subject and body text matching Email Templates v1.0 verbatim, with variables substituted.
- Unit-style smoke test (manual or scripted): render each template with sample params and verify output matches the spec.
- The 5 wired triggers fire correctly when their parent task is built.

---

## TASK 4 — Native lead capture form

### What's needed

Replace the placeholder text on project detail pages (left by Tier 1 Task 5) with a native lead capture form. On submission, write to `leads` table, send Yogi the alert email (template #5), send the user the acknowledgment (template #7).

### Form fields

- Full name (required, text)
- Email (required, validated email format)
- WhatsApp number (optional, with country code dropdown defaulting to +66)
- Budget range (required, dropdown: "Under 5M THB" / "5–10M THB" / "10–20M THB" / "20–50M THB" / "50M+ THB" / "Prefer not to say")
- Timeframe (required, dropdown: "Within 3 months" / "3–6 months" / "6–12 months" / "Just exploring")
- "I am a..." (required, radio: "Buyer for myself" / "Investor" / "Agent" / "Other")
- Optional message (text area, 500 char limit)
- Honeypot field (hidden, named e.g. `website` — if filled, silently reject as bot)
- Tickbox: "Subscribe to the Hawook newsletter" (default: checked)
- Tickbox: "I agree to be contacted by Hawook" (required to submit)

### Behaviour

1. Form renders on project detail pages where the Tally placeholder previously was.
2. Form context (project slug) is captured automatically from the page.
3. On submit:
   - Validate fields client-side.
   - POST to new API route `/api/leads/create`.
   - Show loading state.
   - On success, replace form with confirmation message: *"Thanks {{first_name}} — Yogi will be in touch within the next hour during Phuket business hours. Watch for an email from yogi@hawook.com."*
   - Add lead to "following project" relationship for the current project automatically.
   - Open WhatsApp deep-link suggestion: *"Want to chat now on WhatsApp? Click here."* linking to `wa.me/66805100129` with prefilled context.

### API route: `/api/leads/create`

```typescript
// POST body
{
  name: string,
  email: string,
  whatsapp?: string,
  budget: string,
  timeframe: string,
  persona: 'buyer' | 'investor' | 'agent' | 'other',
  message?: string,
  project_slug: string,
  subscribe_newsletter: boolean,
  agree_contact: boolean,
  honeypot: string // must be empty
}
```

Server logic:

1. Validate honeypot is empty; if not, return 200 with success message but don't process.
2. Validate required fields; if invalid, return 400.
3. Look up `project_id` from `project_slug`.
4. Insert into `leads`:
   ```typescript
   {
     name, email, whatsapp,
     budget, timeframe, persona, message,
     source: 'form_submission',
     stage: 'New',
     current_project_context_id: project_id,
     subscribe_newsletter,
     created_at: NOW(),
   }
   ```
5. If `subscribe_newsletter`, also POST to Beehiiv API to add to newsletter list (use existing Beehiiv subscription endpoint; details to be added to Voice & Knowledge Base v1.1).
6. Insert into `project_follows` if user is also signed up (matched by email); otherwise note it for later linking.
7. Log activity to `lead_activity_log`: event `lead_form_submitted`.
8. Send email template #5 to Yogi (system → yogi@hawook.com).
9. Send email template #7 to user (hello → user).
10. Return 201 with `{ success: true }`.

### Welcome email on signup

When a new user signs up via existing auth flow, trigger template #6 (Welcome). The Supabase trigger from Tier 1 creates the `public.users` row; add a server-side hook (either via Supabase database webhook or Next.js auth callback handler) that calls `sendEmail` with the rendered welcome template.

### Definition of done

- Form renders correctly on project detail pages.
- Form validates required fields client-side with sensible error messages.
- API route writes to `leads` table correctly.
- Yogi receives email #5 with correct content within 30 seconds of submission.
- User receives email #7 with correct content within 30 seconds of submission.
- Honeypot rejects spam submissions silently.
- New signups trigger welcome email #6.
- Test 5 real submissions; verify all emails arrive and lead row is correct in each case.

---

## TASK 5 — Google Analytics 4 wiring

### What's needed

GA4 added to `app.hawook.com` with Consent Mode v2 (deny-by-default for marketing/personalization).

### Implementation

1. Create GA4 property for `app.hawook.com` (separate from WordPress property which exists). Get Measurement ID.
2. Add to Vercel env: `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
3. Add Google Tag (`gtag.js`) to `app/layout.tsx` via Next.js Script component, deferred loading.
4. Set Consent Mode v2 defaults to deny-by-default for `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`.
5. For Phase 1, leave the consent banner build for Phase 3 (Concierge). Consent Mode v2 with deny-by-default handles GDPR compliance at the data layer.
6. Wire custom events to fire on:
   - `page_view` — automatic via gtag
   - `lead_form_submitted` — on form success (Task 4)
   - `user_signup` — on signup completion (existing flow)
   - `project_followed` — on follow button click
   - `gated_content_unlocked` — when authenticated user views gated content

### Definition of done

- GA4 Measurement ID set in Vercel.
- gtag.js loads on every page of `app.hawook.com`.
- Real-time view in GA4 dashboard shows traffic when test pages are loaded.
- 5 custom events fire correctly and appear in GA4 events explorer.
- Consent Mode v2 defaults verified via GA Debugger or browser console.

---

## TASK 6 — Page status toggle in admin

### What's needed

Admin UI affordance to toggle a project's `page_status` between `draft`, `published`, and `archived`. Required because Tier 1 left all 3 existing projects in `draft` with no UI to publish them.

### Implementation

1. **`/admin` projects dashboard:** add a status column showing current `page_status` with a small dropdown to change it.
2. **Confirmation modal** for state changes:
   - Draft → Published: "Publishing makes this project visible on the public site and indexable by search engines. Confirm?"
   - Published → Draft: "Unpublishing removes this project from the public site. Existing followers will not be notified. Confirm?"
   - Any → Archived: "Archiving removes this project from public view permanently. Use for sold-out or discontinued projects. Confirm?"
3. **API route `/api/admin/projects/[slug]/status`** (PATCH):
   - Auth check: admin only.
   - Update `page_status` in `projects` table.
   - Update `last_updated`.
   - Insert into `audit_log` with action `'published'`, `'unpublished'`, or `'archived'`.
4. **Public site:** projects with `page_status != 'published'` return 404 on `/projects/[slug]` and do not appear in `/projects` listing or homepage featured grid. Sitemap excludes them.

### Definition of done

- Status dropdown appears on `/admin` next to each project.
- Confirmation modal renders correctly for each transition.
- Successful status change updates DB and writes audit entry.
- Public site correctly hides non-`published` projects.
- The 3 existing draft projects can be published via the new UI.

---

## TASK 7 — Hawook Score badges display on public site

### What's needed

Display `hawook_badge` and `hawook_take` publicly per Master Doc Section 2.6. Never display `hawook_score` or `hawook_score_dimensions`.

### Implementation

1. **Badge component:** `components/HawookBadge.tsx`. Renders nothing if `badge` is null; renders "Hawook Recommended" or "Hawook Top Pick" pill with appropriate styling otherwise.
2. **Hawook's Take section component:** `components/HawookTake.tsx`. Renders a styled block with the qualitative paragraph from `hawook_take`. Section heading "Hawook's Take" or similar. If `hawook_take` is empty, render nothing.
3. **Project detail page (`/projects/[slug]`):** insert badge near the project title and "Hawook's Take" section prominently above the gated content section.
4. **Project card (`components/ProjectCard.tsx`):** insert badge in the card header or overlay if present, so badges are visible in listings.
5. **Homepage featured grid:** verify badges render on the featured project cards.
6. **Listing page (`/projects`):** verify badges render in the filtered grid.

### Internal-only protection

Double-check that the public API responses (the queries running on `/projects` and `/projects/[slug]` pages) do not include `hawook_score` or `hawook_score_dimensions`. If they do, modify the query to explicitly select only public columns. This is defense-in-depth against the column-level RLS from Tier 1.

### Styling

Use the existing Tailwind design tokens (teal, cream, Fraunces serif). "Recommended" should feel earned but not flashy — a small pill, distinct from generic tags. "Top Pick" can be slightly more prominent. Don't make either bigger than the project name.

### Definition of done

- Badge renders correctly on all surfaces where projects appear (detail, card, homepage, listing).
- "Hawook's Take" section renders correctly on project detail pages.
- API responses do not contain `hawook_score` or `hawook_score_dimensions` (verified via browser DevTools Network tab).
- Visual styling matches design tokens; review with founder before final commit.

---

## TASK 8 — Admin queue page `/admin/queue`

### What's needed

Reviewable list of `update_proposals` with `status='pending_approval'`. Approver acts on each.

### Layout

Default sort: severity DESC (major first), then created_at ASC (oldest within severity first).

Each row shows:
- Project name (or area/developer name) — linked to admin view
- Update type — short label
- Severity badge — color-coded (major=red, standard=amber, minor=grey)
- Field-change count summary (e.g. "2 fields, +1 update entry")
- Proposed at (relative — "2h ago")
- Proposed by (badge — "Yogi" / "Codi" / etc.)
- Discrepancy flag (red icon if true)
- Click row → expands to detail view

Filters available: severity, status, project, date range, proposed_by.

### Detail view (expanded row)

- **Source material** (collapsible — show first 500 chars by default, expand to full)
- **For each field changed:**
  - Field name
  - Current value (boxed)
  - Proposed value (boxed, highlighted as change)
  - Evidence text (in italic block)
  - AI confidence flag (color-coded)
- **Related project_updates entry draft** (if present): editable inline. Show `type`, `severity`, `summary_public`, `summary_internal`, `notify_followers`.
- **Action buttons:**
  - Approve (green)
  - Approve & edit (opens inline editor)
  - Approve but hold notifications (sets `related_update_entry.notify_followers = false`, still applies the data change)
  - Reject (with optional note prompt)
  - Defer (with optional tag input)
- **Review note** text area (always optional).

### Bulk actions

Above the list: "Approve all minor proposals" button (with confirmation modal) — applies only to severity=minor rows currently visible per filter.

### API routes

- `GET /api/admin/proposals` — returns filtered list. Auth: admin only.
- `POST /api/admin/proposals/[id]/approve` — body can include `notification_hold`, `edited_fields`, `review_notes`. Calls approval flow execution from Task 13. Auth: approver only.
- `POST /api/admin/proposals/[id]/reject` — body includes `review_notes`. Marks proposal `rejected`, writes audit. Auth: approver only.
- `POST /api/admin/proposals/[id]/defer` — body includes `defer_tag`, `review_notes`. Keeps in queue with tag. Auth: approver only.

### Definition of done

- Page renders at `/admin/queue` with auth-gated access (admin email whitelist).
- Approver-restricted actions (Approve, Reject, Defer) hidden for non-approver admins.
- Filters work correctly.
- Detail view shows all fields per spec.
- Approve / Reject / Defer all write correctly to `update_proposals` and `audit_log`.
- Bulk approve minor works.
- Test with at least 3 manually-inserted proposal rows of varying severity.

---

## TASK 9 — Audit log page `/admin/audit`

### What's needed

Read-only chronological log of every change to live data.

### Layout

Reverse-chronological list. Each row shows:
- Timestamp (with timezone)
- Actor (avatar/initial + name/email)
- Action (color-coded label)
- Target (project/area/developer name + link to admin view)
- Summary (one-line description)
- Metadata expand (collapsed JSON view)

### Filters

- Date range
- Actor
- Action type
- Target table
- Target slug

### API route

`GET /api/admin/audit` — paginated list. Auth: admin only. No write endpoint — audit log is append-only via app code, never via UI.

### Definition of done

- Page renders at `/admin/audit` with auth-gated access.
- All filters work.
- Pagination works (50 entries per page).
- Existing audit entries from Task 6 and Task 13 actions appear correctly.

---

## TASK 10 — Project detail admin view

### What's needed

Extend existing admin structure with a per-project detail view at `/admin/projects/[slug]`. Currently this route goes directly to `/admin/projects/[slug]/media`. Change so the slug route shows a multi-tab admin view, with media as one of the tabs.

### Tabs

1. **Overview** (default) — summary stats, last_updated, page_status, follower count, latest 5 audit entries for this project.
2. **Public content** — name, slug, area, developer, public description, hawook_take, badges, tags. Editable in place by admins. Edits log to audit with severity='minor'.
3. **Structured data** — pricing, unit types, foreign quota, construction stage, payment plan, fees. Editable in place but each edit creates an `update_proposal` requiring re-approval. (For Phase 1, this can be a simpler version: edits go straight through with audit log. Re-approval pattern can be added in Phase 2 if needed.)
4. **Hawook Score** — internal-only view of the six dimensions, sub-scores, evidence notes, calculated total, badge tier. Editable here only by approvers. On save: recalculate score from dimensions, set badge from threshold, write audit entry.
5. **Updates** — chronological list of `project_updates` entries for this project.
6. **Media** — existing media admin page, now under this tab.
7. **Documents** — new section (built in Task 11).
8. **Followers** — count + anonymized list (name first letter + last letter, email domain only, e.g. "J***n at gmail.com").

### Navigation

Top-level nav on the admin view. Active tab highlighted. URL reflects tab: `/admin/projects/[slug]/overview`, `/admin/projects/[slug]/score`, etc.

### Definition of done

- Page renders with all 8 tabs.
- Each tab loads and displays correct content.
- Editable fields save correctly with audit log entries.
- Hawook Score edits recalculate score and badge automatically.
- Existing media tab continues to function as before.

---

## TASK 11 — Documents section in media admin

### What's needed

Sub-component on `/admin/projects/[slug]/documents` (or as a tab inside the project detail admin view from Task 10) that handles PDF and document uploads tagged by `document_type`.

### UI

For each `document_type` defined in Task 1.3:

- Section header with type name
- List of existing documents of that type (filename, version, uploaded_at, size, delete button)
- Upload button — accepts PDF, drops into Cloudinary via existing upload route (Task 2 from Tier 1 added auth check, so this is now safe to use), writes to `project_documents` table
- Per-document `is_gated` toggle (default: true for sales_presentation, brochure, price_list, payment_plan, foreign_quota_letter; false for floor_plan_set if public floor plans; admin choice for other)

### Definition of done

- All 8 document types each have a slot for upload.
- Upload writes to Cloudinary successfully and creates `project_documents` row.
- Documents render in admin view with correct metadata.
- Delete works (with confirmation modal).
- Public site can display gated documents only to authenticated users (verify with logged-out and logged-in test).

---

## TASK 12 — Cron jobs

### What's needed

Three scheduled jobs via Vercel Cron, configured in `vercel.json`.

### Jobs

**12.1 — Daily standard proposals digest**

- Schedule: `0 1 * * *` (8am Phuket = 1am UTC, year-round; verify against current Vercel cron syntax)
- Endpoint: `/api/cron/standard-proposals-digest`
- Logic:
  1. Query `update_proposals` where `status='pending_approval'` and `severity='standard'`.
  2. If zero results, exit (don't send empty digest).
  3. Render template #2 (Daily standard proposals digest).
  4. Send to each approver from `APPROVERS` array via `sendEmail`.
  5. Log execution.

**12.2 — Weekly minor proposals digest**

- Schedule: `0 2 * * 0` (9am Phuket Sunday = 2am UTC Sunday)
- Endpoint: `/api/cron/minor-proposals-digest`
- Logic: same pattern as 12.1 but for `severity='minor'`. Render template #3.

**12.3 — Stale project alert**

- Schedule: `0 2 * * *` (9am Phuket = 2am UTC daily)
- Endpoint: `/api/cron/stale-project-check`
- Logic:
  1. Query `projects` where `page_status='published'` and `last_updated < NOW() - INTERVAL '30 days'`.
  2. For each stale project, check if a stale alert was sent in the last 7 days (via a `notification_log` table or by checking `audit_log` for the stale-alert action).
  3. If not sent recently, render template #4 with project context and send to yogi@hawook.com.
  4. Log execution.

### Vercel cron config

Add to `vercel.json`:

```json
{
  "framework": "nextjs",
  "crons": [
    {
      "path": "/api/cron/standard-proposals-digest",
      "schedule": "0 1 * * *"
    },
    {
      "path": "/api/cron/minor-proposals-digest",
      "schedule": "0 2 * * 0"
    },
    {
      "path": "/api/cron/stale-project-check",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Auth on cron endpoints

Each cron endpoint must verify the request originates from Vercel Cron (check `Authorization: Bearer ${process.env.CRON_SECRET}` or use Vercel's cron auth). Reject unauthenticated requests with 401.

### Definition of done

- `vercel.json` updated with cron config.
- All three endpoints exist and have auth checks.
- Manual test of each endpoint produces expected output (force-trigger via admin debug button or curl with secret).
- Verify in Vercel dashboard that crons are scheduled and have run successfully.

---

## TASK 13 — Approval flow execution

### What's needed

The code that runs when an approver clicks "Approve" on a proposal. This is the single most security-critical code path in Phase 1 — it's where AI-proposed changes become live data.

### Logic

Function `executeApproval(proposalId, options)`:

1. Verify caller is an approver (server-side recheck, not just client auth).
2. Load proposal from `update_proposals` where `id = proposalId` and `status = 'pending_approval'`. If not found or wrong status, return error.
3. Validate the proposal:
   - For each field in `fields_changed`, verify the field exists on `target_table`.
   - Verify type compatibility between current value and proposed value.
   - For numeric fields, verify the soft-validation ranges (proposed change ≤ ±20% of current; if outside, ensure severity is `major`).
4. If `options.notification_hold === true`, set `related_update_entry.notify_followers = false`.
5. Begin Postgres transaction:
   a. Update the target table with the proposed fields. For example, if `target_table='projects'`, UPDATE projects SET ... WHERE slug=target_slug.
   b. If `related_update_entry` is present, INSERT into `project_updates` with the entry's values, setting `source_proposal_id = proposalId`.
   c. UPDATE `update_proposals` SET status='applied', reviewed_by=caller_user_id, reviewed_at=NOW(), applied_at=NOW(), review_notes=options.review_notes.
   d. INSERT into `audit_log` with action='approved' and metadata containing the diff.
6. Commit transaction.
7. If `severity='major'` and `notify_followers=true`: queue same-day notifications (Phase 3 work — for Phase 1, just log that notification would have triggered).
8. Return success.

On any error in step 5, ROLLBACK and mark proposal `status='failed'` with error in `review_notes`. Notify Codi via template (use a generic failure alert; can be a new ad-hoc template here).

### Major proposal alert trigger

Separately, when a new proposal is INSERTED with `severity='major'`, fire template #1 (Major proposal alert) to all approvers immediately.

Implementation: Supabase database trigger that calls a webhook to `/api/webhooks/major-proposal-created`, which then calls `sendEmail` with the rendered template.

Or, simpler: enforce this in the application code that creates proposals (which in Phase 2 will be Yogi's Claude via MCP). For Phase 1, the proposal-creation path doesn't exist yet (Yogi's Claude isn't built), so manually-inserted test proposals can be the test case for the alert trigger.

### Definition of done

- `executeApproval` function exists and is called from Task 8's API routes.
- Approving a test proposal correctly applies the change to the target table.
- `project_updates` entry created when proposal includes one.
- Proposal marked `applied` with timestamps.
- Audit log entry written.
- Soft-validation enforced on numeric fields.
- Failed approval correctly rolls back and marks proposal as `failed`.
- Manually-inserted major proposal triggers template #1 to Codi.

---

## TASK 14 — Phase 1 smoke test

After Tasks 1–13 are complete and deployed:

### 14.1 Database

- All new tables exist (`update_proposals`, `project_updates`, `project_documents`, `audit_log`).
- `projects` table has `last_updated`, `update_notes`, `page_status`.
- RLS verified anonymous-blocked on `update_proposals`, `audit_log`.

### 14.2 Email

- Test signup → receives template #6 (Welcome).
- Test form submission → user receives #7, Yogi receives #5.
- Manually insert major proposal → Codi receives #1.
- Force-trigger standard digest cron → Codi receives #2 (if any standard proposals pending) or nothing.
- Force-trigger stale-project cron → Yogi receives #4 for any stale projects.

### 14.3 Lead form

- Submit form on a project page as logged-out user.
- Verify lead row in `leads` table with correct fields, source='form_submission', stage='New'.
- Verify newsletter subscription (Beehiiv) if ticked.
- Verify spam honeypot rejects when filled.

### 14.4 GA4

- Real-time view shows pageviews.
- Custom event `lead_form_submitted` fires on form submission.
- Custom event `project_followed` fires on follow click.

### 14.5 Admin

- `/admin` shows 3 projects with new status column and dropdown.
- Toggle one project from draft to published. Verify it appears on public site.
- `/admin/queue` shows manually-inserted test proposals.
- Approve a test proposal → field updates correctly, audit entry created, project_updates entry created (if applicable).
- Reject a test proposal → marked rejected, audit entry created.
- `/admin/audit` shows all recent actions.
- `/admin/projects/[slug]` shows all 8 tabs with correct content.
- Documents upload works on project detail admin view.

### 14.6 Public site

- Project detail page renders with Hawook Recommended or Top Pick badge if score qualifies.
- Hawook's Take section renders.
- Verify in browser DevTools that `hawook_score` and `hawook_score_dimensions` are NOT in the API response.
- WhatsApp number is correct (+66 80 510 0129) everywhere.
- No Tally form remnants anywhere.

### Definition of done

All 6 smoke test categories pass. Document any failures in a markdown summary for handoff back to Codi.

---

## CONSTRAINTS

- Do not add new dependencies beyond Resend SDK and gtag.js unless absolutely required.
- Do not modify Tier 1 work except where this brief explicitly extends it.
- Do not start work on AI Concierge (Phase 3), MCP server, or notification crons for users (Phase 3). Stop at the scope boundary.
- All schema changes additive — no DROP, no renames, no destructive migrations.
- Test in a Supabase branch first if available; otherwise be careful with RLS policies.
- Match existing code style (no src/ directory, hand-rolled Tailwind, TypeScript).
- Email templates must match Email Templates v1.0 verbatim. Voice is locked. No paraphrasing.
- Founder approval required before pushing to production for: page status toggle behaviour, badge styling, any UI-visible copy change beyond what's in this brief.

---

## REPORTING BACK

After each session and after final Phase 1 completion, output a markdown summary covering:

1. What was completed (one line per task).
2. Any deviations from this brief and reasoning.
3. Smoke test results.
4. Any issues discovered (security, performance, UX).
5. Items to add to a follow-up brief.

That summary goes to Codi for review before the next session begins.

---

**End of Tier 2 Phase 1 Cowork Brief.**

*Phase 2 brief (Yogi's Claude + Supabase MCP setup) and Phase 3 brief (AI Concierge + user notification system) will be written when Phase 1 is complete and validated.*
