'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useGroups } from '@/hooks/useGroups'
import { MAX_GROUP_NAME_LENGTH, groupNameSchema } from '@/lib/group-types'
import { useRouter } from 'next/navigation'

interface CreateGroupFormProps {
  onSuccess?: (groupId: string) => void
}

export function CreateGroupForm({ onSuccess }: CreateGroupFormProps) {
  const router = useRouter()
  const { createGroup } = useGroups()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validate(): string | null {
    const result = groupNameSchema.safeParse(name)
    return result.success ? null : result.error.issues[0].message
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSubmitting(true)

    const { groupId, error: createError } = await createGroup(name.trim())

    setSubmitting(false)

    if (createError) {
      setError(createError)
      return
    }

    if (groupId) {
      if (onSuccess) {
        onSuccess(groupId)
      } else {
        router.push(`/groups?group=${groupId}`)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label
          htmlFor="group-name"
          className="text-[13px] font-semibold text-ink-2 tracking-[0.06em]"
        >
          Gruppenname
        </Label>
        <Input
          id="group-name"
          placeholder="z. B. Schulfreunde, WG-Crew…"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (error) setError(null)
          }}
          maxLength={MAX_GROUP_NAME_LENGTH}
          autoFocus
          className="h-11 text-[15px] border-[1.5px] border-line bg-surface rounded-md px-[14px]
                     focus-visible:ring-0 focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--primary-soft)]"
          aria-describedby={error ? 'group-name-error' : undefined}
          aria-invalid={!!error}
        />
        {error && (
          <p id="group-name-error" className="text-[13px] text-error" role="alert">
            {error}
          </p>
        )}
        <p className="text-[12px] text-ink-3">{name.length}/{MAX_GROUP_NAME_LENGTH} Zeichen</p>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold text-[15px]
                   rounded-md tracking-[0.005em]"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird erstellt…
          </>
        ) : (
          'Gruppe erstellen'
        )}
      </Button>
    </form>
  )
}
