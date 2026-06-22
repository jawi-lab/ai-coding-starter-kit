export type DurationCategory = 'spontan' | 'wochenende' | 'laengerer_zeitraum'
export type ActivityStatus =
  | 'vorschlag'
  | 'zu_planen'
  | 'geplant'
  | 'in_planung'
  | 'planung_abgeschlossen'
  | 'abgeschlossen'

export const KANBAN_STATUSES = [
  'zu_planen',
  'in_planung',
  'planung_abgeschlossen',
  'abgeschlossen',
] as const satisfies ActivityStatus[]

export type KanbanStatus = (typeof KANBAN_STATUSES)[number]

export const KANBAN_COLUMN_LABELS: Record<KanbanStatus, string> = {
  zu_planen: 'Zu Planen',
  in_planung: 'In Planung',
  planung_abgeschlossen: 'Planung abgeschlossen',
  abgeschlossen: 'Abgeschlossen',
}

export interface Activity {
  id: string
  group_id: string
  initiator_id: string
  name: string
  duration_category: DurationCategory
  required_votes: number
  current_votes: number
  url: string | null
  description: string | null
  og_image_url: string | null
  status: ActivityStatus
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface ActivityWithInitiator extends Activity {
  initiator: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

export interface CreateActivityInput {
  name: string
  duration_category: DurationCategory
  required_votes: number
  url?: string
  description?: string
  og_image_url?: string
}

export interface UpdateActivityInput {
  name?: string
  duration_category?: DurationCategory
  required_votes?: number
  url?: string | null
  description?: string | null
  og_image_url?: string | null
}

export const DURATION_CATEGORY_LABELS: Record<DurationCategory, string> = {
  spontan: 'Spontan',
  wochenende: 'Wochenende',
  laengerer_zeitraum: 'Längerer Zeitraum',
}

export const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=640&q=80'
