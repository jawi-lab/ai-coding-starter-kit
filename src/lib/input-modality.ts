// Merkt sich, ob zuletzt Tastatur oder Zeiger benutzt wurde. Radix fokussiert beim
// Öffnen das erste Element; iOS-WebKit zeigt dort auch nach einem Tipp den Fokusring.
let lastInput: 'keyboard' | 'pointer' = 'pointer'

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', () => { lastInput = 'keyboard' }, true)
  window.addEventListener('pointerdown', () => { lastInput = 'pointer' }, true)
}

/**
 * Für `onOpenAutoFocus`: Nach Zeigerbedienung erhält der Dialog selbst den Fokus,
 * sodass kein Ring erscheint und Tab beim ersten Element beginnt. Nach
 * Tastaturbedienung bleibt das Verhalten von Radix unverändert.
 */
export function focusDialogUnlessKeyboard(event: Event): void {
  if (lastInput === 'keyboard') return
  event.preventDefault()
  ;(event.currentTarget as HTMLElement | null)?.focus({ preventScroll: true })
}
