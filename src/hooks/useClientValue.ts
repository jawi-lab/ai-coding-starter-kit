'use client'

import { useSyncExternalStore } from 'react'

/** Der Wert ändert sich nach dem Laden nicht mehr — es gibt nichts zu abonnieren. */
const noSubscribe = () => () => {}

/**
 * Liest einen Wert, den es nur im Browser gibt (URL-Parameter, localStorage),
 * ohne ihn per Effect in State zu schreiben.
 *
 * Beim Prerender (Static Export) und während der Hydration gilt `serverValue`,
 * danach der echte Wert — genau das leistet `useSyncExternalStore` für externe
 * Quellen. Gegenüber „im Effect lesen und setzen" spart das eine Render-Runde
 * nach dem Mount (react-hooks/set-state-in-effect) und hält die Hydration
 * stabil, weil der erste Client-Render dasselbe liefert wie das Markup.
 *
 * `read` muss bei jedem Aufruf einen wertgleichen Wert liefern (String, Zahl,
 * null …). Ein jedes Mal neu gebautes Objekt oder Array führt zur Endlosschleife.
 */
export function useClientValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(noSubscribe, read, () => serverValue)
}
