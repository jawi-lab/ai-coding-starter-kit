/**
 * Build avatar initials from a display name.
 *
 * Takes the first letter of up to two words, uppercased. Empty segments
 * (e.g. from double spaces) are skipped so they never produce stray output.
 * Returns `fallback` when the name is empty or yields no usable letters.
 */
export function getInitials(
  name: string | null | undefined,
  fallback = 'U',
): string {
  if (!name) return fallback
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return initials || fallback
}
