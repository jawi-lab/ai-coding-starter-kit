import { supabase } from './supabase'

/**
 * Resolve the public URL for an object in a Supabase Storage bucket.
 *
 * Wraps the `supabase.storage.from(bucket).getPublicUrl(path)` call that was
 * repeated across photo, avatar and comment-image code so the access pattern
 * lives in one place. Bucket names stay defined next to their upload logic.
 */
export function getPublicUrl(bucket: string, path: string): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}
