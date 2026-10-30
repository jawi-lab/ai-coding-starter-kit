import type { JSONContent } from '@tiptap/react'
import { isOwnedMediaPath } from './storage'

export const COMMENT_IMAGE_BUCKET = 'activity-comment-images'

/** So stehen Bilder neuer Kommentare im TipTap-JSON: nur der Pfad, keine URL. */
const STORED_PREFIX = `storage://${COMMENT_IMAGE_BUCKET}/`

/**
 * Führt ein Bild-`src` auf den Pfad im Kommentar-Bucket zurück. Versteht das
 * gespeicherte Format, alte öffentliche URLs und die signierte URL aus dem Editor.
 * Alles andere ergibt null: fremde Bilder werden weder geladen noch gelöscht.
 */
export function commentImagePathFromSrc(
  src: string,
  supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL
): string | null {
  const prefixes = [
    STORED_PREFIX,
    `${supabaseUrl}/storage/v1/object/public/${COMMENT_IMAGE_BUCKET}/`,
    `${supabaseUrl}/storage/v1/object/sign/${COMMENT_IMAGE_BUCKET}/`,
  ]
  const prefix = prefixes.find((p) => src.startsWith(p))
  if (!prefix) return null

  const path = src.slice(prefix.length).split('?')[0]
  if (!path || path.includes('..')) return null
  return path
}

/** Ersetzt vor dem Speichern jede Bild-URL unseres Buckets durch den Pfad. */
export function toStoredCommentContent(node: JSONContent): JSONContent {
  const next: JSONContent = { ...node }
  if (node.type === 'image' && typeof node.attrs?.src === 'string') {
    const path = commentImagePathFromSrc(node.attrs.src)
    if (path) next.attrs = { ...node.attrs, src: `${STORED_PREFIX}${path}` }
  }
  if (node.content) next.content = node.content.map(toStoredCommentContent)
  return next
}

/** Pfade, die beim Löschen eines Kommentars mit entfernt werden dürfen. */
export function ownedCommentImagePaths(
  content: JSONContent,
  activityId: string,
  authorId: string
): string[] {
  const paths: string[] = []
  const walk = (node: JSONContent) => {
    if (node.type === 'image' && typeof node.attrs?.src === 'string') {
      const path = commentImagePathFromSrc(node.attrs.src)
      if (path && isOwnedMediaPath(path, activityId, authorId)) paths.push(path)
    }
    node.content?.forEach(walk)
  }
  walk(content)
  return paths
}
