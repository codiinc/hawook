import type { Metadata } from 'next'
import MarkdownContent from '@/components/MarkdownContent'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Hawook collects, uses, and protects your personal data.',
  alternates: { canonical: 'https://app.hawook.com/privacy' },
}

const content = `
# Privacy Policy

**Effective date:** 18 June 2026
**Last updated:** 18 June 2026

Hawook (The Chokdee Group Co., Ltd) operates app.hawook.com and hawook.com (together, "the Hawook platform"). This Privacy Policy explains what personal information we collect, how we use it, who we share it with, and the rights you have over your data.

We've drafted this policy to comply with Thailand's Personal Data Protection Act (PDPA, B.E. 2562 / 2019) and to reflect global good practice including the EU General Data Protection Regulation (GDPR) for visitors from those jurisdictions.

If you have questions about this policy or your data, contact us at hello@hawook.com.

## 1. What we collect

We collect the following categories of personal information:

**Information you provide directly:**
- Name and contact details when you sign up for an account, submit a lead form, or contact us via email, WhatsApp, or phone
- Purchase criteria you share: budget range, timeframe, areas of interest, persona (e.g., owner-occupier or investor), unit-type preferences
- Messages and questions you send us
- Authentication details (email address, hashed password — we never see or store your plain-text password)

**Information we collect automatically:**
- Pages you visit on the Hawook platform, including timing and frequency
- IP address, approximate location (country/city), device type, browser
- Referring website or campaign source
- How you interact with the platform: projects viewed, projects followed, content unlocked, form submissions
- Cookies and similar technologies — see Section 6 below

**Information from third parties:**
- If you sign up via Google or another single sign-on provider in the future, basic identity confirmation from that provider
- If you respond to a marketing email or newsletter, engagement data from our email infrastructure (Resend, Beehiiv)

## 2. Why we collect it

We use your personal information for:

- Operating the Hawook platform and providing you the service you signed up for (browsing projects, saving favourites, receiving project updates)
- Responding to your enquiries and helping you find suitable property
- Sending you transactional emails (welcome messages, account confirmations, replies to your enquiries, project update notifications you've subscribed to)
- Improving the platform — understanding which projects, content, and features users find valuable
- Marketing communications (only with your explicit opt-in for our newsletter; you can unsubscribe at any time)
- Complying with legal obligations under Thai law, including record-keeping requirements applicable to licensed property brokerages

## 3. Who we share it with

We share your personal information with:

**Service providers who help us run the platform**, including:
- Supabase (database hosting, authentication)
- Vercel (web hosting, content delivery)
- Cloudinary (image and document hosting)
- Resend (transactional email delivery)
- Beehiiv (newsletter delivery — only if you've opted in)
- Google Analytics (anonymised usage analytics — only if you consent via our cookie banner)

Each of these providers handles your data on our behalf under their own contractual and legal obligations. We choose providers that meet reasonable data protection standards.

**Developers and partners involved in your specific enquiry.** If you express interest in a particular project, we may share relevant details with the developer's sales team or our partner broker to coordinate viewings, share pricing, or schedule meetings. We only share what's necessary for your enquiry and never share data unrelated to your interest.

**Authorities, when required by law.** We will share data with Thai authorities or other regulators if required by law, court order, or to protect our legal rights.

**A future buyer or successor to Hawook.** If Hawook is ever acquired, merged, or restructured, your data may be transferred as part of that transaction. We'll notify you in advance if this happens.

We do not sell your personal information to anyone for marketing or any other purpose.

## 4. How long we keep it

We keep your personal information for as long as:

- You have an active Hawook account, plus a reasonable retention period for legal and operational purposes (typically 7 years after account closure, to comply with Thai brokerage record-keeping requirements)
- Active lead enquiry data: retained while we're actively responding to your enquiry plus 3 years after the enquiry concludes, then archived
- Marketing data: retained while you're opted in to our newsletter; removed within 30 days of unsubscribe
- Analytics data: retained anonymously per Google Analytics defaults (typically 14 months)

You can request earlier deletion at any time (see Section 7).

## 5. Where your data is stored

Your data is stored on services operated by our hosting providers, primarily in:
- Supabase: Singapore region (ap-southeast-1)
- Vercel: global edge network, with primary processing in the United States
- Cloudinary: distributed globally
- Resend, Beehiiv, Google Analytics: as per each provider's infrastructure

By using the Hawook platform, you acknowledge that your data may be processed outside Thailand, including in jurisdictions whose data protection laws may differ from Thailand's PDPA. We take reasonable steps to ensure your data is protected wherever it's processed.

## 6. Cookies

We use cookies and similar technologies to:

- Keep you signed in to your account (essential cookies)
- Remember your preferences (essential cookies)
- Measure how visitors use the platform (analytics cookies, only with your consent)

We do not use cookies for cross-site tracking or third-party advertising.

When you first visit the Hawook platform, you'll see a cookie consent banner. You can accept analytics cookies or decline them; essential cookies are always required for the platform to work and don't require consent.

You can change your cookie preferences at any time via the cookie settings link in our footer, or directly in your browser settings.

## 7. Your rights

Under the Thai PDPA (and, where applicable, the GDPR), you have the right to:

- **Access** the personal information we hold about you
- **Correct** information that is wrong or out of date
- **Delete** your information ("right to erasure"), subject to legal retention requirements
- **Restrict** how we use your information in certain circumstances
- **Port** your information to another service in a structured format
- **Object** to certain uses of your information, including marketing
- **Withdraw consent** for any use of your data that we do based on consent (e.g., newsletter subscription, analytics cookies)
- **Complain** to a data protection authority — in Thailand, the Personal Data Protection Committee (PDPC), or in your home jurisdiction's equivalent

To exercise any of these rights, email hello@hawook.com with your request. We'll respond within 30 days.

## 8. Security

We protect your data using reasonable technical and organisational measures, including:

- Encryption in transit (HTTPS/TLS) for all platform traffic
- Encryption at rest for data stored in our database
- Access controls limiting which Hawook team members can see what data
- Authentication via secure providers and best-practice password hashing
- Regular review of who has access to what, including offboarding when team members change roles

No system is perfectly secure. If a breach affecting your data occurs, we'll notify you within 72 hours and report it to relevant authorities as required by law.

## 9. Children

The Hawook platform is intended for adults considering property purchases. We don't knowingly collect data from anyone under 18. If we learn we've inadvertently collected data from a minor, we'll delete it promptly.

## 10. Changes to this policy

We may update this policy from time to time. Material changes will be communicated by email to registered users and via a banner on the platform. The "Last updated" date at the top of this policy will always reflect the most recent revision. Continued use of the Hawook platform after a change indicates acceptance of the revised policy.

## 11. Contact

For privacy questions, data requests, or complaints:

Email: hello@hawook.com
WhatsApp: +66 80 510 0129
Postal: 31/14 Moo 1, Rawai, Phuket, 83100

Data Protection Officer (DPO): Codi Mansbridge
`

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <MarkdownContent content={content} />
      <div className="mt-10 border border-gray-200 rounded-lg bg-gray-50 px-5 py-4">
        <p className="text-sm text-gray-500 italic leading-relaxed">
          This document is a draft and must be reviewed by a Thai-qualified lawyer before being published as the binding privacy policy of a live brokerage business. It is not legal advice.
        </p>
      </div>
    </div>
  )
}
