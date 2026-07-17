import { toPng } from 'html-to-image'
import { isNativePlatform } from '@/lib/native/platform'
import { shareImageNative } from '@/lib/native/share-image'

/**
 * Story-Format der geteilten Slide-Bilder (9:16).
 *
 * Die Share-Bühne wird in CSS auf die Design-Größe (360×640) gerendert — so
 * passen dieselben Schriftgrößen wie im Viewer — und beim Export per
 * `pixelRatio` auf das volle Story-Format 1080×1920 hochskaliert.
 */
export const SHARE_DESIGN_WIDTH = 360
export const SHARE_DESIGN_HEIGHT = 640
export const SHARE_PIXEL_RATIO = 3
export const SHARE_IMAGE_WIDTH = SHARE_DESIGN_WIDTH * SHARE_PIXEL_RATIO // 1080
export const SHARE_IMAGE_HEIGHT = SHARE_DESIGN_HEIGHT * SHARE_PIXEL_RATIO // 1920

export type ShareResult = 'shared' | 'downloaded' | 'cancelled' | 'error'

/** Sicherer PNG-Dateiname aus dem Slide-Titel. */
export function wrappedImageFileName(label: string): string {
  const base = label.replace(/[^a-z0-9äöüÄÖÜß]/gi, '-').replace(/-+/g, '-').slice(0, 60) || 'Mellon-Rueckblick'
  return `${base}.png`
}

/**
 * Rendert die unsichtbare Share-Bühne (360×640) als PNG und skaliert dabei per
 * `pixelRatio` aufs Story-Format 1080×1920 hoch. `cacheBust` umgeht
 * Bild-Caching-Fallstricke.
 */
export async function nodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    width: SHARE_DESIGN_WIDTH,
    height: SHARE_DESIGN_HEIGHT,
    pixelRatio: SHARE_PIXEL_RATIO,
    cacheBust: true,
  })
}

function dataUrlToBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(',')
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob()
  return new File([blob], filename, { type: 'image/png' })
}

/**
 * Teilt ein gerendertes Slide-Bild.
 *
 * - **Native (Capacitor):** PNG in den App-Cache schreiben, natives Share-Sheet
 *   öffnen (erprobtes PROJ-7/9-Muster).
 * - **Web mit Datei-Web-Share:** `navigator.share` mit der PNG-Datei.
 * - **Web ohne Web-Share:** Download über einen versteckten `<a download>`.
 *
 * Wirft nie — der Aufrufer bekommt ein `ShareResult` für die UI-Rückmeldung.
 */
export async function shareWrappedImage(dataUrl: string, title: string, filename: string): Promise<ShareResult> {
  try {
    if (isNativePlatform()) {
      await shareImageNative({ base64: dataUrlToBase64(dataUrl), filename, title })
      return 'shared'
    }

    // Web: bevorzugt das native Teilen-Sheet des Browsers, wenn es Dateien kann.
    const file = await dataUrlToFile(dataUrl, filename)
    const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean }
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], title })
        return 'shared'
      } catch (err) {
        // Abbruch durch die/den Nutzer:in ist kein Fehler.
        if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
        // Sonst auf Download zurückfallen.
      }
    }

    // Fallback: Download.
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return 'downloaded'
  } catch {
    return 'error'
  }
}
