/**
 * Native avatar-capture bridge (PROJ-9).
 *
 * The web build opens a hidden `<input type=file>`; natively we instead use
 * @capacitor/camera so the user gets the OS action sheet to choose between the
 * camera and the photo library (`CameraSource.Prompt`). The chosen image is
 * resized/re-encoded to a small JPEG and returned as a `File`, which the
 * existing `uploadAvatar(file)` flow consumes unchanged.
 *
 * Only ever called behind `isNativePlatform()` (see ProfileSection).
 */
import { Camera, CameraResultType, CameraSource, type Photo } from '@capacitor/camera';

/** Avatars never need more than this — keeps the upload well under the 5 MB cap. */
const AVATAR_MAX_DIMENSION = 1024;

export type AvatarPickResult =
  | { status: 'picked'; file: File }
  | { status: 'cancelled' }
  | { status: 'denied' };

type CameraErrorKind = 'cancelled' | 'denied' | 'other';

/**
 * Classify a `Camera.getPhoto` rejection.
 *
 * Capacitor surfaces a user dismissal and a permission refusal as ordinary
 * thrown errors with descriptive messages. We distinguish the two so the caller
 * can stay silent on cancel but guide the user to Settings on a denial.
 */
export function classifyCameraError(err: unknown): CameraErrorKind {
  const message = (err instanceof Error ? err.message : String(err)).toLowerCase();
  if (message.includes('cancel')) return 'cancelled';
  if (
    message.includes('denied') ||
    message.includes('permission') ||
    message.includes('not authorized') ||
    message.includes('no access')
  ) {
    return 'denied';
  }
  return 'other';
}

/** Turn a Capacitor `Photo` (URI result) into a `File` named `avatar.<ext>`. */
async function photoToFile(photo: Photo): Promise<File> {
  if (!photo.webPath) throw new Error('Camera returned no image path');
  const blob = await fetch(photo.webPath).then((res) => res.blob());
  const format = photo.format || 'jpeg';
  const ext = format === 'jpeg' ? 'jpg' : format;
  const type = blob.type || `image/${format}`;
  return new File([blob], `avatar.${ext}`, { type });
}

/**
 * Opens the native camera / photo-library chooser and returns the selected
 * image as a `File`.
 *
 * - `picked`    — image chosen, ready to upload.
 * - `cancelled` — the user dismissed the picker (not an error).
 * - `denied`    — camera/photo permission was refused; the caller should guide
 *                 the user to the system settings.
 * A genuine/unexpected failure is re-thrown for the caller to surface generically.
 */
export async function pickAvatarPhoto(): Promise<AvatarPickResult> {
  let photo: Photo;
  try {
    photo = await Camera.getPhoto({
      source: CameraSource.Prompt,
      resultType: CameraResultType.Uri,
      quality: 80,
      width: AVATAR_MAX_DIMENSION,
      height: AVATAR_MAX_DIMENSION,
      correctOrientation: true,
      promptLabelHeader: 'Profilbild',
      promptLabelPhoto: 'Aus Mediathek',
      promptLabelPicture: 'Kamera',
      promptLabelCancel: 'Abbrechen',
    });
  } catch (err) {
    const kind = classifyCameraError(err);
    if (kind === 'cancelled') return { status: 'cancelled' };
    if (kind === 'denied') return { status: 'denied' };
    throw err;
  }

  return { status: 'picked', file: await photoToFile(photo) };
}
