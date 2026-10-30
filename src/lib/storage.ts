import { supabase } from './supabase'

/** Gültigkeit signierter URLs für die privaten Medien-Buckets (Sekunden). */
const SIGNED_URL_TTL = 60 * 60

/**
 * Resolve the public URL for an object in a Supabase Storage bucket.
 *
 * Nur für öffentliche Buckets (avatars). Fotos und Kommentarbilder liegen in
 * privaten Buckets und laufen über getSignedUrl/getSignedUrls.
 */
export function getPublicUrl(bucket: string, path: string): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export async function getSignedUrl(bucket: string, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL)
  if (error) return null
  return data?.signedUrl ?? null
}

/** Signiert gebündelt; Pfade ohne Leserecht fehlen in der Map. */
export async function getSignedUrls(bucket: string, paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {}
  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(paths, SIGNED_URL_TTL)
  if (error || !data) return {}

  const urls: Record<string, string> = {}
  for (const entry of data) {
    if (entry.path && entry.signedUrl && !entry.error) urls[entry.path] = entry.signedUrl
  }
  return urls
}

/**
 * Prüft, ob ein Medienpfad im Ordner `<activity_id>/<Autor-ID>/` liegt. Vor dem
 * Löschen nötig: Die Pfade stammen aus Inhalten anderer Mitglieder, gelöscht wird
 * aber mit den weiteren Rechten des moderierenden Admins.
 */
export function isOwnedMediaPath(path: string, activityId: string, authorId: string): boolean {
  return path.startsWith(`${activityId}/${authorId}/`) && !path.includes('..')
}
