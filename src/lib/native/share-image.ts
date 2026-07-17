/**
 * Native image-share bridge for the Mellon Rückblick (PROJ-18).
 *
 * Same shape as the calendar export (PROJ-7/9): a data-URL download is silently
 * dropped inside the Capacitor WebView, so natively we write the PNG to the
 * app's cache directory and hand its file URL to the OS share sheet.
 *
 * Only ever called behind `isNativePlatform()` (see src/lib/wrapped-share.ts).
 */
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface ShareImageNativeOptions {
  /** Base64 payload WITHOUT the `data:image/png;base64,` prefix. */
  base64: string;
  /** Sanitised filename, e.g. `Mellon-Rueckblick-2026.png`. */
  filename: string;
  /** Human-readable title for the share sheet. */
  title: string;
}

/**
 * Writes the PNG to the cache directory and opens the native share sheet.
 *
 * A write failure is re-thrown for the caller; a user-cancelled share (rejects
 * on some platforms) is swallowed so a dismissal is never surfaced as an error.
 */
export async function shareImageNative({ base64, filename, title }: ShareImageNativeOptions): Promise<void> {
  // Binary write: no `encoding` means Filesystem treats `data` as base64.
  const { uri } = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  });

  try {
    await Share.share({ title, url: uri, dialogTitle: title });
  } catch {
    // User dismissed the share sheet (or no share target) — not an error.
  }
}
