export type DurationCategory = 'spontan' | 'wochenende' | 'laengerer_zeitraum'
export type ActivityStatus = 'vorschlag' | 'zu_planen' | 'geplant' | 'abgeschlossen'

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
