/**
 * Supabase Storage uploads.
 *
 * Buckets expected (created via migrations):
 *   - avatars         (public)  — profile photos (users + children)
 *   - content         (public)  — site content images (announcements, products)
 *   - child-documents (private) — athlete documents, belt certificates, etc.
 */

import { supabase } from './supabase'
import { dataUrlToBlob } from './capacitor'

const AVATAR_BUCKET = 'avatars'
const CONTENT_BUCKET = 'content'
const DOCS_BUCKET = 'child-documents'

export interface UploadResult {
  url: string | null
  path: string | null
  error: string | null
}

/**
 * Generic image upload to a public bucket. Stored under
 * `{prefix}/{timestamp}.{ext}` and returned as a public CDN URL.
 */
async function uploadImage(
  bucket: string,
  prefix: string,
  dataUrl: string,
  format: string,
): Promise<UploadResult> {
  const blob = dataUrlToBlob(dataUrl)
  const ext = (format || 'jpg').toLowerCase().replace('jpeg', 'jpg')
  const path = `${prefix}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: blob.type || `image/${ext}`,
    upsert: true,
    cacheControl: '3600',
  })

  if (error) return { url: null, path: null, error: error.message }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl, path, error: null }
}

/**
 * Upload an avatar image (from Camera.pickImage) and return its public URL.
 * Stored under `{userId}/{timestamp}.{ext}` in the avatars bucket.
 */
export function uploadAvatar(
  userId: string,
  dataUrl: string,
  format: string,
): Promise<UploadResult> {
  return uploadImage(AVATAR_BUCKET, userId, dataUrl, format)
}

/**
 * Upload a site content image (announcement cover, product photo, etc.)
 * Stored under `{folder}/{timestamp}.{ext}` in the content bucket.
 */
export function uploadContentImage(
  folder: string,
  dataUrl: string,
  format: string,
): Promise<UploadResult> {
  return uploadImage(CONTENT_BUCKET, folder, dataUrl, format)
}

/**
 * Upload an athlete document (PDF, image, etc.) and return a signed URL.
 * Files are stored under `{childId}/{timestamp}-{name}` in a private bucket.
 */
export async function uploadChildDocument(
  childId: string,
  file: Blob,
  fileName: string,
): Promise<UploadResult> {
  const safeName = fileName.replace(/[^\w.\-]+/g, '_')
  const path = `${childId}/${Date.now()}-${safeName}`

  const { error } = await supabase.storage
    .from(DOCS_BUCKET)
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (error) return { url: null, path: null, error: error.message }

  // Private bucket — return a 1-hour signed URL for immediate preview/download.
  const { data: signed, error: signError } = await supabase.storage
    .from(DOCS_BUCKET)
    .createSignedUrl(path, 60 * 60)

  if (signError || !signed) {
    return { url: null, path, error: signError?.message ?? 'Link oluşturulamadı.' }
  }

  return { url: signed.signedUrl, path, error: null }
}

/** Remove an avatar from storage (best-effort; silent on failure). */
export async function deleteAvatar(path: string): Promise<void> {
  if (!path) return
  await supabase.storage.from(AVATAR_BUCKET).remove([path])
}
