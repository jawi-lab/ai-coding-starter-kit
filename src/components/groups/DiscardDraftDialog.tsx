'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

interface DiscardDraftDialogProps {
  open: boolean
  onKeep: () => void
  onDiscard: () => void
}

/** Rückfrage, bevor ein Formular-Sheet mit ungespeicherten Eingaben schließt. */
export function DiscardDraftDialog({ open, onKeep, onDiscard }: DiscardDraftDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onKeep()}>
      <AlertDialogContent className="bg-surface border-line rounded-lg w-[calc(100%-2rem)] max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[18px] font-[800] text-ink">
            Eingaben verwerfen?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[14px] text-ink-2">
            Deine Eingaben sind noch nicht gespeichert und gehen verloren.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onKeep}
            className="rounded-md border-[1.5px] border-line text-ink font-semibold hover:bg-surface-2"
          >
            Weiter bearbeiten
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDiscard}
            className="rounded-md bg-error text-white font-semibold border-[1.5px] border-error hover:opacity-90"
          >
            Verwerfen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
