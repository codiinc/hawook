'use client'

import { useState, useRef, useCallback } from 'react'

type DocType = {
  key: string
  label: string
  defaultGated: boolean | null // null = admin choice
}

const DOC_TYPES: DocType[] = [
  { key: 'sales_presentation', label: 'Sales Presentation', defaultGated: true },
  { key: 'brochure', label: 'Brochure', defaultGated: true },
  { key: 'price_list', label: 'Price List', defaultGated: true },
  { key: 'payment_plan', label: 'Payment Plan', defaultGated: true },
  { key: 'foreign_quota_letter', label: 'Foreign Quota Letter', defaultGated: true },
  { key: 'floor_plan_set', label: 'Floor Plan Set', defaultGated: false },
  { key: 'spa_template', label: 'SPA Template', defaultGated: true },
  { key: 'other', label: 'Other', defaultGated: null },
]

export type ProjectDocument = {
  id: string
  document_type: string
  cloudinary_url: string
  cloudinary_public_id: string | null
  filename: string | null
  file_size_bytes: number | null
  version: string | null
  is_gated: boolean
  uploaded_at: string
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

type UploadingState = {
  docType: string
  filename: string
  progress: number
  error: string | null
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
      <div className="bg-teal h-1 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
    </div>
  )
}

export default function DocumentsPanel({
  projectId,
  slug,
  initialDocs,
}: {
  projectId: string
  slug: string
  initialDocs: ProjectDocument[]
}) {
  const [docs, setDocs] = useState<ProjectDocument[]>(initialDocs)
  const [uploading, setUploading] = useState<UploadingState | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadTypeRef = useRef<string>('')
  const uploadGatedRef = useRef<boolean>(true)

  const triggerUpload = (docType: string, defaultGated: boolean | null) => {
    uploadTypeRef.current = docType
    uploadGatedRef.current = defaultGated ?? true
    fileInputRef.current?.click()
  }

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported for documents.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('File exceeds 50MB limit.')
      return
    }

    const docType = uploadTypeRef.current
    const isGated = uploadGatedRef.current

    setUploading({ docType, filename: file.name, progress: 0, error: null })

    // Upload to Cloudinary via existing route
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', `hawook/projects/${slug}/documents`)
    fd.append('public_id', `${slug}-${docType}-${Date.now()}`)
    fd.append('resource_type', 'raw')

    let cloudRes: { ok: boolean; data: Record<string, unknown> }
    try {
      cloudRes = await new Promise((resolve) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (ev) => {
          if (ev.lengthComputable) {
            setUploading(u => u ? { ...u, progress: Math.round((ev.loaded / ev.total) * 90) } : null)
          }
        })
        xhr.addEventListener('load', () => {
          try {
            const data = JSON.parse(xhr.responseText) as Record<string, unknown>
            resolve({ ok: xhr.status >= 200 && xhr.status < 300, data })
          } catch {
            resolve({ ok: false, data: { error: 'Invalid response' } })
          }
        })
        xhr.addEventListener('error', () => resolve({ ok: false, data: { error: 'Network error' } }))
        xhr.open('POST', '/api/cloudinary/upload')
        xhr.send(fd)
      })
    } catch {
      setUploading(u => u ? { ...u, error: 'Upload failed' } : null)
      return
    }

    if (!cloudRes.ok) {
      setUploading(u => u ? { ...u, error: (cloudRes.data.error as string) ?? 'Cloudinary upload failed' } : null)
      return
    }

    setUploading(u => u ? { ...u, progress: 95 } : null)

    // Create DB record
    const dbRes = await fetch('/api/admin/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        document_type: docType,
        cloudinary_url: cloudRes.data.secure_url,
        cloudinary_public_id: cloudRes.data.public_id,
        filename: file.name,
        file_size_bytes: file.size,
        is_gated: isGated,
      }),
    })

    if (!dbRes.ok) {
      const json = await dbRes.json() as { error?: string }
      setUploading(u => u ? { ...u, error: json.error ?? 'DB write failed' } : null)
      return
    }

    const { id } = await dbRes.json() as { id: string }

    const newDoc: ProjectDocument = {
      id,
      document_type: docType,
      cloudinary_url: cloudRes.data.secure_url as string,
      cloudinary_public_id: cloudRes.data.public_id as string,
      filename: file.name,
      file_size_bytes: file.size,
      version: null,
      is_gated: isGated,
      uploaded_at: new Date().toISOString(),
    }

    setDocs(d => [newDoc, ...d])
    setUploading(null)
  }, [projectId, slug])

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    const res = await fetch(`/api/admin/documents/${deleteConfirm}`, { method: 'DELETE' })
    if (res.ok) {
      setDocs(d => d.filter(doc => doc.id !== deleteConfirm))
    }
    setDeleteConfirm(null)
    setDeleting(false)
  }

  const toggleGated = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_gated: !current }),
    })
    if (res.ok) {
      setDocs(d => d.map(doc => doc.id === id ? { ...doc, is_gated: !current } : doc))
    }
  }

  const docsForType = (key: string) => docs.filter(d => d.document_type === key)

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFile}
      />

      {uploading && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
          <p className="text-blue-700 font-medium">Uploading {uploading.filename}…</p>
          <ProgressBar progress={uploading.progress} />
          {uploading.error && <p className="text-red-500 mt-1 text-xs">{uploading.error}</p>}
        </div>
      )}

      <div className="space-y-6">
        {DOC_TYPES.map(docType => {
          const typeDocs = docsForType(docType.key)
          const isUploadingThis = uploading?.docType === docType.key

          return (
            <div key={docType.key} className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{docType.label}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {typeDocs.length} file{typeDocs.length !== 1 ? 's' : ''} ·{' '}
                    {docType.defaultGated === null
                      ? 'gating set per file'
                      : docType.defaultGated
                      ? 'gated by default'
                      : 'public by default'}
                  </p>
                </div>
                <button
                  onClick={() => triggerUpload(docType.key, docType.defaultGated)}
                  disabled={!!uploading}
                  className="text-xs bg-teal text-white px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Upload PDF
                </button>
              </div>

              {typeDocs.length === 0 ? (
                <p className="text-xs text-gray-300 text-center py-6">No {docType.label.toLowerCase()} uploaded</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {typeDocs.map(doc => (
                    <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-xl shrink-0">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{doc.filename ?? 'Document'}</p>
                        <p className="text-xs text-gray-400">
                          {formatDate(doc.uploaded_at)}
                          {doc.file_size_bytes ? ` · ${formatBytes(doc.file_size_bytes)}` : ''}
                          {doc.version ? ` · ${doc.version}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleGated(doc.id, doc.is_gated)}
                          className={`text-xs font-medium px-2 py-0.5 rounded border transition-colors ${
                            doc.is_gated
                              ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                              : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                          }`}
                          title="Toggle gating"
                        >
                          {doc.is_gated ? 'Gated' : 'Public'}
                        </button>
                        <a
                          href={doc.cloudinary_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-teal"
                        >
                          View
                        </a>
                        <button
                          onClick={() => setDeleteConfirm(doc.id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {isUploadingThis && uploading && !uploading.error && (
                <div className="px-4 pb-3">
                  <ProgressBar progress={uploading.progress} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Delete document?</h2>
            <p className="text-sm text-gray-600 mb-6">
              This removes the document record from Hawook. The file will remain in Cloudinary.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-sm px-4 py-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="text-sm px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
