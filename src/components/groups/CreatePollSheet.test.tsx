import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreatePollSheet } from './CreatePollSheet'
import { POLL_MAX_OPTIONS } from '@/lib/activity-types'

// PROJ-14 — CreatePollSheet form validation. The sheet is a controlled Radix
// Dialog (ResponsiveModal); onSubmit is injected, so no Supabase is involved here.
// Mock the mobile/keyboard hooks to avoid window.matchMedia / visualViewport in jsdom.
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }))
vi.mock('@/hooks/useKeyboardInset', () => ({ useKeyboardInset: () => ({ inset: 0, height: 0 }) }))

const mockToastError = vi.fn()
vi.mock('sonner', () => ({ toast: { error: (...a: unknown[]) => mockToastError(...a) } }))

function setup(onSubmit = vi.fn().mockResolvedValue(true)) {
  const onClose = vi.fn()
  render(<CreatePollSheet open onClose={onClose} onSubmit={onSubmit} />)
  return { onSubmit, onClose }
}

const question = () => screen.getByPlaceholderText('z. B. Welches Restaurant?')
const optionField = (n: number) => screen.getByPlaceholderText(`Option ${n}`)
const save = () => fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))
const type = (el: HTMLElement, v: string) => fireEvent.change(el, { target: { value: v } })

describe('CreatePollSheet — Validation (PROJ-14)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders a question field and two option fields when open', () => {
    setup()
    expect(question()).toBeInTheDocument()
    expect(optionField(1)).toBeInTheDocument()
    expect(optionField(2)).toBeInTheDocument()
  })

  it('shows an error at the question field when the question is empty', async () => {
    const { onSubmit } = setup()
    type(optionField(1), 'A')
    type(optionField(2), 'B')
    save()
    await waitFor(() => expect(screen.getByText('Frage ist erforderlich')).toBeInTheDocument())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects fewer than two filled options and ignores empty fields', async () => {
    const { onSubmit } = setup()
    type(question(), 'Welcher Film?')
    type(optionField(1), 'Nur eine')
    // option 2 left blank
    save()
    await waitFor(() =>
      expect(screen.getByText('Mindestens 2 Antwortoptionen nötig')).toBeInTheDocument()
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects duplicate option texts case-insensitively', async () => {
    const { onSubmit } = setup()
    type(question(), 'Welches Restaurant?')
    type(optionField(1), 'Pizza')
    type(optionField(2), 'pizza')
    save()
    await waitFor(() =>
      expect(screen.getByText('Optionen dürfen sich nicht wiederholen')).toBeInTheDocument()
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits trimmed question and only the filled options', async () => {
    const { onSubmit, onClose } = setup()
    type(question(), '  Welcher Film?  ')
    type(optionField(1), 'Dune')
    type(optionField(2), '   ') // whitespace-only → ignored
    fireEvent.click(screen.getByRole('button', { name: 'Option hinzufügen' }))
    type(optionField(3), 'Oppenheimer')
    save()
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith('Welcher Film?', ['Dune', 'Oppenheimer'])
    )
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('caps the option list at the maximum and hides "Option hinzufügen" there', () => {
    setup()
    const addBtn = () => screen.queryByRole('button', { name: 'Option hinzufügen' })
    // Start at 2 options; click until the cap.
    for (let i = 2; i < POLL_MAX_OPTIONS; i++) {
      fireEvent.click(addBtn() as HTMLElement)
    }
    expect(optionField(POLL_MAX_OPTIONS)).toBeInTheDocument()
    expect(addBtn()).toBeNull()
  })

  it('keeps the entered values and toasts when the API rejects the poll', async () => {
    const onSubmit = vi.fn().mockResolvedValue(false)
    const { onClose } = setup(onSubmit)
    type(question(), 'Welches Restaurant?')
    type(optionField(1), 'Pizza')
    type(optionField(2), 'Sushi')
    save()
    await waitFor(() => expect(mockToastError).toHaveBeenCalled())
    expect(onClose).not.toHaveBeenCalled()
    // Inputs survive the failed attempt (AC Fehlerverhalten).
    expect((question() as HTMLInputElement).value).toBe('Welches Restaurant?')
    expect((optionField(1) as HTMLInputElement).value).toBe('Pizza')
  })
})
