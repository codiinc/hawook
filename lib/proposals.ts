import { supabaseAdmin } from '@/lib/supabase/admin'

export interface ApprovalOptions {
  notificationHold?: boolean
  reviewNotes?: string
  editedFields?: FieldChange[]
  editedUpdateEntry?: RelatedUpdateEntry
}

export interface FieldChange {
  field: string
  current_value: unknown
  proposed_value: unknown
  evidence?: string | null
  ai_confidence?: 'high' | 'medium' | 'low'
}

export interface RelatedUpdateEntry {
  type: string
  severity: string
  summary_public: string
  summary_internal?: string | null
  notify_followers: boolean
}

export async function executeApproval(
  proposalId: string,
  callerId: string,
  callerEmail: string,
  options: ApprovalOptions = {}
): Promise<{ ok: boolean; error?: string; targetId?: string; updateEntryId?: string }> {
  // If caller provided edited fields/entry, patch the proposal first so the
  // Postgres function reads the corrected values.
  if (options.editedFields) {
    await supabaseAdmin
      .from('update_proposals')
      .update({ fields_changed: options.editedFields, updated_at: new Date().toISOString() })
      .eq('id', proposalId)
      .eq('status', 'pending_approval')
  }
  if (options.editedUpdateEntry !== undefined) {
    await supabaseAdmin
      .from('update_proposals')
      .update({ related_update_entry: options.editedUpdateEntry, updated_at: new Date().toISOString() })
      .eq('id', proposalId)
      .eq('status', 'pending_approval')
  }

  const { data, error } = await supabaseAdmin.rpc('execute_proposal_approval', {
    p_proposal_id:       proposalId,
    p_caller_user_id:    callerId,
    p_caller_email:      callerEmail,
    p_review_notes:      options.reviewNotes ?? null,
    p_notification_hold: options.notificationHold ?? false,
  })

  if (error) return { ok: false, error: error.message }

  const result = data as { ok: boolean; error?: string; target_id?: string; update_entry_id?: string }
  return {
    ok:            result.ok,
    error:         result.error,
    targetId:      result.target_id,
    updateEntryId: result.update_entry_id,
  }
}

export async function rejectProposal(
  proposalId: string,
  callerId: string,
  callerEmail: string,
  reviewNotes?: string
): Promise<{ ok: boolean; error?: string }> {
  const { data: proposal } = await supabaseAdmin
    .from('update_proposals')
    .select('target_table, target_record_id, target_slug, update_type, severity')
    .eq('id', proposalId)
    .single()

  if (!proposal) return { ok: false, error: 'Proposal not found' }
  const p = proposal as Record<string, unknown>

  const { error } = await supabaseAdmin
    .from('update_proposals')
    .update({
      status:      'rejected',
      reviewed_by: callerId,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes ?? null,
      updated_at:  new Date().toISOString(),
    })
    .eq('id', proposalId)
    .eq('status', 'pending_approval')

  if (error) return { ok: false, error: error.message }

  await supabaseAdmin.from('audit_log').insert({
    actor_id:         callerId,
    actor_email:      callerEmail,
    action:           'rejected',
    target_table:     p.target_table as string ?? null,
    target_record_id: p.target_record_id as string ?? null,
    target_slug:      p.target_slug as string ?? null,
    summary: `Rejected proposal: ${p.update_type} (${p.severity}) on ${p.target_slug ?? p.target_record_id ?? proposalId}`,
    metadata: { proposal_id: proposalId, review_notes: reviewNotes ?? null },
  })

  return { ok: true }
}

export async function deferProposal(
  proposalId: string,
  callerId: string,
  callerEmail: string,
  deferTag?: string,
  reviewNotes?: string
): Promise<{ ok: boolean; error?: string }> {
  const { data: proposal } = await supabaseAdmin
    .from('update_proposals')
    .select('target_table, target_record_id, target_slug, update_type, severity')
    .eq('id', proposalId)
    .single()

  if (!proposal) return { ok: false, error: 'Proposal not found' }
  const p = proposal as Record<string, unknown>

  const notesParts = [
    deferTag ? `[Deferred: ${deferTag}]` : '[Deferred]',
    reviewNotes,
  ].filter(Boolean)

  const { error } = await supabaseAdmin
    .from('update_proposals')
    .update({
      review_notes: notesParts.join(' — '),
      updated_at:   new Date().toISOString(),
    })
    .eq('id', proposalId)
    .eq('status', 'pending_approval')

  if (error) return { ok: false, error: error.message }

  await supabaseAdmin.from('audit_log').insert({
    actor_id:         callerId,
    actor_email:      callerEmail,
    action:           'deferred',
    target_table:     p.target_table as string ?? null,
    target_record_id: p.target_record_id as string ?? null,
    target_slug:      p.target_slug as string ?? null,
    summary: `Deferred proposal: ${p.update_type} on ${p.target_slug ?? p.target_record_id ?? proposalId}${deferTag ? ` [${deferTag}]` : ''}`,
    metadata: { proposal_id: proposalId, defer_tag: deferTag ?? null, review_notes: reviewNotes ?? null },
  })

  return { ok: true }
}
