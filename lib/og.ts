const SITE_URL = 'https://app.hawook.com'

export function ogImageUrl(src: string | null | undefined): string {
  if (!src) return `${SITE_URL}/opengraph-image`
  // Apply Cloudinary 1200x630 crop transform for OG images
  if (src.includes('res.cloudinary.com')) {
    return src.replace('/upload/', '/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/')
  }
  return src
}
