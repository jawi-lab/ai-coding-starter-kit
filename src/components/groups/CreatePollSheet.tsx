'use client'

import { useEffect, useState } from 'react'
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import { useKeyboardInset } from '@/hooks/useKeyboardInset'
import {
  POLL_QUESTION_MAX,
  POLL_OPTION_MAX,
  POLL_MIN_OPTIONS,
  POLL_MAX_OPTIONS,
} from '@/lib/activity-types'

interface CreatePollSheetProps {
  open: boolean
  onClose: () => void
  /** Legt die Umfrage an; gibt true bei Erfolg zurück. */
  onSubmit: (question: string, options: string[]) => Promise<boolean>
}

const INPUT_CLASS =
  'h-11 text-[15px] border-[1.5px] border-line bg-surface rounded-md px-[14px] ' +
  'focus-visible:ring-0 focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--primary-soft)]'

export function CreatePollSheet({ open, onClose, onSubmit }: CreatePollSheetProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [questionError, setQuestionError] = useState('')
  const [optionsError, setOptionsError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isMobile = useIsMobile()
  const keyboard = useKeyboardInset(isMobile && open)

  // Reset bei jedem Öffnen.
  useEffect(() => {
    if (open) {
      setQuestion('')
      setOptions(['', ''])
      setQuestionError('')
      setOptionsError('')
    }
  }, [open])

  function setOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)))
    if (optionsError) setOptionsError('')
  }

  function addOption() {
    setOptions((prev) => (prev.length >= POLL_MAX_OPTIONS ? prev : [...prev, '']))
  }

  function removeOption(index: number) {
    setOptions((prev) => (prev.length <= POLL_MIN_OPTIONS ? prev : prev.filter((_, i) => i !== index)))
  }

  function validate(): { question: string; options: string[] } | null {
    let ok = true
    const q = question.trim()
    if (!q) {
      setQuestionError('Frage ist erforderlich')
      ok = false
    } else if (q.length > POLL_QUESTION_MAX) {
      setQuestionError(`Maximal ${POLL_QUESTION_MAX} Zeichen`)
      ok = false
    }

    const filled = options.map((o) => o.trim()).filter((o) => o.length > 0)
    if (filled.length < POLL_MIN_OPTIONS) {
      setOptionsError(`Mindestens ${POLL_MIN_OPTIONS} Antwortoptionen nötig`)
      ok = false
    } else {
      const seen = new Set(filled.map((o) => o.toLowerCase()))
      if (seen.size !== filled.length) {
        setOptionsError('Optionen dürfen sich nicht wiederholen')
        ok = false
      }
    }

    if (!ok) return null
    return { question: q, options: filled }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valid = validate()
    if (!valid) return

    setSubmitting(true)
    const success = await onSubmit(valid.question, valid.options)
    setSubmitting(false)

    if (success) {
      onClose()
    } else {
      // Eingaben bleiben erhalten (AC Fehlerverhalten).
      toast.error('Umfrage konnte nicht erstellt werden. Bitte erneut versuchen.')
    }
  }

  return (
    <ResponsiveModal open={open} onOpenChange={(o) => !o && onClose()}>
      <ResponsiveModalContent
        size="md"
        className="rounded-t-[30px] bg-bg border-line p-0"
        style={
          keyboard.inset > 0
            ? { bottom: keyboard.inset, height: keyboard.height, maxHeight: 'none' }
            : undefined
        }
      >
        <ResponsiveModalHeader className="px-5 pt-5 pb-4 border-b border-line flex-shrink-0">
          <ResponsiveModalTitle className="text-[18px] font-[800] text-ink">
            Umfrage starten
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="sr-only">
            Formular für eine Frage und mindestens zwei Antwortoptionen.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Frage */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-[700] text-ink-2 tracking-[0.06em]">
              Frage <span className="text-error">*</span>
            </Label>
            <Input
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value)
                if (questionError) setQuestionError('')
              }}
              placeholder="z. B. Welches Restaurant?"
              maxLength={POLL_QUESTION_MAX}
              className={INPUT_CLASS}
              aria-invalid={!!questionError}
            />
            {questionError && <p className="text-[12.5px] text-error">{questionError}</p>}
            <p className="text-[11.5px] text-ink-3">
              {question.length}/{POLL_QUESTION_MAX}
            </p>
          </div>

          {/* Optionen */}
          <div className="space-y-2">
            <Label className="text-[13px] font-[700] text-ink-2 tracking-[0.06em]">
              Antwortoptionen <span className="text-error">*</span>
            </Label>
            {options.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={value}
                  onChange={(e) => setOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={POLL_OPTION_MAX}
                  className={`${INPUT_CLASS} flex-1`}
                />
                {options.length > POLL_MIN_OPTIONS && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-sm text-ink-3 hover:text-error hover:bg-error-soft transition-colors"
                    aria-label={`Option ${index + 1} entfernen`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {optionsError && <p className="text-[12.5px] text-error">{optionsError}</p>}
            {options.length < POLL_MAX_OPTIONS && (
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-2 text-[13px] font-[700] text-primary hover:text-primary/80 transition-colors pt-0.5"
              >
                <Plus className="h-4 w-4" />
                Option hinzufügen
              </button>
            )}
            <p className="text-[11.5px] text-ink-3">
              {POLL_MIN_OPTIONS}–{POLL_MAX_OPTIONS} Optionen · je max. {POLL_OPTION_MAX} Zeichen
            </p>
          </div>

          {/* Submit */}
          <div className="pb-6 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 border-[1.5px] border-line text-ink font-[700] text-[15px] rounded-md"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-[700] text-[15px] rounded-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird erstellt…
                </>
              ) : (
                'Speichern'
              )}
            </Button>
          </div>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
