# HAWOOK — EMAIL TEMPLATES v1.0

**Version:** 1.0
**Date:** 16 June 2026
**Status:** Plain text v1.0 — branded HTML versions to be added in v1.1
**Owners:** Founder (approval), Yogi (operational maintenance)
**Companion to:** Voice & Knowledge Base v1.0, Lead Handling Playbook v1.0, Content Ops Spec v1.0
**Sent via:** Resend (transactional), Beehiiv (newsletter)

---

## INDEX

**Team-facing (sent to Codi / approvers)**

1. [Major proposal alert](#1-major-proposal-alert) — real-time
2. [Daily standard proposals digest](#2-daily-standard-proposals-digest)
3. [Weekly minor proposals digest](#3-weekly-minor-proposals-digest)
4. [Stale project alert](#4-stale-project-alert)
5. [New lead alert (to Yogi)](#5-new-lead-alert-to-yogi) — real-time

**Buyer-facing (sent to leads/users)**

6. [Welcome email (after signup)](#6-welcome-email-after-signup)
7. [Lead acknowledgment (after form submit)](#7-lead-acknowledgment-after-form-submit)
8. [AI Concierge handoff confirmation](#8-ai-concierge-handoff-confirmation)
9. [Same-day major update notification](#9-same-day-major-update-notification)
10. [Weekly digest — followed projects](#10-weekly-digest--followed-projects)
11. [Re-engagement — cold lead with project update](#11-re-engagement--cold-lead-with-project-update)
12. [Viewing confirmation](#12-viewing-confirmation)
13. [48-hour viewing reminder](#13-48-hour-viewing-reminder)
14. [Post-viewing follow-up](#14-post-viewing-follow-up)

---

## GUIDELINES FOR ALL TEMPLATES

Before using any template, the AI or human sender confirms:

- **From name and address:** Buyer-facing emails from `Hawook <hello@hawook.com>` unless otherwise noted. Team-facing from `Hawook System <system@hawook.com>`. Personal follow-ups from `Yogi at Hawook <yogi@hawook.com>` or `Codi at Hawook <codi@hawook.com>` — never a generic system address.
- **Subject lines:** Specific, not generic. "Updates on Adora Rawai this week" not "Your weekly Hawook digest." "Adora pricing just changed" not "Important property update."
- **Length:** Most reads on phone. Default short. Open with the reason for the email; main message in the first paragraph.
- **Voice:** Per Voice & Knowledge Base — no agency hype, no "luxury/exclusive/premium," no "don't hesitate to reach out."
- **One clear next step.** Every buyer-facing email ends with one action — not three.
- **Unsubscribe link** required on every buyer-facing email except viewing confirmations and direct reply chains.

Each template uses `{{variable}}` for substitution. Variables are listed under each template.

---

## TEAM-FACING TEMPLATES

### 1. Major proposal alert

Triggered when Claude submits a `severity=major` proposal to the queue. Real-time, within minutes of submission.

```
From: Hawook System <system@hawook.com>
To: {{approver_email}}
Subject: Major proposal: {{target_name}} — {{change_summary}}

A major proposal needs your review.

Project: {{target_name}}
Change: {{change_summary}}
Submitted by: {{proposed_by}}
Source: {{source_type}}

{{#if discrepancy_flag}}
⚠️ Discrepancy flagged: {{discrepancy_note}}
{{/if}}

Review and approve:
{{queue_url}}

Time-to-review target: 4 hours (Phuket business hours).

—
Hawook System
This email is sent automatically when a major-severity update is proposed. To adjust alert preferences, edit lib/approvers.ts or update your settings at {{settings_url}}.
```

**Variables:**
- `approver_email`, `target_name` (e.g. "Adora Rawai"), `change_summary` (e.g. "1BR price up 3% from ฿4.5M to ฿4.635M"), `proposed_by` (e.g. "Yogi"), `source_type` (e.g. "WhatsApp message"), `discrepancy_flag` (bool), `discrepancy_note`, `queue_url`, `settings_url`

---

### 2. Daily standard proposals digest

Sent once daily (8am Phuket time) if any `severity=standard` proposals are pending review. Skipped if queue is empty.

```
From: Hawook System <system@hawook.com>
To: {{approver_email}}
Subject: {{pending_count}} proposals pending review

You have {{pending_count}} standard-severity proposals waiting in the queue.

{{#each proposals}}
• {{target_name}}: {{change_summary}} — submitted {{relative_time}} by {{proposed_by}}
{{/each}}

Review queue:
{{queue_url}}

Target: review within 48 hours of submission.

—
Hawook System
```

**Variables:** `approver_email`, `pending_count`, `proposals` (array of {target_name, change_summary, relative_time, proposed_by}), `queue_url`

---

### 3. Weekly minor proposals digest

Sent Sunday morning (9am Phuket time) if any `severity=minor` proposals are pending. Skipped if queue is empty.

```
From: Hawook System <system@hawook.com>
To: {{approver_email}}
Subject: Weekly review — {{pending_count}} minor proposals

Minor proposals pending review from the past week.

{{#each proposals}}
• {{target_name}}: {{change_summary}} ({{proposed_date}})
{{/each}}

Bulk-approve or review individually:
{{queue_url}}

—
Hawook System
```

**Variables:** `approver_email`, `pending_count`, `proposals` (array), `queue_url`

---

### 4. Stale project alert

Sent to Yogi when the system detects a listed project hasn't had a `project_updates` entry in 30+ days. One alert per stale project per week max.

```
From: Hawook System <system@hawook.com>
To: yogi@hawook.com
Subject: Stale project — {{project_name}} ({{days_stale}} days)

{{project_name}} hasn't had an update in {{days_stale}} days.

Last known status:
{{last_known_status}}

Suggested action: reach out to {{developer_name}} for current pricing, foreign quota status, and construction stage. Then run the response through Claude to propose updates.

Project admin:
{{project_admin_url}}

—
Hawook System
```

**Variables:** `project_name`, `days_stale`, `last_known_status`, `developer_name`, `project_admin_url`

---

### 5. New lead alert (to Yogi)

Sent in real-time when a lead is created via form or AI Concierge. Yogi's first signal that someone needs follow-up.

```
From: Hawook System <system@hawook.com>
To: yogi@hawook.com
Subject: New lead — {{lead_name}} ({{lead_source}})

A new lead just came in.

Name: {{lead_name}}
Email: {{lead_email}}
WhatsApp: {{lead_whatsapp}}
Source: {{lead_source}}
Project: {{lead_project_context}}
Budget: {{lead_budget}}
Timeframe: {{lead_timeframe}}
Identifies as: {{lead_persona}}

{{#if ai_concierge_context}}
What they asked the Concierge:
{{ai_concierge_summary}}

Scheduling info gathered:
{{scheduling_context}}
{{/if}}

SLA: respond within 1 hour (Phuket business hours), 4 hours outer bound.

Open lead in CRM:
{{lead_url}}

—
Hawook System
```

**Variables:** `lead_name`, `lead_email`, `lead_whatsapp`, `lead_source` (form_submission | ai_concierge | newsletter | referral), `lead_project_context`, `lead_budget`, `lead_timeframe`, `lead_persona`, `ai_concierge_context` (bool), `ai_concierge_summary`, `scheduling_context`, `lead_url`

**Channel:** Email plus optional WhatsApp ping for major-budget leads (>20M THB) — both fire.

---

## BUYER-FACING TEMPLATES

### 6. Welcome email (after signup)

Sent immediately after a new user completes signup. Sets expectations.

```
From: Hawook <hello@hawook.com>
To: {{user_email}}
Subject: Welcome to Hawook

Hi {{user_first_name}},

Thanks for signing up — you're now set to follow projects, unlock full pricing and floor plans, and get notified when there's something worth knowing.

What's worth doing first:

Follow a few projects you're interested in. We send a weekly digest with anything that's changed — pricing, foreign quota, construction milestones, new floor plans. If something major happens on a project you follow, you'll get a same-day note rather than waiting for the digest.

If you have a specific budget, area, or timeframe in mind, hit reply and tell me. I'll send a personal shortlist of projects that fit — the curated version rather than browsing the whole site.

A note on what we do: Hawook is a curated property platform. We list around ten projects per area, not every project. Each one we've signed an agency agreement with, done full diligence on, and decided we'd buy ourselves. So if it's on the site, it cleared our bar.

Have a look around:
{{projects_url}}

Any questions, just reply.

— Yogi at Hawook
```

**Variables:** `user_email`, `user_first_name`, `projects_url`

**Notes:** Yogi is the named sender for warmth. Reply-to is yogi@hawook.com. The "hit reply" CTA is intentional — we want early engagement.

---

### 7. Lead acknowledgment (after form submit)

Sent immediately after the native lead capture form is submitted on a project page.

```
From: Hawook <hello@hawook.com>
To: {{lead_email}}
Subject: Got it — let's get you the details on {{project_name}}

Hi {{lead_first_name}},

Thanks for the message. I've got your details and I'm pulling together the full pricing, floor plans, and current availability for {{project_name}}. You'll have those in your inbox within the next hour during Phuket business hours — sooner if I'm at my desk.

A couple of things while you wait:

Your dashboard now shows {{project_name}} in your followed projects, so you'll get notified if anything changes — pricing, foreign quota, construction milestone, that kind of thing.

If you want to chat anything through, my WhatsApp is {{yogi_whatsapp}}, or just reply to this email. Tell me what's drawing you to {{project_name}} and what your timeline looks like — that helps me make sure I'm pointing you at the right unit type and floor.

Speak soon.

— Yogi at Hawook
{{dashboard_url}}
```

**Variables:** `lead_email`, `lead_first_name`, `project_name`, `yogi_whatsapp`, `dashboard_url`

**Notes:** Sets a 1-hour response SLA expectation. Asks open question to draw out qualification details. Channel choice offered (WhatsApp or email).

---

### 8. AI Concierge handoff confirmation

Sent when the AI Concierge gathers a buyer's situational context and creates a handoff record. Confirms to the buyer that a human will follow up.

```
From: Hawook <hello@hawook.com>
To: {{lead_email}}
Subject: Thanks for the chat — Yogi will be in touch on {{project_name}}

Hi {{lead_first_name}},

Thanks for chatting with the Hawook Concierge. I've passed everything across to Yogi (or Codi for some specifics) — they'll come back to you {{response_window}} on {{preferred_channel}}.

What they'll have when they reach out:
- The full picture of what you've asked about
- The scheduling preferences you shared ({{scheduling_summary}})
- Your timezone ({{user_timezone}}) so we'll work to your hours

In the meantime, your dashboard now has {{project_name}} (and any others you've looked at). You'll get weekly updates by default, with a same-day note if anything major changes.

If you want to add anything before Yogi gets back to you, just reply.

— Hawook Concierge
{{dashboard_url}}
```

**Variables:** `lead_email`, `lead_first_name`, `project_name`, `response_window` (e.g. "within 4 hours during Phuket business hours"), `preferred_channel`, `scheduling_summary`, `user_timezone`, `dashboard_url`

**Notes:** The AI Concierge signs off as itself, not pretending to be Yogi or Codi. Reinforces the AI-honest framing locked in the Concierge spec.

---

### 9. Same-day major update notification

Sent within 4 hours of a `severity=major` `project_updates` entry being approved. Only goes to qualified+ leads (Engaged, Qualified, Considering, Reserved) following the project, per the notification rules.

```
From: Hawook <hello@hawook.com>
To: {{lead_email}}
Subject: {{project_name}} — {{change_headline}}

Hi {{lead_first_name}},

Quick note on {{project_name}} since you're following it.

{{update_summary}}

What this means for you:

{{contextual_implication}}

Full project page:
{{project_url}}

If you want to talk this through, my WhatsApp is {{yogi_whatsapp}}, or just reply.

— Yogi at Hawook
```

**Variables:** `lead_email`, `lead_first_name`, `project_name`, `change_headline` (e.g. "Pricing up 3% from Monday"), `update_summary` (the public summary text from the project_updates entry), `contextual_implication` (one sentence — e.g. "If you were considering a 1-bedroom, the increase is most pronounced there. The 2-bedroom uplift is similar."), `project_url`, `yogi_whatsapp`

**Notes:** `contextual_implication` is the value-add — generic "pricing has changed" emails get ignored. The one-sentence interpretation is what makes it useful. Drafted by Claude alongside the project_updates entry; reviewed by Codi on approval.

---

### 10. Weekly digest — followed projects

Sent Sunday morning Phuket time. Consolidates all updates across followed projects for each user. Sent to everyone following at least one project, including Cold leads (per notification rules). Skipped if zero updates across all their followed projects that week.

```
From: Hawook <hello@hawook.com>
To: {{user_email}}
Subject: {{week_descriptor}} — what changed on your followed projects

Hi {{user_first_name}},

Here's what moved this week on the projects you're following.

{{#each projects_with_updates}}
{{project_name}}
{{#each updates}}
- {{update_summary}}
{{/each}}
See full update: {{project_url}}

{{/each}}

{{#if newsletter_top_story}}
From the Hawook newsletter this week:
{{newsletter_title}}
{{newsletter_summary}}
Read: {{newsletter_url}}
{{/if}}

{{#if suggested_project}}
You might also be interested in:
{{suggested_project_name}} — {{suggested_project_one_liner}}
{{suggested_project_url}}
{{/if}}

Any questions on anything you see, just reply.

— Yogi at Hawook

—
You're receiving this because you follow projects on Hawook. Adjust notification settings: {{settings_url}} | Unsubscribe: {{unsubscribe_url}}
```

**Variables:** `user_email`, `user_first_name`, `week_descriptor` (e.g. "This week on Hawook"), `projects_with_updates` (array of {project_name, project_url, updates: [{update_summary}]}), `newsletter_top_story` (bool), `newsletter_title`, `newsletter_summary`, `newsletter_url`, `suggested_project` (bool), `suggested_project_name`, `suggested_project_one_liner`, `suggested_project_url`, `settings_url`, `unsubscribe_url`

**Notes:** Newsletter top story is pulled from Beehiiv API at send time. Suggested project is from the lead activity matching logic (Tier 3). For v1, omit the "suggested project" block if matching logic isn't built yet.

---

### 11. Re-engagement — cold lead with project update

Sent to Cold leads (30+ days since last response) who follow a project that just had a major update. One re-engagement attempt per cold lead per project per 60 days max.

```
From: Hawook <hello@hawook.com>
To: {{lead_email}}
Subject: {{project_name}} — {{change_headline}}

Hi {{lead_first_name}},

It's been a while, hope all's well. Just a quick note on {{project_name}} since you'd looked at it earlier — something worth flagging.

{{update_summary}}

If your timing has shifted and Phuket is back on your radar, happy to send the current full pricing, floor plans, and any of the gated stuff you didn't get to last time. Just reply.

If not, no worries — I'll keep you in the loop on anything else worth knowing.

— Yogi at Hawook
{{project_url}}

—
Adjust notification settings: {{settings_url}} | Unsubscribe: {{unsubscribe_url}}
```

**Variables:** Same as #9 plus `settings_url`, `unsubscribe_url`

**Notes:** Lower-pressure than the same-day major alert. Explicitly leaves the door for them to stay quiet without feeling chased.

---

### 12. Viewing confirmation

Sent immediately when a viewing is booked.

```
From: Hawook <hello@hawook.com>
To: {{lead_email}}
Subject: Viewing booked — {{project_name}} on {{viewing_date}}

Hi {{lead_first_name}},

You're set for {{project_name}} on {{viewing_date}} at {{viewing_time}}.

{{viewing_team_member}} will meet you at {{viewing_location}} (Google Maps: {{map_url}}). If you're driving, parking is at {{parking_note}}; if you'd like a pickup from your hotel, let me know and we'll arrange.

What to bring:
- Passport (the developer registers visitors at the sales gallery — quick formality, doesn't commit you to anything)
- Any questions you've written down

What you'll see:
{{viewing_what_to_expect}}

Plan for about 90 minutes including the drive to the actual unit. Sometimes longer if you want to look at multiple unit types.

If you need to reschedule, hit reply or WhatsApp me on {{yogi_whatsapp}}.

— Yogi at Hawook
```

**Variables:** `lead_email`, `lead_first_name`, `project_name`, `viewing_date`, `viewing_time`, `viewing_team_member`, `viewing_location`, `map_url`, `parking_note`, `viewing_what_to_expect` (2–3 sentences specific to that project — model unit available, completed phase to walk through, etc.), `yogi_whatsapp`

---

### 13. 48-hour viewing reminder

Sent 48 hours before the viewing.

```
From: Hawook <hello@hawook.com>
To: {{lead_email}}
Subject: Reminder — {{project_name}} viewing on {{viewing_day}}

Hi {{lead_first_name}},

Quick reminder you're seeing {{project_name}} on {{viewing_day}} at {{viewing_time}}. Meeting point at {{viewing_location}}: {{map_url}}

Latest pricing sheet attached in case you want to look it over beforehand — sometimes easier to walk into a viewing with the numbers already in your head.

A few questions buyers usually ask at this stage — happy to answer beforehand or save for the viewing:
- What's currently available in your budget range
- Foreign quota status for this project
- Payment plan and what's due when
- Realistic rental yield expectations if relevant

Anything else you want covered, just reply.

— Yogi at Hawook
```

**Variables:** `lead_email`, `lead_first_name`, `project_name`, `viewing_day`, `viewing_time`, `viewing_location`, `map_url`

**Notes:** Attachment is the latest project pricing PDF, generated by the admin system at send time.

---

### 14. Post-viewing follow-up

Sent within 4 hours of viewing ending.

```
From: Hawook <hello@hawook.com>
To: {{lead_email}}
Subject: How was {{project_name}}?

Hi {{lead_first_name}},

Hope today went well at {{project_name}}.

Sending through what was discussed:
- Full pricing for the units you looked at: attached
- Availability as of today: {{availability_note}}
{{#if specific_unit_interest}}
- Floor plan for {{specific_unit}}: attached
{{/if}}

If anything came up during the viewing that you want to dig into — financing, payment plan, the area more broadly, comparison with anything else — happy to answer over email, WhatsApp, or a call at a time that suits you.

Otherwise, take your time. There's no rush from our end. When you're ready for next steps, just say.

— Yogi at Hawook
```

**Variables:** `lead_email`, `lead_first_name`, `project_name`, `availability_note` (e.g. "1BR units 2 and 5 still available; 2BR D-type confirmed sold today"), `specific_unit_interest` (bool), `specific_unit`

**Notes:** "No rush from our end" is intentional Hawook positioning — separates from agencies who push at post-viewing.

---

## TEMPLATE MAINTENANCE

### Approval and versioning

Every template change requires Founder approval. Yogi proposes via the Feedback Log in the Voice & Knowledge Base; Founder reviews monthly and updates this document with version bumps.

### v1.1 plans (not in scope for v1.0)

- Branded HTML versions of all buyer-facing templates
- A/B testing infrastructure on subject lines (post-100 sends)
- Localized versions for non-English speaking buyer markets (Russian, Mandarin, German) — translation via Claude with native-speaker review
- Dynamic content blocks driven by lead stage (e.g. different post-viewing email for "Considering" vs "Reserved")
- Beehiiv-formatted snippet versions of the weekly digest (for cross-posting digest summaries on the newsletter)

### Suppression rules

- Any user who unsubscribes from any buyer-facing email is suppressed from all future buyer-facing emails (transactional viewing confirmations are the only exception, and only if there's an active booking).
- Cold leads receive at most 3 re-engagement attempts before being moved to newsletter-only.
- Dead leads receive newsletter only.
- Major event notifications skip Cold and Dead leads even on followed projects (newsletter delivers the info instead).

### Changelog

| Version | Date | Notes |
|---|---|---|
| 1.0 | 2026-06-16 | Initial 14 templates. Plain text only. |

---

**End of Email Templates v1.0.**

*Every template was drafted in alignment with the Voice & Knowledge Base v1.0. Deviations require Founder approval and feedback log entry.*
