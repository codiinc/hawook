import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/admin'

export const runtime = 'nodejs'

const VALID_TYPES = new Set([
  'sales_presentation', 'brochure', 'price_list', 'payment_plan',
  'foreign_quota_letter', 'floor_plan_set', 'spa_template', 'other',
])

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { project_id, document_type, cloudinary_url, cloudinary_public_id, filename, file_size_bytes, version, is_gated } = body

  if (!project_id || !document_type || !cloudinary_url) {
    return NextResponse.json({ error: 'project_id, document_type, cloudinary_url required' }, { status: 400 })
  }

  if (!VALID_TYPES.has(document_type as string)) {
    return NextResponse.json({ error: 'Invalid document_type' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('project_documents')
    .insert({
      project_id,
      document_type,
      cloudinary_url,
      cloudinary_public_id: cloudinary_public_id ?? null,
      filename: filename ?? null,
      file_size_bytes: file_size_bytes ?? null,
      version: version ?? null,
      is_gated: is_gated !== false, // default true
      uploaded_by: user!.id,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: (data as Record<string, unknown>).id }, { status: 201 })
}
