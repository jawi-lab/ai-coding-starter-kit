import { describe, it, expect, vi } from 'vitest'
import { focusDialogUnlessKeyboard } from './input-modality'

function dispatch() {
  const dialog = document.createElement('div')
  dialog.tabIndex = -1
  document.body.appendChild(dialog)
  const event = new Event('focusScope.autoFocusOnMount', { cancelable: true })
  const focus = vi.spyOn(dialog, 'focus')
  dialog.addEventListener(event.type, focusDialogUnlessKeyboard)
  dialog.dispatchEvent(event)
  return { event, focus }
}

describe('focusDialogUnlessKeyboard', () => {
  it('fokussiert nach Zeigerbedienung den Dialog statt des ersten Elements', () => {
    window.dispatchEvent(new Event('pointerdown'))
    const { event, focus } = dispatch()
    expect(event.defaultPrevented).toBe(true)
    expect(focus).toHaveBeenCalled()
  })

  it('lässt Radix nach Tastaturbedienung das erste Element fokussieren', () => {
    window.dispatchEvent(new Event('keydown'))
    const { event, focus } = dispatch()
    expect(event.defaultPrevented).toBe(false)
    expect(focus).not.toHaveBeenCalled()
  })
})
