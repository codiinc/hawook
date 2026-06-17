import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isApprover } from '@/lib/approvers'

export const runtime = 'nodejs'

type Params = { params: Promise<{ slug: string }> }

type DimKey = 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6'
type ScoreDimension = { score: number | null; evidence: string | null }
type ScoreDimensions = Record<DimKey, ScoreDimension>

const WEIGHTS: Record<DimKey, number> = {
  d1: 0.25, d2: 0.20, d3: 0.15, d4: 0.15, d5: 0.15, d6: 0.10,
}

function calculateScore(dims: ScoreDimensions): number | null {
  let total = 0
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const d = dims[key as DimKey]
    if (d.score == null) return null
    total += d.score * weight
  }
  return Math.round(total * 10) / 10
}

function getBadge(score: number | null): string | null {
  if (score == null) return null
  if (score >= 9.0) return 'top_pick'
  if (score >= 8.0) return 'recommended'
  return null
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!isApprover(user?.email)) {
    return NextResponse.json({ error: 'Approver access required' }, { status: 403 })
  }

  const { slug } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const dims = body.dimensions as ScoreDimensions | undefined
  if (!dims) {
    return NextResponse.json({ error: 'dimensions required' }, { status: 400 })
  }

  // Validate scores are 1-10 where provided
  for (const [key, dim] of Object.entries(dims)) {
    if (dim.score != null && (dim.score < 1 || dim.score > 10)) {
      return NextResponse.json({ error: `Score for ${key} must be 1–10` }, { status: 400 })
    }
  }

  const { data: project, error: fetchError } = await supabaseAdmin
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .single()

  if (fetchError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const totalScore = calculateScore(dims)
  const badge = getBadge(totalScore)

  const { error: updateError } = await supabaseAdmin
    .from('projects')
    .update({
      hawook_score_dimensions: dims,
      hawook_score: totalScore,
      hawook_badge: badge,
      last_updated: new Date().toISOString(),
    })
    .eq('slug', slug)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const raw = project as Record<string, unknown>
  await supabaseAdmin.from('audit_log').insert({
    actor_id: user!.id,
    actor_email: user!.email,
    action: 'direct_edit',
    target_table: 'projects',
    target_record_id: raw.id as string,
    target_slug: slug,
    summary: `Hawook Score updated: ${totalScore ?? 'incomplete'} → badge: ${badge ?? 'none'}`,
    metadata: { hawook_score: totalScore, hawook_badge: badge, severity: 'minor' },
  })

  return NextResponse.json({ ok: true, hawook_score: totalScore, hawook_badge: badge })
}
