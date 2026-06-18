import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isApprover } from '@/lib/approvers'
import ScoreForm from './ScoreForm'

type Props = { params: Promise<{ slug: string }> }

type DimKey = 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6'
type Dim = { score: number | null; evidence: string }

const DEFAULT_DIMS: Record<DimKey, Dim> = {
  d1: { score: null, evidence: '' },
  d2: { score: null, evidence: '' },
  d3: { score: null, evidence: '' },
  d4: { score: null, evidence: '' },
  d5: { score: null, evidence: '' },
  d6: { score: null, evidence: '' },
}

function parseDims(raw: unknown): Record<DimKey, Dim> {
  if (!raw || typeof raw !== 'object') return DEFAULT_DIMS
  const obj = raw as Record<string, unknown>
  const dims = { ...DEFAULT_DIMS }
  for (const key of ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'] as DimKey[]) {
    const d = obj[key] as Record<string, unknown> | undefined
    if (d) {
      dims[key] = {
        score: d.score != null ? Number(d.score) : null,
        evidence: typeof d.evidence === 'string' ? d.evidence : '',
      }
    }
  }
  return dims
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: `Hawook Score — ${slug} | Admin` }
}

export default async function ScorePage({ params }: Props) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userIsApprover = isApprover(user?.email)

  const { data } = await supabaseAdmin
    .from('projects')
    .select('hawook_score_dimensions')
    .eq('slug', slug)
    .single()

  if (!data) notFound()
  const raw = data as Record<string, unknown>

  const dims = parseDims(raw.hawook_score_dimensions)

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-900">Hawook Score</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Internal only — never exposed publicly.
          {!userIsApprover && ' View-only for non-approver admins.'}
        </p>
      </div>
      <ScoreForm
        slug={slug}
        initialDims={dims}
        isEditable={userIsApprover}
      />
    </div>
  )
}
