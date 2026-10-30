import { z } from 'zod'

export type GroupRole = 'admin' | 'editor' | 'observer'

/**
 * Max length for a group name. Enforced at creation/rename (input maxLength +
 * schema) and mirrored by the top-bar display truncation, so a name never
 * overflows the header next to the "+", bell and profile icons.
 */
export const MAX_GROUP_NAME_LENGTH = 20

export const groupNameSchema = z
  .string()
  .trim()
  .min(1, 'Gruppenname ist erforderlich')
  .max(MAX_GROUP_NAME_LENGTH, `Gruppenname darf maximal ${MAX_GROUP_NAME_LENGTH} Zeichen lang sein`)

/** Hard-limit a name for display, appending an ellipsis when it was cut. */
export function truncateName(name: string, max = MAX_GROUP_NAME_LENGTH): string {
  if (name.length <= max) return name
  return `${name.slice(0, max).trimEnd()}…`
}

// Alphanumeric, excluding O/0/I/1. Generated server-side (public.new_invite_code).
export const INVITE_CODE_LENGTH = 10

export const ROLE_LABELS: Record<GroupRole, string> = {
  admin: 'Admin',
  editor: 'Redakteur',
  observer: 'Beobachter',
}

export interface Group {
  id: string
  name: string
  invite_code: string | null
  created_by: string
  created_at: string
}

export interface GroupMember {
  group_id: string
  user_id: string
  role: GroupRole
  joined_at: string
  profile: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

export interface GroupWithMeta extends Group {
  member_count: number
  my_role: GroupRole
}
