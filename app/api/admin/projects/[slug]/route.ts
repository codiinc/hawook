import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/admin'

export const runtime = 'nodejs'

type Params = { params: Promise<{ slug: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
  }

  const { slug } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { fields, operation } = body as {
    fields: Record<string, unknown>
    operation?: 'set' | 'append_array' | 'remove_from_array'
  }

  if (!fields || typeof fields !== 'object') {
    return NextResponse.json({ error: 'fields required' }, { status: 400 })
  }

  if (operation === 'append_array') {
    // For each array field, fetch current value and append
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select(Object.keys(fields).join(', '))
      .eq('slug', slug)
      .single()

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    const row = project as unknown as Record<string, unknown>

    const merged: Record<string, unknown[]> = {}
    for (const [key, newValues] of Object.entries(fields)) {
      const existing = (Array.isArray(row[key]) ? row[key] as unknown[] : [])
      merged[key] = [...existing, ...(Array.isArray(newValues) ? newValues : [newValues])]
    }

    const { error } = await supabaseAdmin
      .from('projects')
      .update(merged)
      .eq('slug', slug)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, updated: merged })
  }

  if (operation === 'remove_from_array') {
    // fields: { gallery_urls: 'url-to-remove', gallery_types: 'cloudinary' }
    // We pass { field: value_to_remove } and the index must match in paired arrays
    const fieldName = Object.keys(fields)[0] as string
    const valueToRemove = fields[fieldName] as unknown
    const indexField = (body as Record<string, unknown>).index_field as string | undefined

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('gallery_urls, gallery_types, floorplan_urls, video_urls')
      .eq('slug', slug)
      .single()

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    const row = project as unknown as Record<string, unknown>

    // Find index of the value to remove
    const arr = (Array.isArray(row[fieldName]) ? row[fieldName] as unknown[] : [])
    const idx = arr.indexOf(valueToRemove)
    if (idx === -1) return NextResponse.json({ ok: true, message: 'Not found, nothing removed' })

    const updatePayload: Record<string, unknown[]> = {
      [fieldName]: arr.filter((_, i) => i !== idx),
    }

    // If there's a paired array (e.g. gallery_types mirrors gallery_urls), remove same index
    if (indexField) {
      const pairedArr = (Array.isArray(row[indexField]) ? row[indexField] as unknown[] : [])
      updatePayload[indexField] = pairedArr.filter((_, i) => i !== idx)
    }

    const { error } = await supabaseAdmin
      .from('projects')
      .update(updatePayload)
      .eq('slug', slug)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, removed_index: idx })
  }

  // Default: simple field set
  const { error } = await supabaseAdmin
    .from('projects')
    .update(fields)
    .eq('slug', slug)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
