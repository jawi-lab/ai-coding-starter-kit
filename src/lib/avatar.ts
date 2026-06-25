/**
 * Build avatar initials from a display name.
 *
 * Takes the first letter of up to two words, uppercased. Words without any
 * letter (e.g. a stray "–" in "TEST – QA") and empty segments from extra
 * spaces are skipped so they never produce stray output.
 * Returns `fallback` when the name is empty or yields no usable letters.
 */
export function getInitials(
  name: string | null | undefined,
  fallback = 'U',
): string {
  if (!name) return fallback
  const initials = name
    .split(/\s+/)
    .map((word) => word.match(/\p{L}/u)?.[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return initials || fallback
}
