'use client'

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'
import Image from 'next/image'

type Project = {
  id: string
  project_name: string
  slug: string
  cover_image_url: string | null
  cover_image_type: string | null
  gallery_urls: string[]
  gallery_types: string[]
  floorplan_urls: string[]
  video_urls: string[]
  google_maps_url: string | null
  virtual_tour_url: string | null
}

type UploadState = {
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uploadWithProgress(
  url: string,
  body: FormData,
  onProgress: (pct: number) => void
): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
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
    xhr.open('POST', url)
    xhr.send(body)
  })
}

async function patchProject(slug: string, fields: Record<string, unknown>, operation?: string) {
  const res = await fetch(`/api/admin/projects/${slug}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields, operation }),
  })
  return res.json() as Promise<{ ok?: boolean; error?: string }>
}

function validateFile(
  file: File,
  allowedTypes: string[],
  maxMb: number
): string | null {
  if (!allowedTypes.includes(file.type)) {
    return `${file.name}: unsupported file type (${file.type || 'unknown'})`
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `${file.name}: exceeds ${maxMb}MB limit`
  }
  return null
}

function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
      <div
        className="bg-teal h-1.5 rounded-full transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

function SavedIndicator({ saved }: { saved: boolean }) {
  if (!saved) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
      <span>✓</span> Saved
    </span>
  )
}

function DropZone({
  onFiles,
  accept,
  multiple = false,
  disabled = false,
  label,
}: {
  onFiles: (files: File[]) => void
  accept: string
  multiple?: boolean
  disabled?: boolean
  label: string
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(files)
  }, [disabled, onFiles])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length) onFiles(files)
    e.target.value = ''
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        disabled
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
          : dragging
          ? 'border-teal bg-teal-light'
          : 'border-gray-200 hover:border-teal hover:bg-teal-light/30'
      }`}
    >
      <div className="text-3xl mb-2 select-none">📁</div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function MediaPanel({ project: initial }: { project: Project }) {
  const [project, setProject] = useState<Project>(initial)
  const [coverState, setCoverState] = useState<UploadState>({ progress: 0, status: 'idle' })
  const [galleryStates, setGalleryStates] = useState<UploadState[]>([])
  const [floorplanStates, setFloorplanStates] = useState<UploadState[]>([])
  const [videoUrls, setVideoUrls] = useState<string[]>(initial.video_urls ?? [])
  const [mapsUrl, setMapsUrl] = useState(initial.google_maps_url ?? '')
  const [tourUrl, setTourUrl] = useState(initial.virtual_tour_url ?? '')
  const [savedFields, setSavedFields] = useState<Record<string, boolean>>({})

  const markSaved = (field: string) => {
    setSavedFields(p => ({ ...p, [field]: true }))
    setTimeout(() => setSavedFields(p => ({ ...p, [field]: false })), 3000)
  }

  // ── Cover image ─────────────────────────────────────────────────────────────

  const uploadCover = async (files: File[]) => {
    const file = files[0]
    if (!file) return

    const err = validateFile(file, ['image/jpeg', 'image/png', 'image/webp'], 10)
    if (err) { setCoverState({ progress: 0, status: 'error', error: err }); return }

    setCoverState({ progress: 0, status: 'uploading' })

    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', `hawook/projects/${project.slug}`)
    fd.append('public_id', `${project.slug}-cover`)
    fd.append('resource_type', 'image')

    const { ok, data } = await uploadWithProgress('/api/cloudinary/upload', fd, (pct) =>
      setCoverState(s => ({ ...s, progress: pct }))
    )

    if (!ok) {
      setCoverState({ progress: 0, status: 'error', error: data.error as string ?? 'Upload failed' })
      return
    }

    const url = data.secure_url as string
    const patch = await patchProject(project.slug, { cover_image_url: url, cover_image_type: 'cloudinary' })

    if (patch.error) {
      setCoverState({ progress: 0, status: 'error', error: `Cloudinary OK but Supabase failed: ${patch.error}` })
      return
    }

    setProject(p => ({ ...p, cover_image_url: url, cover_image_type: 'cloudinary' }))
    setCoverState({ progress: 100, status: 'success' })
    markSaved('cover')
  }

  // ── Gallery ─────────────────────────────────────────────────────────────────

  const uploadGallery = async (files: File[]) => {
    const valid = files.filter(f => {
      const err = validateFile(f, ['image/jpeg', 'image/png', 'image/webp'], 10)
      return !err
    })
    if (!valid.length) return

    const startIdx = project.gallery_urls.length
    const states: UploadState[] = valid.map(() => ({ progress: 0, status: 'uploading' as const }))
    setGalleryStates(states)

    const newUrls: string[] = []
    const newTypes: string[] = []

    await Promise.all(valid.map(async (file, i) => {
      const n = String(startIdx + i + 1).padStart(2, '0')
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', `hawook/projects/${project.slug}/gallery`)
      fd.append('public_id', `${project.slug}-gallery-${n}`)
      fd.append('resource_type', 'image')

      const { ok, data } = await uploadWithProgress('/api/cloudinary/upload', fd, (pct) =>
        setGalleryStates(prev => prev.map((s, j) => j === i ? { ...s, progress: pct } : s))
      )

      if (!ok) {
        setGalleryStates(prev => prev.map((s, j) => j === i
          ? { progress: 0, status: 'error', error: data.error as string ?? 'Failed' }
          : s
        ))
        return
      }

      newUrls[i] = data.secure_url as string
      newTypes[i] = 'cloudinary'
      setGalleryStates(prev => prev.map((s, j) => j === i ? { ...s, status: 'success' } : s))
    }))

    const uploaded = newUrls.filter(Boolean)
    const uploadedTypes = newTypes.filter(Boolean)
    if (!uploaded.length) return

    const patch = await patchProject(
      project.slug,
      { gallery_urls: uploaded, gallery_types: uploadedTypes },
      'append_array'
    )

    if (!patch.error) {
      setProject(p => ({
        ...p,
        gallery_urls: [...p.gallery_urls, ...uploaded],
        gallery_types: [...p.gallery_types, ...uploadedTypes],
      }))
      markSaved('gallery')
    }

    setTimeout(() => setGalleryStates([]), 3000)
  }

  const removeGalleryImage = async (url: string) => {
    await patchProject(project.slug, { gallery_urls: url }, 'remove_from_array')
    setProject(p => {
      const idx = p.gallery_urls.indexOf(url)
      return {
        ...p,
        gallery_urls: p.gallery_urls.filter((_, i) => i !== idx),
        gallery_types: p.gallery_types.filter((_, i) => i !== idx),
      }
    })
    markSaved('gallery')
  }

  // ── Floorplans ──────────────────────────────────────────────────────────────

  const uploadFloorplans = async (files: File[]) => {
    const valid = files.filter(f => {
      const err = validateFile(f, ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'], 20)
      return !err
    })
    if (!valid.length) return

    const startIdx = project.floorplan_urls.length
    const states: UploadState[] = valid.map(() => ({ progress: 0, status: 'uploading' as const }))
    setFloorplanStates(states)

    const newUrls: string[] = []

    await Promise.all(valid.map(async (file, i) => {
      const n = String(startIdx + i + 1).padStart(2, '0')
      const isPdf = file.type === 'application/pdf'
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', `hawook/projects/${project.slug}/floorplans`)
      fd.append('public_id', `${project.slug}-floorplan-${n}`)
      fd.append('resource_type', isPdf ? 'raw' : 'image')

      const { ok, data } = await uploadWithProgress('/api/cloudinary/upload', fd, (pct) =>
        setFloorplanStates(prev => prev.map((s, j) => j === i ? { ...s, progress: pct } : s))
      )

      if (!ok) {
        setFloorplanStates(prev => prev.map((s, j) => j === i
          ? { progress: 0, status: 'error', error: data.error as string ?? 'Failed' }
          : s
        ))
        return
      }

      newUrls[i] = data.secure_url as string
      setFloorplanStates(prev => prev.map((s, j) => j === i ? { ...s, status: 'success' } : s))
    }))

    const uploaded = newUrls.filter(Boolean)
    if (!uploaded.length) return

    const patch = await patchProject(project.slug, { floorplan_urls: uploaded }, 'append_array')
    if (!patch.error) {
      setProject(p => ({ ...p, floorplan_urls: [...p.floorplan_urls, ...uploaded] }))
      markSaved('floorplans')
    }

    setTimeout(() => setFloorplanStates([]), 3000)
  }

  const removeFloorplan = async (url: string) => {
    await patchProject(project.slug, { floorplan_urls: url }, 'remove_from_array')
    setProject(p => ({ ...p, floorplan_urls: p.floorplan_urls.filter(u => u !== url) }))
    markSaved('floorplans')
  }

  // ── Video URLs ──────────────────────────────────────────────────────────────

  const saveVideoUrls = async () => {
    const valid = videoUrls.filter(u => u.trim() &&
      (u.includes('youtube.com') || u.includes('youtu.be') || u.includes('vimeo.com'))
    )
    const patch = await patchProject(project.slug, { video_urls: valid })
    if (!patch.error) {
      setProject(p => ({ ...p, video_urls: valid }))
      markSaved('videos')
    }
  }

  // ── Maps / Tour ─────────────────────────────────────────────────────────────

  const saveMapsUrl = async () => {
    const patch = await patchProject(project.slug, { google_maps_url: mapsUrl.trim() || null })
    if (!patch.error) {
      setProject(p => ({ ...p, google_maps_url: mapsUrl.trim() || null }))
      markSaved('maps')
    }
  }

  const saveTourUrl = async () => {
    const patch = await patchProject(project.slug, { virtual_tour_url: tourUrl.trim() || null })
    if (!patch.error) {
      setProject(p => ({ ...p, virtual_tour_url: tourUrl.trim() || null }))
      markSaved('tour')
    }
  }

  const isUploading = coverState.status === 'uploading'
    || galleryStates.some(s => s.status === 'uploading')
    || floorplanStates.some(s => s.status === 'uploading')

  return (
    <div>
      {/* All changes saved indicator */}
      {isUploading && (
        <div className="mb-4 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          Uploading — do not close this page
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left column: upload zones ── */}
        <div className="space-y-8">

          {/* Cover image */}
          <Section title="Cover Image">
            <DropZone
              label="Drop JPG, PNG or WebP (max 10MB)"
              accept="image/jpeg,image/png,image/webp"
              onFiles={uploadCover}
              disabled={coverState.status === 'uploading'}
            />
            {coverState.status === 'uploading' && <ProgressBar progress={coverState.progress} />}
            {coverState.status === 'error' && <ErrorMsg msg={coverState.error ?? 'Upload failed'} onRetry={() => setCoverState({ progress: 0, status: 'idle' })} />}
            {coverState.status === 'success' && <p className="text-xs text-green-600 mt-1">✓ Uploaded and saved</p>}
          </Section>

          {/* Gallery */}
          <Section title="Gallery Images" hint="Append-only — existing images are not replaced">
            <DropZone
              label="Drop up to 20 images (JPG, PNG, WebP — max 10MB each)"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onFiles={uploadGallery}
              disabled={galleryStates.some(s => s.status === 'uploading')}
            />
            {galleryStates.map((s, i) => (
              <div key={i} className="mt-1">
                {s.status === 'uploading' && <ProgressBar progress={s.progress} />}
                {s.status === 'error' && <ErrorMsg msg={s.error ?? 'Failed'} />}
                {s.status === 'success' && <p className="text-xs text-green-600">✓ Image {i + 1} saved</p>}
              </div>
            ))}
            <SavedIndicator saved={!!savedFields.gallery} />
          </Section>

          {/* Floorplans */}
          <Section title="Floorplans" hint="Accepts JPG, PNG, WebP, PDF — max 20MB each, 10 files">
            <DropZone
              label="Drop floorplans here"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              multiple
              onFiles={uploadFloorplans}
              disabled={floorplanStates.some(s => s.status === 'uploading')}
            />
            {floorplanStates.map((s, i) => (
              <div key={i} className="mt-1">
                {s.status === 'uploading' && <ProgressBar progress={s.progress} />}
                {s.status === 'error' && <ErrorMsg msg={s.error ?? 'Failed'} />}
                {s.status === 'success' && <p className="text-xs text-green-600">✓ Floorplan {i + 1} saved</p>}
              </div>
            ))}
            <SavedIndicator saved={!!savedFields.floorplans} />
          </Section>

          {/* Video URLs */}
          <Section title="Video URLs" hint="YouTube or Vimeo embed URLs only">
            <div className="space-y-2">
              {videoUrls.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={url}
                    onChange={e => setVideoUrls(v => v.map((u, j) => j === i ? e.target.value : u))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-teal"
                  />
                  <button
                    onClick={() => setVideoUrls(v => v.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 px-2 text-lg leading-none"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => setVideoUrls(v => [...v, ''])}
                className="text-sm text-teal hover:text-teal-dark font-medium"
              >
                + Add URL
              </button>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={saveVideoUrls}
                className="text-sm bg-teal text-white px-4 py-2 rounded-md hover:bg-teal-dark transition-colors"
              >
                Save videos
              </button>
              <SavedIndicator saved={!!savedFields.videos} />
            </div>
          </Section>

          {/* Google Maps */}
          <Section title="Google Maps URL">
            <input
              value={mapsUrl}
              onChange={e => setMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-teal"
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={saveMapsUrl}
                className="text-sm bg-teal text-white px-4 py-2 rounded-md hover:bg-teal-dark transition-colors"
              >
                Save
              </button>
              <SavedIndicator saved={!!savedFields.maps} />
            </div>
          </Section>

          {/* Virtual Tour */}
          <Section title="Virtual Tour URL">
            <input
              value={tourUrl}
              onChange={e => setTourUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-teal"
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={saveTourUrl}
                className="text-sm bg-teal text-white px-4 py-2 rounded-md hover:bg-teal-dark transition-colors"
              >
                Save
              </button>
              <SavedIndicator saved={!!savedFields.tour} />
            </div>
          </Section>
        </div>

        {/* ── Right column: current media preview ── */}
        <div className="space-y-8">

          {/* Cover preview */}
          <Section title="Current Cover">
            {project.cover_image_url ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={project.cover_image_url}
                  alt="Cover"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ) : (
              <EmptyState label="No cover image" />
            )}
          </Section>

          {/* Gallery preview */}
          <Section title={`Gallery (${project.gallery_urls.length})`}>
            {project.gallery_urls.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {project.gallery_urls.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded overflow-hidden bg-gray-100">
                    <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="33vw" />
                    <button
                      onClick={() => removeGalleryImage(url)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs items-center justify-center hidden group-hover:flex leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="No gallery images" />
            )}
          </Section>

          {/* Floorplans preview */}
          <Section title={`Floorplans (${project.floorplan_urls.length})`}>
            {project.floorplan_urls.length > 0 ? (
              <ul className="space-y-2">
                {project.floorplan_urls.map((url, i) => {
                  const isPdf = url.includes('.pdf') || url.includes('/raw/')
                  return (
                    <li key={i} className="flex items-center gap-3 bg-gray-50 rounded px-3 py-2">
                      {isPdf ? (
                        <span className="text-2xl shrink-0">📄</span>
                      ) : (
                        <div className="w-10 h-10 shrink-0 rounded overflow-hidden bg-gray-200 relative">
                          <Image src={url} alt={`Floorplan ${i + 1}`} fill className="object-cover" sizes="40px" />
                        </div>
                      )}
                      <span className="text-xs text-gray-600 flex-1 truncate">{`Floorplan ${i + 1}`}</span>
                      <button
                        onClick={() => removeFloorplan(url)}
                        className="text-red-400 hover:text-red-600 text-sm shrink-0"
                      >
                        Remove
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <EmptyState label="No floorplans" />
            )}
          </Section>

          {/* Video previews */}
          <Section title={`Videos (${project.video_urls.length})`}>
            {project.video_urls.length > 0 ? (
              <ul className="space-y-2">
                {project.video_urls.map((url, i) => {
                  const thumb = getYoutubeThumbnail(url)
                  const vimeoId = getVimeoId(url)
                  return (
                    <li key={i} className="flex items-center gap-3 bg-gray-50 rounded px-3 py-2">
                      {thumb ? (
                        <div className="w-16 h-10 shrink-0 rounded overflow-hidden bg-gray-200 relative">
                          <Image src={thumb} alt="thumb" fill className="object-cover" sizes="64px" />
                        </div>
                      ) : vimeoId ? (
                        <span className="text-2xl shrink-0">🎬</span>
                      ) : (
                        <span className="text-2xl shrink-0">🔗</span>
                      )}
                      <span className="text-xs text-gray-600 flex-1 truncate">{url}</span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <EmptyState label="No video URLs saved" />
            )}
          </Section>

          {/* Maps / Tour current values */}
          <Section title="Maps &amp; Tour">
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Google Maps</p>
                {project.google_maps_url
                  ? <a href={project.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-teal hover:underline truncate block">{project.google_maps_url}</a>
                  : <span className="text-gray-300">Not set</span>
                }
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Virtual Tour</p>
                {project.virtual_tour_url
                  ? <a href={project.virtual_tour_url} target="_blank" rel="noopener noreferrer" className="text-teal hover:underline truncate block">{project.virtual_tour_url}</a>
                  : <span className="text-gray-300">Not set</span>
                }
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

// ─── Small reusable pieces ────────────────────────────────────────────────────

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">{children}</div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-6 text-gray-300 text-sm">{label}</div>
  )
}

function ErrorMsg({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <p className="text-xs text-red-500">{msg}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs text-teal hover:text-teal-dark underline">
          Retry
        </button>
      )}
    </div>
  )
}
