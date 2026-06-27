'use client'

import { useRef, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ArrowRight, Camera, Info } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { getInitials } from '@/lib/avatar'
import { isNativePlatform } from '@/lib/native/platform'
import { pickAvatarPhoto } from '@/lib/native/camera'

interface ProfileStepProps {
  onNext: () => void
  onSkip: () => void
}

export function ProfileStep({ onNext, onSkip }: ProfileStepProps) {
  const { profile } = useAuth()
  const { saving, uploadingAvatar, error, setError, updateDisplayName, uploadAvatar } =
    useProfile()
  const [name, setName] = useState(profile?.display_name ?? '')
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const initials = getInitials(name || profile?.display_name)

  async function uploadAndNotify(file: File) {
    const ok = await uploadAvatar(file)
    if (ok) toast.success('Profilbild aktualisiert')
    else toast.error('Profilbild konnte nicht hochgeladen werden')
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Das Bild darf maximal 5 MB groß sein')
      return
    }
    await uploadAndNotify(file)
  }

  // Native (Capacitor): open the camera / photo-library chooser; web falls back
  // to the hidden <input type=file>. Mirrors ProfileSection.
  async function handleAvatarTap() {
    if (!isNativePlatform()) {
      avatarInputRef.current?.click()
      return
    }
    let result
    try {
      result = await pickAvatarPhoto()
    } catch {
      toast.error('Profilbild konnte nicht geladen werden')
      return
    }
    if (result.status === 'cancelled') return
    if (result.status === 'denied') {
      toast.error('Bitte erlaube den Kamera- und Fotozugriff in den Einstellungen')
      return
    }
    await uploadAndNotify(result.file)
  }

  async function handleContinue() {
    const trimmed = name.trim()
    // Only write if the user actually changed their name; otherwise just advance.
    if (trimmed && trimmed !== profile?.display_name) {
      const ok = await updateDisplayName(trimmed)
      if (!ok) return
    }
    onNext()
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1">
        <div className="text-center">
          <h1 className="text-[28px] font-[900] text-ink">Dein Profil</h1>
          <p className="mt-1.5 text-[15px] text-ink-2">
            Wie sollen dich deine Freunde nennen?
          </p>
        </div>

        {/* Avatar picker */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleAvatarTap}
            disabled={uploadingAvatar}
            className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Profilbild wählen"
          >
            <Avatar className="h-24 w-24 border-2 border-dashed border-line">
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
              )}
              <AvatarFallback className="bg-primary-soft text-[28px] font-[800] text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-pill bg-primary text-white shadow-md">
              {uploadingAvatar ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </span>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Name */}
        <div className="mt-8 space-y-2">
          <label
            htmlFor="onboarding-name"
            className="text-[12px] font-[800] uppercase tracking-[0.08em] text-ink-3"
          >
            Name / Nickname
          </label>
          <Input
            id="onboarding-name"
            value={name}
            onChange={e => {
              setName(e.target.value)
              setError(null)
            }}
            maxLength={50}
            placeholder="z.B. Alex Müller"
            className="h-12 rounded-[14px] border-line bg-surface text-[15px] text-ink"
            onKeyDown={e => {
              if (e.key === 'Enter') handleContinue()
            }}
          />
          {error && <p className="text-[12px] text-error">{error}</p>}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-[14px] bg-surface-2 p-3">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-3" />
          <p className="text-[13px] leading-snug text-ink-2">
            Dein Profil ist für Gruppenmitglieder sichtbar.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleContinue}
          disabled={saving}
          className="h-12 w-full rounded-[14px] bg-primary text-[15px] font-[700] text-white hover:bg-primary-600"
        >
          {saving ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        <button
          onClick={onSkip}
          className="w-full py-2 text-center text-[13px] text-ink-3 transition-colors hover:text-ink-2"
        >
          Schritt überspringen
        </button>
      </div>
    </div>
  )
}
