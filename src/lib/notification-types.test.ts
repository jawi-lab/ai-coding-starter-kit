import { describe, it, expect } from 'vitest'
import {
  DEFAULT_PREFERENCE,
  EVENT_META,
  NOTIFICATION_EVENTS,
  formatBadgeCount,
} from './notification-types'

describe('formatBadgeCount', () => {
  it('hides the badge at zero or below', () => {
    expect(formatBadgeCount(0)).toBe('')
    expect(formatBadgeCount(-3)).toBe('')
  })

  it('shows the exact count up to 99', () => {
    expect(formatBadgeCount(1)).toBe('1')
    expect(formatBadgeCount(99)).toBe('99')
  })

  it('caps at "99+" above 99', () => {
    expect(formatBadgeCount(100)).toBe('99+')
    expect(formatBadgeCount(1500)).toBe('99+')
  })
})

describe('notification event metadata', () => {
  it('covers exactly the six notification events', () => {
    expect(NOTIFICATION_EVENTS).toEqual([
      'new_proposal',
      'now_planning',
      'date_set',
      'mention',
      'responsibility',
      'umfrage_erstellt',
    ])
  })

  it('has a label + description for every event', () => {
    for (const event of NOTIFICATION_EVENTS) {
      expect(EVENT_META[event].label.length).toBeGreaterThan(0)
      expect(EVENT_META[event].description.length).toBeGreaterThan(0)
    }
  })

  it('defaults to push on, email off (opt-in email)', () => {
    expect(DEFAULT_PREFERENCE).toEqual({ push_enabled: true, email_enabled: false })
  })
})
