import { isNativePlatform } from '@/lib/native/platform'

/**
 * Setzt die Farbe des Statusleisten-Texts für eine eigene Vollbild-Fläche. Capacitor
 * benennt verkehrt herum: `Style.Dark` = heller Text, `Style.Light` = dunkler Text.
 * Ohne Argument gilt wieder das App-Theme. Im Web ohne Wirkung.
 */
export async function setStatusBarText(text?: 'light' | 'dark'): Promise<void> {
  if (!isNativePlatform()) return
  const { StatusBar, Style } = await import('@capacitor/status-bar')
  const light = text ? text === 'light' : document.documentElement.classList.contains('dark')
  await StatusBar.setStyle({ style: light ? Style.Dark : Style.Light }).catch(() => {})
}
