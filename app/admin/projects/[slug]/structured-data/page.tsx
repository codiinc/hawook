import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import StructuredDataForm from './StructuredDataForm'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: `Structured Data — ${slug} | Admin` }
}

export default async function StructuredDataPage({ params }: Props) {
  const { slug } = await params

  const { data } = await supabaseAdmin
    .from('projects')
    .select('status, price_min, price_max, unit_types, total_units, floors, foreign_quota_available, foreign_quota_units_remaining, construction_status, handover_date, ownership_type, cam_fee_thb_sqm, sinking_fund_thb_sqm, rental_program_available, rental_yield_claim, payment_plan')
    .eq('slug', slug)
    .single()

  if (!data) notFound()
  const raw = data as Record<string, unknown>

  const str = (k: string): string => {
    const v = raw[k]
    if (v == null) return ''
    return String(v)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-900">Structured data</h2>
        <p className="text-xs text-gray-400 mt-0.5">Edits save directly and are logged to the audit log.</p>
      </div>
      <StructuredDataForm
        slug={slug}
        initial={{
          status: str('status'),
          price_min: str('price_min'),
          price_max: str('price_max'),
          unit_types: str('unit_types'),
          total_units: str('total_units'),
          floors: str('floors'),
          foreign_quota_available: raw.foreign_quota_available != null ? String(raw.foreign_quota_available) : 'true',
          foreign_quota_units_remaining: str('foreign_quota_units_remaining'),
          construction_status: str('construction_status'),
          handover_date: str('handover_date'),
          ownership_type: str('ownership_type'),
          cam_fee_thb_sqm: str('cam_fee_thb_sqm'),
          sinking_fund_thb_sqm: str('sinking_fund_thb_sqm'),
          rental_program_available: raw.rental_program_available != null ? String(raw.rental_program_available) : 'false',
          rental_yield_claim: str('rental_yield_claim'),
          payment_plan: str('payment_plan'),
        }}
      />
    </div>
  )
}
