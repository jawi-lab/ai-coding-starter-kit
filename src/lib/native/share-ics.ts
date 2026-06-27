/**
 * Native calendar-export bridge (PROJ-9).
 *
 * The web build saves the `.ics` via a hidden `<a download>` anchor — but that
 * download is silently dropped inside the Capacitor WebView. Natively we instead
 * write the file to the app's cache directory and hand its file URL to the OS
 * share sheet (@capacitor/share), from which the user picks "Add to Calendar".
 *
 * Only ever called behind `isNativePlatform()` (see src/lib/ical-export.ts).
 */
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface ShareIcsOptions {
  /** Full RFC-5545 .ics document. */
  content: string;
  /** Sanitised filename, e.g. `Wandertag.ics`. */
  filename: string;
  /** Human-readable title for the share sheet (the event name). */
  title: string;
}

/**
 * Writes the `.ics` to the cache directory and opens the native share sheet.
 *
 * Resolves once the sheet has been shown (or dismissed). A user-cancelled share
 * rejects on some platforms; that is swallowed here so a dismissal is never
 * surfaced as an error. A genuine write failure is re-thrown for the caller.
 */
export async function shareIcsNative({ content, filename, title }: ShareIcsOptions): Promise<void> {
  // Write first — a failure here is a real error worth propagating.
  const { uri } = await Filesystem.writeFile({
    path: filename,
    data: content,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });

  try {
    await Share.share({
      title,
      url: uri,
      dialogTitle: title,
    });
  } catch {
    // User dismissed the share sheet (or no share target) — not an error.
  }
}
