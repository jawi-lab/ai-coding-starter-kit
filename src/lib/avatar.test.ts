import { describe, it, expect } from 'vitest'
import { getInitials } from './avatar'

describe('getInitials', () => {
  it('takes the first letter of up to two words, uppercased', () => {
    expect(getInitials('Janusz Wickbold')).toBe('JW')
    expect(getInitials('anna')).toBe('A')
    expect(getInitials('Anna Maria Schmidt')).toBe('AM')
  })

  it('returns the fallback for empty or missing names', () => {
    expect(getInitials(null)).toBe('U')
    expect(getInitials(undefined)).toBe('U')
    expect(getInitials('')).toBe('U')
    expect(getInitials(null, 'X')).toBe('X')
  })

  it('skips empty segments from extra spaces (no undefined output)', () => {
    expect(getInitials('Janusz  Wickbold')).toBe('JW')
    expect(getInitials('  Anna')).toBe('A')
  })
})
