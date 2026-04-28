import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const runtime = 'nodejs'

function signRequest(params: Record<string, string>, apiSecret: string): string {
  // Sort keys alphabetically, join as key=value&key=value, append secret, SHA1
  const str = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return crypto.createHash('sha1').update(str + apiSecret).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary credentials not configured' }, { status: 500 })
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'hawook'
    const publicId = (formData.get('public_id') as string) || ''
    const resourceType = (formData.get('resource_type') as string) || 'image'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const timestamp = Math.round(Date.now() / 1000).toString()

    // Build params to sign — must match exactly what we send to Cloudinary
    const paramsToSign: Record<string, string> = { folder, timestamp }
    if (publicId) paramsToSign.public_id = publicId

    const signature = signRequest(paramsToSign, apiSecret)

    // Build the multipart upload to Cloudinary
    const uploadForm = new FormData()
    uploadForm.append('file', file)
    uploadForm.append('api_key', apiKey)
    uploadForm.append('timestamp', timestamp)
    uploadForm.append('signature', signature)
    uploadForm.append('folder', folder)
    if (publicId) uploadForm.append('public_id', publicId)

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`

    let cloudinaryRes: Response
    try {
      cloudinaryRes = await fetch(cloudinaryUrl, { method: 'POST', body: uploadForm })
    } catch {
      return NextResponse.json({ error: 'Failed to reach Cloudinary' }, { status: 502 })
    }

    // Parse JSON safely — Cloudinary occasionally returns non-JSON on hard failures
    let data: Record<string, unknown>
    try {
      data = await cloudinaryRes.json() as Record<string, unknown>
    } catch {
      return NextResponse.json(
        { error: `Cloudinary returned an unexpected response (HTTP ${cloudinaryRes.status})` },
        { status: 502 }
      )
    }

    if (!cloudinaryRes.ok) {
      const msg = (data.error as Record<string, string> | undefined)?.message ?? 'Upload failed'
      return NextResponse.json({ error: msg }, { status: cloudinaryRes.status })
    }

    return NextResponse.json({
      secure_url: data.secure_url,
      public_id: data.public_id,
      resource_type: data.resource_type,
      format: data.format,
      width: data.width,
      height: data.height,
    })
  } catch (err) {
    // Top-level safety net — always return JSON, never an HTML 500 page
    const message = err instanceof Error ? err.message : 'Unknown server error'
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 })
  }
}
